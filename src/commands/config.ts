import { Command } from 'commander';
import { ConfigManager, maskApiKey } from '../utils/config';
import { formatOutput } from '../utils/output';

export function registerConfigCommands(program: Command): void {
  const config = program.command('config').description('Manage dify-cli configuration');

  config
    .command('init')
    .description('Initialize dify-cli configuration')
    .option('--api-key <key>', 'Dify API key')
    .option('--base-url <url>', 'Dify API base URL (default: https://api.dify.ai/v1)')
    .option('--default-user <user>', 'Default user identifier')
    .option('-p, --profile <name>', 'Target profile (default: active profile)')
    .action(function(this: Command) {
      const opts = this.optsWithGlobals();
      const cm = new ConfigManager();
      const profileName = opts.profile || cm.getActiveProfileName();
      const existing = cm.getProfile(profileName) || {};
      cm.saveProfileConfig(profileName, {
        apiKey: opts.apiKey || existing.apiKey,
        baseUrl: opts.baseUrl || existing.baseUrl || 'https://api.dify.ai/v1',
        defaultUser: opts.defaultUser || existing.defaultUser || 'cli-user',
      });
      console.log(formatOutput({ message: 'Configuration saved', profile: profileName, path: cm.getConfigFilePath() }));
    });

  config
    .command('set')
    .description('Set a config value')
    .argument('<key>', 'Config key (apiKey, baseUrl, defaultUser)')
    .argument('<value>', 'Config value')
    .option('-p, --profile <name>', 'Target profile (default: active profile)')
    .action((key: string, value: string, options) => {
      const cm = new ConfigManager();
      const allowed = ['apiKey', 'baseUrl', 'defaultUser'];
      if (!allowed.includes(key)) {
        console.error(`Invalid key "${key}". Allowed: ${allowed.join(', ')}`);
        process.exit(1);
      }
      const profileName = options.profile || cm.getActiveProfileName();
      cm.saveProfileConfig(profileName, { [key]: value });
      console.log(formatOutput({ message: `Set ${key} in profile '${profileName}'` }));
    });

  config
    .command('get')
    .description('Get config value(s)')
    .argument('[key]', 'Config key (apiKey, baseUrl, defaultUser)')
    .option('-p, --profile <name>', 'Target profile (default: active profile)')
    .action((key?: string, options?: any) => {
      const cm = new ConfigManager();
      const profileName = (options && options.profile) || cm.getActiveProfileName();
      const profile = cm.getProfile(profileName);
      if (profileName !== cm.getActiveProfileName() && !profile) {
        console.error(`Profile '${profileName}' not found`);
        process.exit(1);
      }
      const data = profile || {};
      if (key) {
        const val = (data as any)[key];
        if (val === undefined) {
          console.error(`Config key "${key}" not found in profile '${profileName}'`);
          process.exit(1);
        }
        const masked = key === 'apiKey' ? maskApiKey(val) : val;
        console.log(formatOutput({ key: masked, profile: profileName }));
      } else {
        const masked = { ...data };
        if (masked.apiKey) {
          masked.apiKey = maskApiKey(masked.apiKey);
        }
        console.log(formatOutput({ profile: profileName, ...masked }));
      }
    });

  config
    .command('show')
    .description('Show current or specified profile configuration')
    .option('-p, --profile <name>', 'Target profile (default: active profile)')
    .action(function(this: Command) {
      const opts = this.optsWithGlobals();
      const cm = new ConfigManager();
      const profileName = opts.profile || cm.getActiveProfileName();
      const profile = cm.getProfile(profileName);

      if (profileName !== cm.getActiveProfileName() && !profile) {
        console.error(`Profile '${profileName}' not found`);
        process.exit(1);
      }

      const data = profile || {};
      const masked = { ...data };
      if (masked.apiKey) {
        masked.apiKey = maskApiKey(masked.apiKey);
      }

      console.log(formatOutput({
        active: cm.getActiveProfileName(),
        profile: profileName,
        ...masked,
        mode: data.apiKey
          ? (data.apiKey.startsWith('dataset-') ? 'knowledge' : 'app')
          : '(not set)',
      }));
    });

  config
    .command('new')
    .description('Create a new profile')
    .argument('<name>', 'Profile name')
    .action((name: string) => {
      const cm = new ConfigManager();
      try {
        cm.createProfile(name);
        console.log(formatOutput({ created: name }));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  config
    .command('use')
    .description('Switch active profile')
    .argument('<name>', 'Profile name')
    .action((name: string) => {
      const cm = new ConfigManager();
      try {
        cm.setActiveProfile(name);
        console.log(formatOutput({ active: name }));
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  config
    .command('list')
    .description('List all profiles')
    .action(() => {
      const cm = new ConfigManager();
      const result = cm.listProfiles();
      console.log(formatOutput(result));
    });

  config
    .command('path')
    .description('Show configuration file path')
    .action(() => {
      const cm = new ConfigManager();
      console.log(formatOutput({ path: cm.getConfigFilePath() }));
    });
}
