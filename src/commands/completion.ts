import { Command } from 'commander';
import { CompletionAPI } from '../api/completion';
import { formatOutput } from '../utils/output';
import { parseSSEStream } from '../utils/streaming';
import { resolveContext, safeJsonParse } from '../utils/context';

export function registerCompletionCommands(program: Command): void {
  const completion = program.command('completion').description('Completion App operations');

  completion
    .command('send [message]')
    .description('Send a message to a Completion app')
    .option('-m, --mode <mode>', 'Response mode: blocking or streaming', 'blocking')
    .option('--inputs <json>', 'Input variables as JSON string')
    .option('--file <path>', 'Upload a file')
    .option('--file-type <type>', 'File type: image, document, audio, video', 'document')
    .action(async (message: string | undefined, options, command) => {
      const ctx = resolveContext(command);
      const api = new CompletionAPI(ctx.client);

      if (!message && process.stdin.isTTY) {
        console.error('Error: message argument is required when not piping');
        process.exit(1);
      }

      try {
        let query = message || '';
        if (!message && !process.stdin.isTTY) {
          const chunks: Buffer[] = [];
          for await (const chunk of process.stdin) {
            chunks.push(chunk as Buffer);
          }
          query = Buffer.concat(chunks).toString('utf-8').trim();
        }

        if (!query) {
          console.error('Error: message argument is required');
          process.exit(1);
        }

        const inputs = options.inputs ? safeJsonParse(options.inputs, '--inputs') : {};
        const files = options.file ? [{ type: options.fileType, transfer_method: 'local_file' as const, url: options.file }] : undefined;

        const params = { inputs, query, response_mode: options.mode as 'blocking' | 'streaming', user: ctx.user, files: files as any };

        if (options.mode === 'streaming') {
          const response = await api.sendMessageStream(params);
          for await (const event of parseSSEStream(response)) {
            console.log(formatOutput(event));
          }
        } else {
          const result = await api.sendMessage(params);
          console.log(formatOutput(result));
        }
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  completion
    .command('stop <task_id>')
    .description('Stop message generation')
    .action(async (taskId: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new CompletionAPI(ctx.client);
      try {
        const result = await api.stopMessage(taskId, ctx.user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
