import { useRef, useState, useEffect } from 'react';
import { useAIGenerate, type GeneratedTemplate } from '@/features/ai-studio/useAIGenerate';
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

const SUGGESTIONS = [
  'A recipe app with ingredients, steps, and meal categories',
  'A fitness tracker with workouts, exercises, and progress',
  'A bookstore with catalog, reviews, and shopping cart',
  'A travel planner with trips, destinations, and expenses',
];

const STATUS_MESSAGES = [
  'Understanding your app idea...',
  'Designing the screens...',
  'Setting up datasources...',
  'Wiring up navigation...',
  'Building components...',
  'Adding sample data...',
  'Polishing the details...',
  'Almost there...',
];

export function AIEditorChat({
  onCreated,
}: {
  onCreated: (project: any) => void;
}) {
  const {
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
  } = useAIGenerate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setStatusIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setStatusIndex((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev,
      );
    }, 8000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, generatedTemplate, statusIndex]);

  const handleCreate = async () => {
    const project = await createProject();
    if (project) onCreated(project);
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 px-1">
        <div ref={scrollRef} className="space-y-3 py-2">
          {messages.length === 0 && !isGenerating && (
            <EmptyState onSuggestionClick={sendMessage} />
          )}

          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {isGenerating && (
            <GeneratingIndicator message={STATUS_MESSAGES[statusIndex]} />
          )}

          {error && <ErrorState error={error} onRetry={retry} />}

          {generatedTemplate && (
            <TemplatePreviewCard
              template={generatedTemplate}
              isCreating={isCreating}
              onCreate={handleCreate}
              onRefine={() => {
                clearTemplate();
                inputRef.current?.focus();
              }}
            />
          )}
        </div>
      </ScrollArea>

      <ChatInput
        ref={inputRef}
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        isGenerating={isGenerating}
        hasMessages={messages.length > 0}
      />
    </div>
  );
}

/* ─── Sub-components ─── */

function EmptyState({ onSuggestionClick }: { onSuggestionClick: (text: string) => void }) {
  return (
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
            onClick={() => onSuggestionClick(s)}
            className="w-full text-left text-xs p-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: { role: string; content: string } }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-[13px] leading-relaxed ${
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-secondary text-secondary-foreground rounded-bl-md'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}

function GeneratingIndicator({ message }: { message: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
        <span className="text-xs text-muted-foreground transition-opacity duration-300">
          {message}
        </span>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="mx-1 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 text-xs gap-1.5"
            onClick={onRetry}
          >
            <RotateCcw className="w-3 h-3" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

function TemplatePreviewCard({
  template,
  isCreating,
  onCreate,
  onRefine,
}: {
  template: GeneratedTemplate;
  isCreating: boolean;
  onCreate: () => void;
  onRefine: () => void;
}) {
  return (
    <div className="mx-1 rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{template.icon}</span>
          <h4 className="text-sm font-semibold text-foreground">
            {template.name}
          </h4>
        </div>
        <p className="text-xs text-muted-foreground">
          {template.description}
        </p>
      </div>

      <div className="px-4 py-3 flex items-center gap-2 flex-wrap">
        <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
          <Database className="w-3 h-3" />
          {template.datasources.length} datasource
          {template.datasources.length !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
          <Layout className="w-3 h-3" />
          {template.nodes.length} screen
          {template.nodes.length !== 1 ? 's' : ''}
        </Badge>
        <Badge variant="secondary" className="gap-1 text-[11px] font-normal">
          <GitBranch className="w-3 h-3" />
          {template.edges.length} connection
          {template.edges.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <TemplateDetails template={template} />

      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Button
          size="sm"
          className="flex-1 gap-1.5"
          onClick={onCreate}
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
        <Button size="sm" variant="outline" onClick={onRefine}>
          Refine
        </Button>
      </div>
    </div>
  );
}

function TemplateDetails({ template }: { template: GeneratedTemplate }) {
  return (
    <div className="px-4 pb-3 space-y-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Data
        </p>
        {template.datasources.map((ds: any) => (
          <div
            key={ds.id}
            className="flex items-center justify-between text-xs py-0.5"
          >
            <span className="text-foreground">{ds.name}</span>
            <span className="text-muted-foreground">{ds.fields.length} fields</span>
          </div>
        ))}
      </div>

      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Screens
        </p>
        {template.nodes.map((node: any) => (
          <div
            key={node.id}
            className="flex items-center justify-between text-xs py-0.5"
          >
            <span className="text-foreground">{node.label}</span>
            <Badge variant="outline" className="text-[10px] h-4 font-normal">
              {node.type}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

import { forwardRef } from 'react';

const ChatInput = forwardRef<
  HTMLInputElement,
  {
    value: string;
    onChange: (value: string) => void;
    onSend: (text: string) => void;
    isGenerating: boolean;
    hasMessages: boolean;
  }
>(({ value, onChange, onSend, isGenerating, hasMessages }, ref) => (
  <div className="shrink-0 px-3 py-3 border-t border-border">
    <div className="flex items-center gap-2">
      <Input
        ref={ref}
        placeholder={hasMessages ? 'Refine your app...' : 'Describe your app...'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSend(value)}
        disabled={isGenerating}
        className="h-9 text-sm"
      />
      <Button
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => onSend(value)}
        disabled={!value.trim() || isGenerating}
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </Button>
    </div>
  </div>
));
ChatInput.displayName = 'ChatInput';
