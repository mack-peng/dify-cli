# AGENTS.md

## Project

`@orangemust/dify-cli` — CLI for Dify apps. Entrypoint: `bin/dify.js` → `require('../dist/index')`.  
Build: `npm run build` (= `tsc`, which is both compiler + typecheck — no separate lint/typecheck step).  
No test framework exists in this repo.  
Single dependency: `commander`. Dev: `typescript`, `@types/node`.

## API Key Types (critical)

Dify has **two non-interchangeable** key types:

| Prefix | Used by |
|--------|---------|
| `app-*` | `info`, `chat`, `completion`, `chatflow`, `workflow`, `conversation`, `file`, `audio`, `feedback`, `annotation` |
| `dataset-*` | `knowledge` (datasets, documents, segments) |

Override per-command: `dify-cli <subcommand> --api-key <key>`

## Multi-Profile Config

Config file `~/.dify/config.json` uses a profile-based schema:

```json
{ "active": "default", "profiles": { "default": { "apiKey": "...", "baseUrl": "..." }, "prod": { ... } } }
```

Profile selection priority: `--profile <name>` flag → `DIFY_PROFILE` env → `active` field.

Config value priority: CLI flags (`--api-key`, `--base-url`, `--user`) → env vars (`DIFY_API_KEY`, `DIFY_BASE_URL`, `DIFY_DEFAULT_USER`) → active profile's stored value.

Auto-migration: old flat config `{ apiKey, baseUrl, defaultUser }` is migrated to `{ active: "default", profiles: { default: { ... } } }` on first read.

## Architecture

```
src/
├── index.ts           # program.parse(process.argv)
├── program.ts         # decorateProgram(): global opts + register*Commands()
├── bundle.ts          # Re-exports for library consumers
├── api/client.ts      # DifyClient — config resolution, request(), requestStream(), uploadFile()
├── api/*.ts           # Domain-specific API classes (ChatAPI, KnowledgeAPI, etc.)
├── commands/*.ts      # register*Commands(program) functions
├── installer/         # skill-template.ts — SKILL.md + pitfalls.md templates
└── utils/             # config, output (JSON.stringify), streaming (SSE parser)
```

## Key Patterns

- **Command handler**: `action(async (args..., options, command) => { const opts = command.optsWithGlobals(); ... })`
- **Config priority**: CLI flags (`--api-key`, `--base-url`, `--user`) → env vars (`DIFY_API_KEY`, `DIFY_BASE_URL`, `DIFY_DEFAULT_USER`) → `~/.dify/config.json`
- **Default user**: `cli-user` (override via `--user` flag or `DIFY_DEFAULT_USER` env)
- **Output**: `formatOutput(data)` = `JSON.stringify(data, null, 2)`
- **Default mode**: `blocking`. Pass `--mode streaming` for SSE (uses `parseSSEStream()` generator)
- **`chat send`** supports stdin piping (reads from stdin if no message arg)
- **`knowledge`** has alias `kb`
- **Error format**: `API <status_code>: <detail>` — all commands catch and `process.exit(1)`
- **skill-install / skill-uninstall**: Installs SKILL.md + pitfalls.md into agent skill directories (`~/.agents/skills/dify-cli/`). Use `--target` to select agent (auto/all/opencode/claude/codex/cursor/hermes/gemini).

## Adding a Command

1. Create `src/api/<domain>.ts` with an API client class (extends DifyClient usage)
2. Create `src/commands/<domain>.ts` exporting `register<Domain>Commands(program)`
3. Re-export from `src/commands/index.ts`
4. Import and call in `src/program.ts`
