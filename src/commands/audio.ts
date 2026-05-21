import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { AudioAPI } from '../api/audio';
import { formatOutput } from '../utils/output';

export function registerAudioCommands(program: Command): void {
  const audio = program.command('audio').description('Audio operations');

  audio
    .command('to-text <file_path>')
    .description('Convert speech to text')
    .action(async (filePath: string, _options, command) => {
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AudioAPI(client);
      try {
        const result = await api.toText(filePath, user);
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
      const opts = command.optsWithGlobals();
      const user = opts.user || 'cli-user';
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new AudioAPI(client);
      try {
        const response = await api.toAudio(text, user);
        const buffer = Buffer.from(await response.arrayBuffer());
        process.stdout.write(buffer);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
