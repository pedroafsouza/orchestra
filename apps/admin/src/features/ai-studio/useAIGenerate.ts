import { useState, useRef } from 'react';
import { api } from '@/lib/api';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface GeneratedTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  datasources: any[];
  nodes: any[];
  edges: any[];
}

const API_URL = import.meta.env.VITE_API_URL || '';

export function useAIGenerate() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTemplate, setGeneratedTemplate] =
    useState<GeneratedTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const projectIdRef = useRef<string | null>(null);

  const createProject = async () => {
    if (!generatedTemplate || isCreating) return null;
    setIsCreating(true);
    try {
      // Delete previous draft if it exists
      if (projectIdRef.current) {
        try {
          await api(`/api/projects/${projectIdRef.current}`, { method: 'DELETE' });
        } catch {
          // Ignore — old project may already be gone
        }
      }

      const project = await api('/api/projects', {
        method: 'POST',
        body: {
          name: generatedTemplate.name,
          template: generatedTemplate,
        },
      });

      projectIdRef.current = project.id;
      return project;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create project',
      );
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearTemplate = () => {
    setGeneratedTemplate(null);
  };

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

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            if (data.done) {
              if (data.template) {
                setGeneratedTemplate(data.template);
                setMessages((prev) => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: `Here's **${data.template.name}** — ${data.template.description}`,
                  },
                ]);
                // (caller can use createProject() to persist)
              } else if (data.error) {
                setError(data.error);
                if (data.details) {
                  setError(
                    `${data.error}: ${data.details.slice(0, 3).join(', ')}`,
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
        err instanceof Error ? err.message : 'Failed to connect to AI service',
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const retry = () => {
    setError(null);
    if (messages.length > 0) {
      const lastUserMsg = [...messages]
        .reverse()
        .find((m) => m.role === 'user');
      if (lastUserMsg) {
        setMessages((prev) => prev.slice(0, -1));
        sendMessage(lastUserMsg.content);
      }
    }
  };

  return {
    messages,
    input,
    setInput,
    isGenerating,
    generatedTemplate,
    error,
    isCreating,
    sendMessage,
    createProject,
    clearTemplate,
    retry,
  };
}
