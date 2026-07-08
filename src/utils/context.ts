import { Command } from 'commander';
import { DifyClient } from '../api/client';

export interface CommandContext {
  user: string;
  client: DifyClient;
}

export function resolveContext(command: Command): CommandContext {
  const opts = command.optsWithGlobals();
  return {
    user: opts.user || 'cli-user',
    client: new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl }),
  };
}

export function safeJsonParse(value: string, label: string): any {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`Invalid JSON for ${label}: ${value}`);
  }
}
