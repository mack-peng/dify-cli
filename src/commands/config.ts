import { Command } from 'commander';
import { ConfigManager } from '../utils/config';
import { formatOutput } from '../utils/output';

export function registerConfigCommands(program: Command): void {
  const config = program.command('config').description('Manage dify-cli configuration');

  config
    .command('init')
    .description('Initialize dify-cli configuration')
    .option('--api-key <key>', 'Dify API key')
    .option('--base-url <url>', 'Dify API base URL (default: https://api.dify.ai/v1)')
    .option('--default-user <user>', 'Default user identifier')
    .action((options) => {
      const cm = new ConfigManager();
      const existing = cm.getAll();
      cm.save({
        apiKey: options.apiKey || existing.apiKey,
        baseUrl: options.baseUrl || existing.baseUrl || 'https://api.dify.ai/v1',
        defaultUser: options.defaultUser || existing.defaultUser || 'cli-user',
      });
      console.log(formatOutput({ message: 'Configuration saved', path: process.env.HOME + '/.dify/config.json' }));
    });

  config
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key (apiKey, baseUrl, defaultUser)')
    .argument('<value>', 'Config value')
    .action((key: string, value: string) => {
      const cm = new ConfigManager();
      const allowed = ['apiKey', 'baseUrl', 'defaultUser'];
      if (!allowed.includes(key)) {
        console.error(`Invalid key "${key}". Allowed: ${allowed.join(', ')}`);
        process.exit(1);
      }
      cm.save({ [key]: value });
      console.log(formatOutput({ message: `Set ${key} successfully` }));
    });

  config
    .command('get')
    .description('Get config value(s)')
    .argument('[key]', 'Config key (apiKey, baseUrl, defaultUser)')
    .action((key?: string) => {
      const cm = new ConfigManager();
      if (key) {
        const val = cm.get(key as any);
        if (val === undefined) {
          console.error(`Config key "${key}" not found`);
          process.exit(1);
        }
        console.log(formatOutput({ [key]: val }));
      } else {
        console.log(formatOutput(cm.getAll()));
      }
    });
}
