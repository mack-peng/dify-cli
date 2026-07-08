import { Command } from 'commander';
import { FileAPI } from '../api/file';
import { formatOutput } from '../utils/output';
import { resolveContext } from '../utils/context';

export function registerFileCommands(program: Command): void {
  const file = program.command('file').description('File operations');

  file
    .command('upload <file_path>')
    .description('Upload a file')
    .action(async (filePath: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new FileAPI(ctx.client);
      try {
        const result = await api.upload(filePath, ctx.user);
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
      const ctx = resolveContext(command);
      const api = new FileAPI(ctx.client);
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
