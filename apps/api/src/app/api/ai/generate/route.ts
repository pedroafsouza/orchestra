import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requireAuth } from '@/lib/session';
import { generateTemplate, type ChatMessage } from '@/lib/gemini';
import { ProjectTemplateSchema } from '@orchestra/shared';

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.string().min(1).max(5000),
    })
  ).min(1).max(10),
});

export async function POST(req: NextRequest) {
  const { error: authError } = await requireAuth();
  if (authError) return authError;

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch (e) {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, any>) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const geminiStream = await generateTemplate(body.messages as ChatMessage[]);
        let accumulated = '';

        for await (const chunk of geminiStream) {
          const text = chunk.text();
          if (text) {
            accumulated += text;
            send({ chunk: text });
          }
        }

        // Parse and validate the complete JSON
        let template: any;
        try {
          template = JSON.parse(accumulated);
        } catch {
          send({ done: true, error: 'AI generated invalid JSON. Please try again with a clearer description.' });
          controller.close();
          return;
        }

        const validation = ProjectTemplateSchema.safeParse(template);
        if (!validation.success) {
          const issues = validation.error.issues.map(
            (i) => `${i.path.join('.')}: ${i.message}`
          );
          send({
            done: true,
            error: 'Generated template has structural issues',
            details: issues.slice(0, 10),
            rawTemplate: template,
          });
          controller.close();
          return;
        }

        send({ done: true, template: validation.data });
      } catch (err: any) {
        console.error('[ai/generate] Error:', err?.message || err, 'Status:', err?.status, 'Details:', JSON.stringify(err?.errorDetails || err?.response?.data || ''));
        const message =
          err?.status === 429
            ? 'AI service rate limited. Please wait a moment and try again.'
            : `AI generation failed: ${err?.message || 'Unknown error'}`;
        send({ done: true, error: message });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
