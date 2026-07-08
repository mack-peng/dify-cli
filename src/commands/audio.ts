import { Command } from 'commander';
import { AudioAPI } from '../api/audio';
import { formatOutput } from '../utils/output';
import { resolveContext } from '../utils/context';

export function registerAudioCommands(program: Command): void {
  const audio = program.command('audio').description('Audio operations');

  audio
    .command('to-text <file_path>')
    .description('Convert speech to text')
    .action(async (filePath: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new AudioAPI(ctx.client);
      try {
        const result = await api.toText(filePath, ctx.user);
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  audio
    .command('to-audio <text>')
    .description('Convert text to speech')
    .action(async (text: string, _options, command) => {
      const ctx = resolveContext(command);
      const api = new AudioAPI(ctx.client);
      try {
        const response = await api.toAudio(text, ctx.user);
        const buffer = Buffer.from(await response.arrayBuffer());
        process.stdout.write(buffer);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
