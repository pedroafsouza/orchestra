import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { RestSourceConfig } from '@orchestra/shared';
import type { TestRestResponse } from '@/hooks/useDatasources';

interface RestConfigFormProps {
  config: RestSourceConfig;
  onChange: (config: RestSourceConfig) => void;
  onTest: (config: RestSourceConfig) => Promise<TestRestResponse>;
  testResult: TestRestResponse | null;
  testLoading: boolean;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH'] as const;
const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'api_key', label: 'API Key' },
  { value: 'basic', label: 'Basic Auth' },
] as const;

export function RestConfigForm({
  config,
  onChange,
  onTest,
  testResult,
  testLoading,
}: RestConfigFormProps) {
  const [showHeaders, setShowHeaders] = useState(
    !!config.headers && Object.keys(config.headers).length > 0
  );
  const [showParams, setShowParams] = useState(
    !!config.queryParams && Object.keys(config.queryParams).length > 0
  );
  const [showBody, setShowBody] = useState(!!config.body);

  const update = (partial: Partial<RestSourceConfig>) => {
    onChange({ ...config, ...partial });
  };

  const headers: Record<string, string> = (config.headers || {}) as Record<string, string>;
  const queryParams: Record<string, string> = (config.queryParams || {}) as Record<string, string>;

  return (
    <div className="space-y-4">
      {/* URL + Method */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Endpoint URL
        </Label>
        <div className="flex gap-2">
          <select
            className="rounded-md border border-input bg-background text-sm h-9 px-2 w-24 shrink-0"
            value={config.method || 'GET'}
            onChange={(e) => update({ method: e.target.value as any })}
          >
            {HTTP_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <Input
            placeholder="https://api.example.com/v1/data"
            value={config.url || ''}
            onChange={(e) => update({ url: e.target.value })}
          />
        </div>
      </div>

      {/* Authentication */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Authentication
        </Label>
        <select
          className="rounded-md border border-input bg-background text-sm h-9 px-2 w-full mb-2"
          value={config.auth?.type || 'none'}
          onChange={(e) => {
            const type = e.target.value;
            if (type === 'none') update({ auth: { type: 'none' } });
            else if (type === 'bearer')
              update({ auth: { type: 'bearer', token: '' } });
            else if (type === 'api_key')
              update({
                auth: {
                  type: 'api_key',
                  key: '',
                  value: '',
                  in: 'header',
                },
              });
            else if (type === 'basic')
              update({
                auth: { type: 'basic', username: '', password: '' },
              });
          }}
        >
          {AUTH_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>

        {config.auth?.type === 'bearer' && (
          <Input
            placeholder="Enter bearer token..."
            type="password"
            value={(config.auth as any).token || ''}
            onChange={(e) =>
              update({ auth: { type: 'bearer', token: e.target.value } })
            }
          />
        )}

        {config.auth?.type === 'api_key' && (
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Key name (e.g., X-API-Key)"
              value={(config.auth as any).key || ''}
              onChange={(e) =>
                update({
                  auth: { ...(config.auth as any), key: e.target.value },
                })
              }
            />
            <Input
              className="flex-1"
              placeholder="Value"
              type="password"
              value={(config.auth as any).value || ''}
              onChange={(e) =>
                update({
                  auth: {
                    ...(config.auth as any),
                    value: e.target.value,
                  },
                })
              }
            />
            <select
              className="rounded-md border border-input bg-background text-sm h-9 px-2 w-24"
              value={(config.auth as any).in || 'header'}
              onChange={(e) =>
                update({
                  auth: {
                    ...(config.auth as any),
                    in: e.target.value as 'header' | 'query',
                  },
                })
              }
            >
              <option value="header">Header</option>
              <option value="query">Query</option>
            </select>
          </div>
        )}

        {config.auth?.type === 'basic' && (
          <div className="flex gap-2">
            <Input
              className="flex-1"
              placeholder="Username"
              value={(config.auth as any).username || ''}
              onChange={(e) =>
                update({
                  auth: {
                    ...(config.auth as any),
                    username: e.target.value,
                  },
                })
              }
            />
            <Input
              className="flex-1"
              placeholder="Password"
              type="password"
              value={(config.auth as any).password || ''}
              onChange={(e) =>
                update({
                  auth: {
                    ...(config.auth as any),
                    password: e.target.value,
                  },
                })
              }
            />
          </div>
        )}
      </div>

      {/* Headers (collapsible) */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          onClick={() => setShowHeaders(!showHeaders)}
        >
          {showHeaders ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Headers
          {Object.keys(headers).length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-1">
              {Object.keys(headers).length}
            </Badge>
          )}
        </button>
        {showHeaders && (
          <div className="space-y-2 ml-4">
            {Object.entries(headers).map(([key, value], i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="flex-1 h-7 text-xs"
                  placeholder="Header name"
                  value={key}
                  onChange={(e) => {
                    const newHeaders = { ...headers };
                    delete newHeaders[key];
                    newHeaders[e.target.value] = value;
                    update({ headers: newHeaders });
                  }}
                />
                <Input
                  className="flex-1 h-7 text-xs"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => {
                    update({
                      headers: { ...headers, [key]: e.target.value },
                    });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive"
                  onClick={() => {
                    const newHeaders = { ...headers };
                    delete newHeaders[key];
                    update({ headers: newHeaders });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-primary text-xs"
              onClick={() =>
                update({ headers: { ...headers, '': '' } })
              }
            >
              <Plus className="w-3 h-3" />
              Add Header
            </Button>
          </div>
        )}
      </div>

      {/* Query Params (collapsible) */}
      <div>
        <button
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
          onClick={() => setShowParams(!showParams)}
        >
          {showParams ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
          Query Parameters
          {Object.keys(queryParams).length > 0 && (
            <Badge variant="secondary" className="text-[10px] ml-1">
              {Object.keys(queryParams).length}
            </Badge>
          )}
        </button>
        {showParams && (
          <div className="space-y-2 ml-4">
            {Object.entries(queryParams).map(([key, value], i) => (
              <div key={i} className="flex gap-2">
                <Input
                  className="flex-1 h-7 text-xs"
                  placeholder="Param name"
                  value={key}
                  onChange={(e) => {
                    const newParams = { ...queryParams };
                    delete newParams[key];
                    newParams[e.target.value] = value;
                    update({ queryParams: newParams });
                  }}
                />
                <Input
                  className="flex-1 h-7 text-xs"
                  placeholder="Value"
                  value={value}
                  onChange={(e) => {
                    update({
                      queryParams: {
                        ...queryParams,
                        [key]: e.target.value,
                      },
                    });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-destructive"
                  onClick={() => {
                    const newParams = { ...queryParams };
                    delete newParams[key];
                    update({ queryParams: newParams });
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="xs"
              className="gap-1 text-primary text-xs"
              onClick={() =>
                update({
                  queryParams: { ...queryParams, '': '' },
                })
              }
            >
              <Plus className="w-3 h-3" />
              Add Parameter
            </Button>
          </div>
        )}
      </div>

      {/* Body (for POST/PUT/PATCH) */}
      {config.method && ['POST', 'PUT', 'PATCH'].includes(config.method) && (
        <div>
          <button
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2"
            onClick={() => setShowBody(!showBody)}
          >
            {showBody ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            Request Body
          </button>
          {showBody && (
            <textarea
              className="w-full h-24 rounded-md border border-input bg-background text-xs font-mono p-2 resize-y"
              placeholder='{ "key": "value" }'
              value={config.body || ''}
              onChange={(e) => update({ body: e.target.value })}
            />
          )}
        </div>
      )}

      {/* Data Path */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Data path (optional)
        </Label>
        <Input
          className="text-xs"
          placeholder="e.g., data.items — leave empty if response is the array"
          value={config.dataPath || ''}
          onChange={(e) => update({ dataPath: e.target.value })}
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          JSONPath to the array in the response. Leave empty if the root
          response is an array.
        </p>
      </div>

      {/* Auto-refresh interval */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Auto-refresh interval (optional)
        </Label>
        <select
          className="rounded-md border border-input bg-background text-sm h-9 px-2 w-full"
          value={config.refreshIntervalMinutes ?? ''}
          onChange={(e) =>
            update({
              refreshIntervalMinutes: e.target.value
                ? Number(e.target.value)
                : undefined,
            })
          }
        >
          <option value="">Off</option>
          <option value="5">Every 5 minutes</option>
          <option value="15">Every 15 minutes</option>
          <option value="60">Every hour</option>
          <option value="360">Every 6 hours</option>
          <option value="1440">Every 24 hours</option>
        </select>
        <p className="text-[10px] text-muted-foreground mt-1">
          Data will be lazily refreshed when accessed after the interval
          has elapsed.
        </p>
      </div>

      {/* Test Connection */}
      <div className="pt-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={!config.url || testLoading}
          onClick={() => onTest(config)}
        >
          {testLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : testResult?.success ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          ) : testResult ? (
            <XCircle className="w-3.5 h-3.5 text-destructive" />
          ) : null}
          Test Connection
        </Button>

        {testResult && (
          <div
            className={`mt-3 p-3 rounded-md text-xs ${
              testResult.success
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-destructive/10 border border-destructive/20'
            }`}
          >
            {testResult.success ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  <span className="font-medium text-green-500">
                    Connection successful
                  </span>
                </div>
                <p className="text-muted-foreground">
                  HTTP {testResult.statusCode} {'\u00B7'}{' '}
                  {testResult.responseTime}ms {'\u00B7'}{' '}
                  {testResult.totalItems} items found {'\u00B7'}{' '}
                  {testResult.detectedFields.length} fields detected
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-3.5 h-3.5 text-destructive" />
                  <span className="font-medium text-destructive">
                    Connection failed
                  </span>
                </div>
                <p className="text-muted-foreground">{testResult.error}</p>
                {testResult.rawResponse && (
                  <p className="text-muted-foreground mt-1">
                    Response keys:{' '}
                    {Array.isArray(testResult.rawResponse)
                      ? testResult.rawResponse.join(', ')
                      : String(testResult.rawResponse).slice(0, 200)}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
