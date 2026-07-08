import { Command } from 'commander';
import { FeedbackAPI } from '../api/feedback';
import { formatOutput } from '../utils/output';
import { resolveContext } from '../utils/context';

export function registerFeedbackCommands(program: Command): void {
  const feedback = program.command('feedback').description('Feedback operations');

  feedback
    .command('list')
    .description('List application feedbacks')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .option('--app-type <type>', 'App type: chat, advanced-chat, workflow, completion')
    .action(async (options, command) => {
      const ctx = resolveContext(command);
      const api = new FeedbackAPI(ctx.client);
      try {
        const result = await api.list({
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
          app_type: options.appType,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
