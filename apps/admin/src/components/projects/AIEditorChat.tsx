import { useRef, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Send,
  Sparkles,
  Database,
  Layout,
  GitBranch,
  Loader2,
  AlertCircle,
  RotateCcw,
  Check,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  datasources: any[];
  nodes: any[];
  edges: any[];
}

const API_URL = import.meta.env.VITE_API_URL || '';

const SUGGESTIONS = [
  'A recipe app with ingredients, steps, and meal categories',
  'A fitness tracker with workouts, exercises, and progress',
  'A bookstore with catalog, reviews, and shopping cart',
  'A travel planner with trips, destinations, and expenses',
];

export function AIEditorChat({
  onCreated,
}: {
  onCreated: (project: any) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] =
    useState<GeneratedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, generatedTemplate]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isGenerating) return;

    const userMessage: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setError(null);
    setGeneratedTemplate(null);
    setIsGenerating(true);

    try {
      const res = await fetch(`${API_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse SSE events from buffer
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              if (data.template) {
                setGeneratedTemplate(data.template);
                // Add assistant message summarizing what was generated
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'model',
                    content: `I've generated **${data.template.name}** — ${data.template.description}`,
                  },
                ]);
              } else if (data.error) {
                setError(data.error);
                if (data.details) {
                  setError(
                    `${data.error}: ${data.details.slice(0, 3).join(', ')}`
                  );
                }
              }
            }
          } catch {
            // Incomplete JSON, skip
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to connect to AI service'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!generatedTemplate || isCreating) return;
    setIsCreating(true);
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: {
          name: generatedTemplate.name,
          template: generatedTemplate,
        },
      });
      onCreated(project);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create project'
      );
      setIsCreating(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    if (messages.length > 0) {
      const lastUserMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'user');
      if (lastUserMsg) {
        // Remove the last pair and resend
        setMessages((prev) => prev.slice(0, -1));
        sendMessage(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 px-1">
        <div ref={scrollRef} className="space-y-3 py-2">
          {/* Empty state */}
          {messages.length === 0 && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">
                Describe your app
              </h3>
              <p className="text-xs text-muted-foreground text-center mb-5 max-w-[260px]">
                Tell me what kind of app you want to build and I'll generate the
                screens, data, and flow for you.
              </p>
              <div className="space-y-2 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="w-full text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message bubbles */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-secondary text-secondary-foreground rounded-bl-md'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Generating indicator */}
          {isGenerating && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">
                  Generating your app...
                </span>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="mx-1 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-destructive">{error}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs gap-1.5"
                    onClick={handleRetry}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Try again
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Template preview card */}
          {generatedTemplate && (
            <div className="mx-1 rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="px-4 py-3 border-b border-border bg-secondary/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{generatedTemplate.icon}</span>
                  <h4 className="text-sm font-semibold text-foreground">
                    {generatedTemplate.name}
                  </h4>
                </div>
                <p className="text-xs text-muted-foreground">
                  {generatedTemplate.description}
                </p>
              </div>

              {/* Stats */}
              <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Database className="w-3 h-3" />
                  {generatedTemplate.datasources.length} datasource
                  {generatedTemplate.datasources.length !== 1 ? 's' : ''}
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <Layout className="w-3 h-3" />
                  {generatedTemplate.nodes.length} screen
                  {generatedTemplate.nodes.length !== 1 ? 's' : ''}
                </Badge>
                <Badge
                  variant="secondary"
                  className="gap-1 text-[11px] font-normal"
                >
                  <GitBranch className="w-3 h-3" />
                  {generatedTemplate.edges.length} connection
                  {generatedTemplate.edges.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Details */}
              <div className="px-4 pb-3 space-y-2">
                {/* Datasources */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Data
                  </p>
                  {generatedTemplate.datasources.map((ds: any) => (
                    <div
                      key={ds.id}
                      className="flex items-center justify-between text-xs py-0.5"
                    >
                      <span className="text-foreground">{ds.name}</span>
                      <span className="text-muted-foreground">
                        {ds.fields.length} fields
                      </span>
                    </div>
                  ))}
                </div>

                {/* Screens */}
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Screens
                  </p>
                  {generatedTemplate.nodes.map((node: any) => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between text-xs py-0.5"
                    >
                      <span className="text-foreground">{node.label}</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] h-4 font-normal"
                      >
                        {node.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="px-4 py-3 border-t border-border flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={handleCreate}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Create Project
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setGeneratedTemplate(null);
                    inputRef.current?.focus();
                  }}
                >
                  Refine
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="shrink-0 px-3 py-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            placeholder={
              messages.length > 0
                ? 'Refine your app...'
                : 'Describe your app...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={isGenerating}
            className="h-9 text-sm"
          />
          <Button
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
