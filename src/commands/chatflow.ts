import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { ChatflowAPI } from '../api/chatflow';
import { formatOutput } from '../utils/output';
import { parseSSEStream } from '../utils/streaming';

export function registerChatflowCommands(program: Command): void {
  const chatflow = program.command('chatflow').description('Chatflow App operations');

  chatflow
    .command('send [message]')
    .description('Send a message to a Chatflow app')
    .option('-m, --mode <mode>', 'Response mode: blocking or streaming', 'blocking')
    .option('-c, --conversation <id>', 'Conversation ID to continue')
    .option('--inputs <json>', 'Input variables as JSON string')
    .option('--file <path>', 'Upload a file')
    .option('--file-type <type>', 'File type: image, document, audio, video', 'document')
    .option('--no-auto-name', 'Disable auto conversation naming')
    .action(async (message: string | undefined, options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ChatflowAPI(client);

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

      const inputs = options.inputs ? JSON.parse(options.inputs) : {};
      const files = options.file ? [{ type: options.fileType, transfer_method: 'local_file' as const, url: options.file }] : undefined;

      const params = {
        inputs, query,
        response_mode: options.mode as 'blocking' | 'streaming',
        user, conversation_id: options.conversation,
        files: files as any,
        auto_generate_name: options.autoName,
      };

      try {
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

  chatflow
    .command('stop <task_id>')
    .description('Stop message generation')
    .action(async (taskId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ChatflowAPI(client);
      try {
        const result = await api.stopMessage(taskId, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  chatflow
    .command('feedback <message_id>')
    .description('Submit feedback for a message')
    .requiredOption('-r, --rating <rating>', 'Rating: like or dislike')
    .option('--content <text>', 'Feedback content')
    .action(async (messageId: string, options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ChatflowAPI(client);
      try {
        const result = await api.submitFeedback(messageId, { rating: options.rating, user, content: options.content });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
