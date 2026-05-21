# AGENTS.md

This file provides guidance for AI agents working on the dify-cli codebase.

## Project Overview

dify-cli is a TypeScript-based CLI tool for interacting with Dify applications. It follows the architecture patterns from playwright-cli.

## Architecture

```
src/
├── index.ts           # Entry point - parses CLI args
├── program.ts         # Command registration via decorateProgram()
├── bundle.ts          # Central re-exports
├── api/               # API client layer (HTTP + SSE)
│   ├── client.ts      # Base DifyClient class
│   └── *.ts           # Domain-specific API clients
├── commands/          # CLI command handlers
│   └── *.ts           # Each file registers related commands
└── utils/
    ├── config.ts      # Config file management (~/.dify/config.json)
    ├── output.ts      # JSON output formatting
    └── streaming.ts   # SSE stream parser
```

## Key Patterns

### Command Registration

Each command module exports a `register*Commands(program)` function:

```typescript
export function registerChatCommands(program: Command): void {
  const chat = program.command('chat');
  chat.command('send [message]')
    .action(async (message, options, command) => {
      const opts = command.optsWithGlobals(); // Access global options
      const client = new DifyClient({ apiKey: opts.apiKey, baseUrl: opts.baseUrl });
      // ...
    });
}
```

### API Client Usage

```typescript
const client = new DifyClient({ apiKey, baseUrl });
const chatAPI = new ChatAPI(client);

// Blocking request
const response = await chatAPI.sendMessage({ query, user, response_mode: 'blocking' });

// Streaming request
const stream = await chatAPI.sendMessageStream({ query, user, response_mode: 'streaming' });
for await (const event of parseSSEStream(stream)) {
  console.log(JSON.stringify(event));
}
```

### Configuration Priority

1. CLI flags (`--api-key`, `--base-url`)
2. Environment variables (`DIFY_API_KEY`, `DIFY_BASE_URL`)
3. Config file (`~/.dify/config.json`)

## Testing Commands

```bash
# Build
npx tsc

# Test help
dify-cli --help
dify-cli chat --help
dify-cli knowledge document --help

# Test with real API
dify-cli config init --api-key <key>
dify-cli info
dify-cli chat send "Hello"
```

## Code Style

- No comments unless necessary
- TypeScript strict mode
- CommonJS module output
- Default export: JSON format
- Default response mode: blocking

## Adding New Commands

1. Create `src/api/<domain>.ts` with API client class
2. Create `src/commands/<domain>.ts` with `register*Commands` function
3. Export from `src/commands/index.ts`
4. Import and call in `src/program.ts`

## Error Handling

All API errors are caught and displayed as:

```
API <status_code>: <error_message>
```

Commands exit with code 1 on error.
