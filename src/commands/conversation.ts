import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { ConversationAPI } from '../api/conversation';
import { formatOutput } from '../utils/output';

export function registerConversationCommands(program: Command): void {
  const conversation = program.command('conversation').description('Conversation management').alias('conv');

  conversation
    .command('list')
    .description('List conversations')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .option('--sort-by <field>', 'Sort field (-updated_at, -created_at, etc.)')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ConversationAPI(client);
      try {
        const result = await api.list({
          user,
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
          sort_by: options.sortBy,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  conversation
    .command('get <conversation_id>')
    .description('Get messages in a conversation')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .action(async (conversationId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ConversationAPI(client);
      try {
        const result = await api.getMessages(conversationId, {
          user,
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  conversation
    .command('rename <conversation_id>')
    .description('Rename a conversation')
    .requiredOption('-n, --name <text>', 'New conversation name')
    .action(async (conversationId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ConversationAPI(client);
      try {
        const result = await api.rename(conversationId, options.name, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  conversation
    .command('delete <conversation_id>')
    .description('Delete a conversation')
    .action(async (conversationId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ConversationAPI(client);
      try {
        const result = await api.delete(conversationId, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  conversation
    .command('variables <conversation_id>')
    .description('Get conversation variables')
    .action(async (conversationId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ConversationAPI(client);
      try {
        const result = await api.getVariables(conversationId, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
