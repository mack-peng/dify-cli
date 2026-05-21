import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { FileAPI } from '../api/file';
import { formatOutput } from '../utils/output';

export function registerFileCommands(program: Command): void {
  const file = program.command('file').description('File operations');

  file
    .command('upload <file_path>')
    .description('Upload a file')
    .action(async (filePath: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new FileAPI(client);
      try {
        const result = await api.upload(filePath, user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  file
    .command('preview <file_id>')
    .description('Download/preview a file')
    .action(async (fileId: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new FileAPI(client);
      try {
        const response = await api.preview(fileId);
        const buffer = Buffer.from(await response.arrayBuffer());
        process.stdout.write(buffer);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
