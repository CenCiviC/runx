export interface ScriptMetadata {
  dependencies: Record<string, string>;
  env?: Record<string, string>;
  engines?: { bun?: string; node?: string };
  args?: string[];
}
