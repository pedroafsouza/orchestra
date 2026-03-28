import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAIGenerate, type GeneratedTemplate } from '@/features/ai-studio/useAIGenerate';
import { useProjectStore } from '@/features/projects/projectStore';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sparkles,
  Send,
  Loader2,
  AlertCircle,
  RotateCcw,
  Database,
  Layout,
  GitBranch,
  UtensilsCrossed,
  Dumbbell,
  BookOpen,
  Plane,
  ArrowLeft,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';

/* ─── Constants ─── */

const SUGGESTIONS: { text: string; title: string; icon: LucideIcon }[] = [
  { text: 'A recipe app with ingredients, steps, and meal categories', title: 'Recipe App', icon: UtensilsCrossed },
  { text: 'A fitness tracker with workouts, exercises, and progress', title: 'Fitness Tracker', icon: Dumbbell },
  { text: 'A bookstore with catalog, reviews, and shopping cart', title: 'Bookstore', icon: BookOpen },
  { text: 'A travel planner with trips, destinations, and expenses', title: 'Travel Planner', icon: Plane },
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

/* ─── Main Page ─── */

export function AIStudioPage() {
  const navigate = useNavigate();
  const { addProject } = useProjectStore();
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
    retry,
  } = useAIGenerate();

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [createdProject, setCreatedProject] = useState<any | null>(null);
  const lastTemplateRef = useRef<string | null>(null);
  const [statusIndex, setStatusIndex] = useState(0);

  // Auto-create project when template arrives
  useEffect(() => {
    if (!generatedTemplate) return;
    const templateKey = generatedTemplate.id + generatedTemplate.name;
    if (lastTemplateRef.current === templateKey) return;
    lastTemplateRef.current = templateKey;

    createProject().then((project) => {
      if (project) {
        setCreatedProject(project);
        addProject(project);
      }
    });
  }, [generatedTemplate]);

  // Rotating status messages
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

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isGenerating, statusIndex, createdProject]);

  const handleOpenProject = () => {
    if (createdProject) navigate(`/project/${createdProject.id}`);
  };

  const hasMessages = messages.length > 0 || isGenerating;

  return (
    <div className="min-h-screen text-foreground flex flex-col bg-[radial-gradient(ellipse_at_top_left,hsl(var(--background-gradient-from)),hsl(var(--background-gradient-via))_50%,hsl(var(--background-gradient-to)))]">
      <AIStudioHeader />

      {!hasMessages ? (
        <EmptyState
          input={input}
          onInputChange={setInput}
          onSend={sendMessage}
          inputRef={inputRef}
        />
      ) : (
        <ChatLayout
          messages={messages}
          isGenerating={isGenerating}
          statusMessage={STATUS_MESSAGES[statusIndex]}
          generatedTemplate={generatedTemplate}
          createdProject={createdProject}
          error={error}
          isCreating={isCreating}
          input={input}
          onInputChange={setInput}
          onSend={sendMessage}
          onRetry={retry}
          onOpenProject={handleOpenProject}
          scrollRef={scrollRef}
          inputRef={inputRef}
        />
      )}
    </div>
  );
}

/* ─── Header ─── */

