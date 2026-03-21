import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ClipboardList, Home, UtensilsCrossed, X } from 'lucide-react';

interface TemplateSummary {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// SVG illustration for template cards
function TemplateIllustration({ templateId }: { templateId: string }) {
  if (templateId === 'todo-list') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
        <ClipboardList className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (templateId === 'bnb') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center shadow-md shadow-rose-500/20">
        <Home className="w-5 h-5 text-white" />
      </div>
    );
  }
  if (templateId === 'restaurant') {
    return (
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md shadow-orange-500/20">
        <UtensilsCrossed className="w-5 h-5 text-white" />
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-md">
      <Plus className="w-5 h-5 text-white" />
    </div>
  );
}

export function CreateProjectFlyout({
  open,
  onClose,
  templates,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  templates: TemplateSummary[];
  onCreated: (project: any) => void;
}) {
  const [name, setName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Reset state when flyout opens
  useEffect(() => {
    if (open) {
      setName('');
      setSelectedTemplate(null);
      setCreating(false);
    }
  }, [open]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setCreating(true);
    try {
      const project = await api('/api/projects', {
        method: 'POST',
        body: { name, ...(selectedTemplate ? { templateId: selectedTemplate } : {}) },
      });
      onCreated(project);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create project');
      setCreating(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Flyout panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">New Project</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Project name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Project name
            </label>
            <Input
              placeholder="My awesome app..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="h-10"
            />
          </div>

          {/* Template selection */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Start from
            </p>
            <div className="space-y-2">
              {/* Blank option */}
              <button
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  selectedTemplate === null
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/30'
                }`}
                onClick={() => setSelectedTemplate(null)}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Blank</p>
                  <p className="text-[11px] text-muted-foreground">Empty project</p>
                </div>
              </button>

              {/* Templates */}
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                    selectedTemplate === tpl.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                  onClick={() => setSelectedTemplate(tpl.id)}
                >
                  <div className="shrink-0">
                    <TemplateIllustration templateId={tpl.id} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{tpl.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border shrink-0">
          <Button
            className="flex-1"
            disabled={!name.trim() || creating}
            onClick={handleCreate}
          >
            {creating ? 'Creating...' : 'Create Project'}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
