import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderKanban, Users, Trash2, Clock } from 'lucide-react';
import { getGradient, getInitials, timeAgo } from '@/lib/projectUtils';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    guid: string;
    updatedAt: string;
    _count?: { flows?: number; members?: number };
  };
  onDelete: (target: { id: string; name: string }) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const gradient = getGradient(project.name);
  const initials = getInitials(project.name);

  return (
    <Card
      className="cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-primary/30 transition-all duration-200 group overflow-hidden"
      onClick={() => navigate(`/project/${project.id}`)}
    >
      {/* Decorative banner */}
      <div className={`h-32 bg-gradient-to-br ${gradient} relative overflow-hidden`}>
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-black/10 blur-sm" />
        <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute right-12 -bottom-6 w-20 h-20 rounded-full bg-black/10 blur-sm" />
        <div className="absolute right-14 -bottom-4 w-16 h-16 rounded-full bg-white/10" />
        <div className="absolute -left-4 top-6 w-14 h-14 rounded-2xl rotate-12 bg-white/[0.07]" />
        <div className="absolute left-20 -top-3 w-10 h-10 rounded-lg rotate-45 bg-white/[0.06]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute left-4 bottom-3 text-3xl font-extrabold text-white/25 tracking-wider drop-shadow-sm">
          {initials}
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white hover:bg-white/20"
          onClick={(e) => {
            e.stopPropagation();
            onDelete({ id: project.id, name: project.name });
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold group-hover:text-primary transition-colors mb-0.5">
          {project.name}
        </h3>
        <p className="text-[11px] text-muted-foreground font-mono mb-3">
          {project.guid}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FolderKanban className="w-3 h-3" />
            {project._count?.flows ?? 0} flows
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {project._count?.members ?? 0} members
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Clock className="w-3 h-3" />
            {timeAgo(project.updatedAt)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
