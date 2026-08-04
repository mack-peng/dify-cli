import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join } from 'path';

const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));

import {
  registerConfigCommands,
  registerInfoCommands,
  registerChatCommands,
  registerCompletionCommands,
  registerChatflowCommands,
  registerWorkflowCommands,
  registerKnowledgeCommands,
  registerConversationCommands,
  registerFileCommands,
  registerAudioCommands,
  registerFeedbackCommands,
  registerAnnotationCommands,
} from './commands';

export function decorateProgram(program: Command): void {
  program
    .name('dify-cli')
    .description('CLI for interacting with Dify applications')
    .version(pkg.version)
    .option('--api-key <key>', 'Dify API key (overrides config and env)')
    .option('--base-url <url>', 'Dify API base URL (overrides config and env)')
    .option('--user <id>', 'User identifier (default: cli-user)')
    .option('-p, --profile <name>', 'Profile to use (overrides active profile)');

  registerConfigCommands(program);
  registerInfoCommands(program);
  registerChatCommands(program);
  registerCompletionCommands(program);
  registerChatflowCommands(program);
  registerWorkflowCommands(program);
  registerKnowledgeCommands(program);
  registerConversationCommands(program);
  registerFileCommands(program);
  registerAudioCommands(program);
  registerFeedbackCommands(program);
  registerAnnotationCommands(program);
}