function AIStudioHeader() {
  return (
    <header className="h-14 border-b border-border/50 flex items-center justify-between px-6 bg-card/60 backdrop-blur-xl sticky top-0 z-50 shrink-0">
      <div className="flex items-center gap-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent tracking-tight">Orchestra</span>
        </Link>
        <span className="text-muted-foreground/40">/</span>
        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Studio
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}

/* ─── Empty State ─── */

function EmptyState({
  input,
  onInputChange,
  onSend,
  inputRef,
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 pb-32">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center mb-6 shadow-xl shadow-violet-500/25">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-foreground mb-2">What do you want to build?</h1>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Describe your app and I'll generate the screens, data, and flow for you.
      </p>
      <SuggestionGrid onSelect={onSend} />
      <PromptInput
        input={input}
        onInputChange={onInputChange}
        onSend={onSend}
        inputRef={inputRef}
        isGenerating={false}
        variant="empty"
      />
    </main>
  );
}

/* ─── Suggestion Grid ─── */

function SuggestionCard({
  title,
  text,
  icon: Icon,
  onClick,
}: {
  title: string;
  text: string;
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 text-left transition-all group"
    >
      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{text}</p>
      </div>
    </button>
  );
}

function SuggestionGrid({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl w-full mb-10">
      {SUGGESTIONS.map((s) => (
        <SuggestionCard
          key={s.text}
          title={s.title}
          text={s.text}
          icon={s.icon}
          onClick={() => onSelect(s.text)}
        />
      ))}
    </div>
  );
}

/* ─── Prompt Input ─── */

function PromptInput({
  input,
  onInputChange,
  onSend,
  inputRef,
  isGenerating,
  variant,
}: {
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  inputRef: React.Ref<HTMLInputElement>;
  isGenerating: boolean;
  variant: 'empty' | 'chat';
}) {
  const isEmpty = variant === 'empty';
  return (
    <div className={isEmpty ? 'w-full max-w-2xl' : 'max-w-2xl mx-auto px-6 py-4'}>
      <div
        className={`flex items-center gap-2 p-2 rounded-2xl border border-border bg-card ${
          isEmpty ? 'shadow-lg shadow-black/5' : 'shadow-sm'
        } focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all`}
      >
        <input
          ref={inputRef}
          placeholder={isEmpty ? 'Describe your app...' : 'Refine your app...'}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend(input)}
          disabled={isGenerating}
          className="flex-1 h-12 px-4 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />
        <Button
          size="icon"
          className="h-10 w-10 rounded-xl shrink-0"
          onClick={() => onSend(input)}
          disabled={!input.trim() || isGenerating}
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
      {isEmpty && (
        <p className="text-center mt-3 text-xs text-muted-foreground">
          Press Enter to send
          <span className="mx-2 text-border">|</span>
          <Link to="/" className="text-primary/70 hover:text-primary transition-colors">
            Or start from a template
          </Link>
        </p>
      )}
    </div>
  );
}

/* ─── Chat Layout ─── */

