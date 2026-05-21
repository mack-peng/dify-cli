import { Command } from 'commander';
import { DifyClient } from '../api/client';
import { ApplicationAPI } from '../api/application';
import { formatOutput } from '../utils/output';

export function registerInfoCommands(program: Command): void {
  program
    .command('info')
    .description('Get application basic information')
    .action(async (_options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ApplicationAPI(client);
      try {
        const result = await api.getInfo();
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  program
    .command('parameters')
    .description('Get application parameters')
    .action(async (_options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ApplicationAPI(client);
      try {
        const result = await api.getParameters();
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  program
    .command('meta')
    .description('Get application meta information')
    .action(async (_options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ApplicationAPI(client);
      try {
        const result = await api.getMeta();
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  program
    .command('site')
    .description('Get WebApp settings')
    .action(async (_options, command) => {
      const opts = command.optsWithGlobals();
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      const api = new ApplicationAPI(client);
      try {
        const result = await api.getSite();
        console.log(formatOutput(result));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });
}
