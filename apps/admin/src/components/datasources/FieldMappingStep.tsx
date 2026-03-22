import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { DatasourceField, DatasourceFieldType } from '@orchestra/shared';
import type { TestRestResponse } from '@/hooks/useDatasources';
import { FIELD_TYPES } from './SchemaEditor';

interface MappedField {
  sourceKey: string;
  enabled: boolean;
  key: string;
  label: string;
  type: DatasourceFieldType;
  detectedType: string;
}

interface FieldMappingStepProps {
  testResult: TestRestResponse;
  onFieldsChange: (fields: DatasourceField[]) => void;
}

function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^(.)/, (c) => c.toLowerCase());
}

function toTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function FieldMappingStep({
  testResult,
  onFieldsChange,
}: FieldMappingStepProps) {
  const [mappedFields, setMappedFields] = useState<MappedField[]>([]);

  // Initialize from detected fields
  useEffect(() => {
    if (testResult.detectedFields.length > 0) {
      const initial = testResult.detectedFields.map((f) => ({
        sourceKey: f.key,
        enabled: true,
        key: toCamelCase(f.key),
        label: toTitleCase(f.key),
        type: (FIELD_TYPES.includes(f.type as DatasourceFieldType)
          ? f.type
          : 'text') as DatasourceFieldType,
        detectedType: f.type,
      }));
      setMappedFields(initial);
    }
  }, [testResult.detectedFields]);

  // Notify parent when mapped fields change
  useEffect(() => {
    const enabled = mappedFields
      .filter((f) => f.enabled)
      .map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
      }));
    onFieldsChange(enabled);
  }, [mappedFields, onFieldsChange]);

  const updateMapped = (
    index: number,
    updates: Partial<MappedField>
  ) => {
    setMappedFields((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f))
    );
  };

  // Preview data using current mapping
  const previewRows = testResult.data.slice(0, 3);
  const enabledFields = mappedFields.filter((f) => f.enabled);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle2 className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium">
          Connection successful &mdash; {testResult.totalItems} items found
        </span>
      </div>

      <p className="text-xs text-muted-foreground">
        Map response fields to your datasource schema. Uncheck fields you
        don&apos;t need.
      </p>

      {/* Mapping table */}
      <div className="space-y-1.5">
        {mappedFields.map((field, i) => (
          <div
            key={field.sourceKey}
            className={`flex items-center gap-2 p-2 rounded-md text-sm ${
              field.enabled
                ? 'bg-secondary/50'
                : 'bg-muted/30 opacity-50'
            }`}
          >
            <input
              type="checkbox"
              checked={field.enabled}
              onChange={(e) =>
                updateMapped(i, { enabled: e.target.checked })
              }
              className="shrink-0"
            />
            <span className="font-mono text-xs text-muted-foreground w-32 truncate">
              {field.sourceKey}
            </span>
            <Badge variant="outline" className="text-[10px] shrink-0">
              {field.detectedType}
            </Badge>
            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
            <Input
              className="h-7 text-xs w-28"
              value={field.key}
              disabled={!field.enabled}
              onChange={(e) => updateMapped(i, { key: e.target.value })}
            />
            <Input
              className="h-7 text-xs w-28"
              value={field.label}
              disabled={!field.enabled}
              onChange={(e) =>
                updateMapped(i, { label: e.target.value })
              }
            />
            <select
              className="rounded-md border border-input bg-background text-xs h-7 px-1.5"
              value={field.type}
              disabled={!field.enabled}
              onChange={(e) =>
                updateMapped(i, {
                  type: e.target.value as DatasourceFieldType,
                })
              }
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Preview table */}
      {enabledFields.length > 0 && previewRows.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground mb-2">
            Preview (first {previewRows.length} rows):
          </p>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  {enabledFields.map((f) => (
                    <TableHead
                      key={f.key}
                      className="text-xs font-semibold uppercase"
                    >
                      {f.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, ri) => (
                  <TableRow key={ri}>
                    {enabledFields.map((f) => {
                      const value = row[f.sourceKey];
                      const display =
                        value === null || value === undefined
                          ? ''
                          : typeof value === 'object'
                          ? JSON.stringify(value)
                          : String(value);
                      return (
                        <TableCell
                          key={f.key}
                          className="text-xs py-1.5 max-w-[200px] truncate"
                        >
                          {f.type === 'image_url' && display ? (
                            <div className="flex items-center gap-2">
                              <img
                                src={display}
                                alt=""
                                className="w-6 h-6 rounded object-cover"
                              />
                              <span className="truncate">{display}</span>
                            </div>
                          ) : (
                            display
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}
    </div>
  );
}
