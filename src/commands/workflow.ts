import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { WorkflowAPI } from '../api/workflow';
import { formatOutput } from '../utils/output';
import { parseSSEStream } from '../utils/streaming';

export function registerWorkflowCommands(program: Command): void {
  const workflow = program.command('workflow').description('Workflow App operations');

  workflow
    .command('run')
    .description('Execute a workflow')
    .option('-m, --mode <mode>', 'Response mode: blocking or streaming', 'blocking')
    .option('--inputs <json>', 'Input variables as JSON string')
    .option('--file <path>', 'Upload a file')
    .option('--file-type <type>', 'File type: image, document, audio, video', 'document')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new WorkflowAPI(client);

      const inputs = options.inputs ? JSON.parse(options.inputs) : {};
      const files = options.file ? [{ type: options.fileType, transfer_method: 'local_file' as const, url: options.file }] : undefined;

      const params = { inputs, response_mode: options.mode as 'blocking' | 'streaming', user, files: files as any };

      try {
        if (options.mode === 'streaming') {
          const response = await api.runStream(params);
          for await (const event of parseSSEStream(response)) {
            console.log(formatOutput(event));
          }
        } else {
          const result = await api.run(params);
          console.log(formatOutput(result));
        }
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  workflow
    .command('stop <task_id>')
    .description('Stop a running workflow')
    .action(async (taskId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new WorkflowAPI(client);
      try {
        const result = await api.stop(taskId, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  workflow
    .command('logs')
    .description('List workflow execution logs')
    .option('--keyword <text>', 'Search keyword')
    .option('--status <status>', 'Filter by status')
    .option('--page <n>', 'Page number')
    .option('--limit <n>', 'Items per page')
    .action(async (options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new WorkflowAPI(client);
      try {
        const result = await api.getLogs({
          keyword: options.keyword,
          status: options.status,
          page: options.page ? Number(options.page) : undefined,
          limit: options.limit ? Number(options.limit) : undefined,
        });
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  workflow
    .command('detail <run_id>')
    .description('Get workflow run detail')
    .action(async (runId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new WorkflowAPI(client);
      try {
        const result = await api.getRunDetail(runId);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
