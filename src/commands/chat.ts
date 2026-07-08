import { Command } from 'commander';
import { ChatAPI } from '../api/chat';
import { formatOutput } from '../utils/output';
import { parseSSEStream } from '../utils/streaming';
import { resolveContext, safeJsonParse } from '../utils/context';

export function registerChatCommands(program: Command): void {
  const chat = program.command('chat').description('Chat App operations');

  chat
    .command('send [message]')
    .description('Send a message to a Chat app')
    .option('-m, --mode <mode>', 'Response mode: blocking or streaming', 'blocking')
    .option('-c, --conversation <id>', 'Conversation ID to continue')
    .option('--inputs <json>', 'Input variables as JSON string')
    .option('--file <path>', 'Upload a file')
    .option('--file-type <type>', 'File type: image, document, audio, video', 'document')
    .option('--no-auto-name', 'Disable auto conversation naming')
    .action(async (message: string | undefined, options, command) => {
      const ctx = resolveContext(command);
      const api = new ChatAPI(ctx.client);

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

        const inputs = options.inputs ? safeJsonParse(options.inputs, '--inputs') : {};
        const files = options.file ? [{ type: options.fileType, transfer_method: 'local_file' as const, url: options.file }] : undefined;

        const params = {
          inputs,
          query,
          response_mode: options.mode as 'blocking' | 'streaming',
          user: ctx.user,
          conversation_id: options.conversation,
          files: files as any,
          auto_generate_name: options.autoName,
        };

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

  chat
    .command('stop <task_id>')
    .description('Stop message generation')
    .action(async (taskId: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new ChatAPI(ctx.client);
      try {
        const result = await api.stopMessage(taskId, ctx.user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  chat
    .command('feedback <message_id>')
    .description('Submit feedback for a message')
    .requiredOption('-r, --rating <rating>', 'Rating: like or dislike')
    .option('--content <text>', 'Feedback content')
    .action(async (messageId: string, options, command) => {
      const ctx = resolveContext(command);
      const api = new ChatAPI(ctx.client);
      try {
        const result = await api.submitFeedback(messageId, { rating: options.rating, user: ctx.user, content: options.content });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  chat
    .command('suggested <message_id>')
    .description('Get suggested questions for a message')
    .action(async (messageId: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new ChatAPI(ctx.client);
      try {
        const result = await api.getSuggestedQuestions(messageId, ctx.user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