function ChatLayout({
  messages,
  isGenerating,
  statusMessage,
  generatedTemplate,
  createdProject,
  error,
  isCreating,
  input,
  onInputChange,
  onSend,
  onRetry,
  onOpenProject,
  scrollRef,
  inputRef,
}: {
  messages: { role: string; content: string }[];
  isGenerating: boolean;
  statusMessage: string;
  generatedTemplate: GeneratedTemplate | null;
  createdProject: any | null;
  error: string | null;
  isCreating: boolean;
  input: string;
  onInputChange: (v: string) => void;
  onSend: (text: string) => void;
  onRetry: () => void;
  onOpenProject: () => void;
  scrollRef: React.Ref<HTMLDivElement>;
  inputRef: React.Ref<HTMLInputElement>;
}) {
  return (
    <main className="flex-1 flex overflow-hidden">
      {/* Chat column */}
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="flex-1">
          <div ref={scrollRef} className="max-w-2xl mx-auto px-6 py-6 space-y-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}

            {isGenerating && <GeneratingIndicator message={statusMessage} />}
            {error && <ChatError error={error} onRetry={onRetry} />}

            {generatedTemplate && (
              <div className="lg:hidden">
                <TemplatePreview
                  template={generatedTemplate}
                  project={createdProject}
                  isCreating={isCreating}
                  onOpenProject={onOpenProject}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="shrink-0 border-t border-border bg-background/80 backdrop-blur-sm">
          <PromptInput
            input={input}
            onInputChange={onInputChange}
            onSend={onSend}
            inputRef={inputRef}
            isGenerating={isGenerating}
            variant="chat"
          />
        </div>
      </div>

      {/* Side panel */}
      <aside className="hidden lg:flex w-[420px] shrink-0 border-l border-border/50 bg-card/30 backdrop-blur-sm flex-col">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-6">
          {generatedTemplate ? (
            <TemplatePreview
              template={generatedTemplate}
              project={createdProject}
              isCreating={isCreating}
              onOpenProject={onOpenProject}
            />
          ) : isGenerating ? (
            <SidePanelLoading />
          ) : (
            <SidePanelPlaceholder />
          )}
        </div>
      </aside>
    </main>
  );
}

/* ─── Chat Bubble ─── */

function ChatBubble({ message }: { message: { role: string; content: string } }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-5 py-3 text-base leading-relaxed ${
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

/* ─── Generating Indicator ─── */

function GeneratingIndicator({ message }: { message: string }) {
  return (
    <div className="flex justify-start">
      <div className="bg-secondary rounded-2xl rounded-bl-md px-5 py-3.5 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span className="text-base text-muted-foreground transition-opacity duration-300">
          {message}
        </span>
      </div>
    </div>
  );
}

/* ─── Chat Error ─── */

function ChatError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="ghost" size="sm" className="mt-2 h-8 text-sm gap-1.5" onClick={onRetry}>
            <RotateCcw className="w-3.5 h-3.5" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Template Preview ─── */

function TemplatePreview({
  template,
  project,
  isCreating,
  onOpenProject,
}: {
  template: GeneratedTemplate;
  project: any | null;
  isCreating: boolean;
  onOpenProject: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <TemplateHeader template={template} />
      <TemplateBadges template={template} />
      <TemplateDetails template={template} />
      <TemplateActions project={project} isCreating={isCreating} onOpenProject={onOpenProject} />
    </div>
  );
}

function TemplateHeader({ template }: { template: GeneratedTemplate }) {
  return (
    <div className="px-5 py-4 border-b border-border bg-secondary/30">
      <div className="flex items-center gap-2.5 mb-1.5">
        <span className="text-2xl">{template.icon}</span>
        <h3 className="text-base font-semibold text-foreground">{template.name}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{template.description}</p>
    </div>
  );
}

function TemplateBadges({ template }: { template: GeneratedTemplate }) {
  return (
    <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
      <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
        <Database className="w-3.5 h-3.5" />
        {template.datasources.length} datasource{template.datasources.length !== 1 ? 's' : ''}
      </Badge>
      <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
        <Layout className="w-3.5 h-3.5" />
        {template.nodes.length} screen{template.nodes.length !== 1 ? 's' : ''}
      </Badge>
      <Badge variant="secondary" className="gap-1.5 text-xs font-normal">
        <GitBranch className="w-3.5 h-3.5" />
        {template.edges.length} connection{template.edges.length !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
}

function TemplateDetails({ template }: { template: GeneratedTemplate }) {
  return (
    <div className="px-5 pb-4 space-y-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Data</p>
        {template.datasources.map((ds: any) => (
          <div key={ds.id} className="flex items-center justify-between text-sm py-1">
            <span className="text-foreground">{ds.name}</span>
            <span className="text-muted-foreground text-xs">{ds.fields.length} fields</span>
          </div>
        ))}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Screens</p>
        {template.nodes.map((node: any) => (
          <div key={node.id} className="flex items-center justify-between text-sm py-1">
            <span className="text-foreground">{node.label}</span>
            <Badge variant="outline" className="text-[11px] h-5 font-normal">{node.type}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function TemplateActions({
  project,
  isCreating,
  onOpenProject,
}: {
  project: any | null;
  isCreating: boolean;
  onOpenProject: () => void;
}) {
  return (
    <div className="px-5 py-4 border-t border-border">
      {isCreating ? (
        <Button className="w-full gap-1.5" disabled>
          <Loader2 className="w-4 h-4 animate-spin" />
          Setting up project...
        </Button>
      ) : project ? (
        <Button className="w-full gap-1.5" onClick={onOpenProject}>
          <ExternalLink className="w-4 h-4" />
          Open in Editor
        </Button>
      ) : (
        <Button className="w-full gap-1.5" disabled>
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating project...
        </Button>
      )}
      <p className="text-center mt-2.5 text-xs text-muted-foreground">
        Keep typing to refine — the project will update automatically
      </p>
    </div>
  );
}

/* ─── Side Panel States ─── */

function SidePanelLoading() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Loader2 className="w-6 h-6 animate-spin text-primary mb-4" />
      <p className="text-sm text-muted-foreground">Generating your app...</p>
    </div>
  );
}

function SidePanelPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-4">
        <Sparkles className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Your generated app will appear here</p>
    </div>
  );
}
