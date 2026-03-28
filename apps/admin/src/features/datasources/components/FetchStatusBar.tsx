import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Globe,
  Settings2,
} from 'lucide-react';
import type { Datasource } from '../hooks/useDatasources';

interface FetchStatusBarProps {
  datasource: Datasource;
  fetchLoading: boolean;
  onRefresh: () => void;
  onEditConfig: () => void;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function FetchStatusBar({
  datasource,
  fetchLoading,
  onRefresh,
  onEditConfig,
}: FetchStatusBarProps) {
  const config = datasource.sourceConfig as any;
  if (!config) return null;

  const isError = datasource.lastFetchStatus === 'error';
  const isSuccess = datasource.lastFetchStatus === 'success';
  const isPending = datasource.lastFetchStatus === 'pending';

  return (
    <Card className="mb-4">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Globe className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-muted-foreground">
                  {config.method || 'GET'}
                </span>
                <span
                  className="font-mono truncate max-w-[400px]"
                  title={config.url}
                >
                  {config.url}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                {datasource.lastFetchAt && (
                  <span>Last fetched: {timeAgo(datasource.lastFetchAt)}</span>
                )}
                {isSuccess && (
                  <span className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 className="w-3 h-3" />
                    Success
                  </span>
                )}
                {isError && (
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="w-3 h-3" />
                    Error
                  </span>
                )}
                {isPending && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching...
                  </span>
                )}
              </div>
              {isError && datasource.lastFetchError && (
                <p className="text-[11px] text-destructive mt-1">
                  {datasource.lastFetchError}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={fetchLoading}
              onClick={onRefresh}
            >
              {fetchLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3" />
              )}
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onEditConfig}
            >
              <Settings2 className="w-3 h-3" />
              Edit Config
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
