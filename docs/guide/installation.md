# Installation Guide for LLM Agents

You are an AI agent (Claude Code, Codex, Cursor, etc.). This guide is written for you. Do not make the human read it.

---

## What You're Installing

`@orangemust/dify-cli` is a CLI tool that lets you (the agent) control Dify applications programmatically. Chat apps, completion apps, workflow apps, knowledge bases — all from the command line.

Humans should not type these commands. You should.

---

## Step 1: Install the Package

```bash
npm install -g @orangemust/dify-cli
```

Or run without installing (slower but zero setup):

```bash
npx @orangemust/dify-cli chat send "hello"
npx @orangemust/dify-cli knowledge list
```

Verify:

```bash
which dify-cli && dify-cli --version
```

If `command not found`, your Node.js global bin isn't on `PATH`:

```bash
export PATH="$(npm root -g)/../bin:$PATH"
```

If you get a permission error on macOS/Linux:

```bash
sudo npm install -g @orangemust/dify-cli
```

---

## Step 2: Check Existing Config

Before creating a new key, check what's already configured:

```bash
dify-cli config get
```

If a key exists and you want to switch to the other type, skip to the override pattern below.

---

## Step 3: Get the API Key

Dify has **two types** of API keys. They are **not interchangeable**.

| If you want to operate | Key prefix | Get it from |
|---|---|---|
| Chat / Completion / Workflow / Conversation / File / Audio | `app-` | Dify app → API Access → API Keys → Create |
| Knowledge base / Documents / Segments | `dataset-` | Dify app → Knowledge → API → Create |

The human needs to create the key in their Dify dashboard. Ask them for it.

Then configure:

```bash
# For app operations
dify-cli config init --api-key app-xxxx

# For knowledge base operations
dify-cli config init --api-key dataset-xxxx

# If self-hosted
dify-cli config init --api-key app-xxxx --base-url https://dify.example.com/v1

# Optionally set a user identifier
dify-cli config init --api-key app-xxxx --default-user bot-agent
```

Config is stored at `~/.dify/config.json`. One key at a time. To switch without touching config, override per command:

```bash
dify-cli chat send "hello" --api-key app-xxxx
dify-cli knowledge list --api-key dataset-xxxx
```

---

## Step 4: Verify

```bash
# For app key
dify-cli info

# For dataset key
dify-cli knowledge list
```

JSON output = it works. `401` = bad key or wrong base URL. `ENOTFOUND` = wrong base URL.

---

## What You Can Do Now

### With an App Key (`app-`)

```
dify-cli info                               # App info
dify-cli chat send "message"                # Chat (blocking)
dify-cli chat send "message" --mode streaming  # Chat (streaming)
dify-cli completion send "prompt"           # Completion
dify-cli chatflow send "message"            # Chatflow
dify-cli workflow run                       # Workflow
dify-cli conversation list                  # Conversations
dify-cli file upload ./doc.pdf              # Upload
dify-cli audio to-text ./a.mp3              # Speech-to-text
dify-cli feedback list --app-type chat      # Feedback
dify-cli annotation list                    # Annotations
```

### With a Dataset Key (`dataset-`)

```
dify-cli knowledge list
dify-cli knowledge get <dataset_id>
dify-cli knowledge document list <dataset_id>
dify-cli knowledge document create-text <dataset_id> --name "Doc" --text "content"
dify-cli knowledge document create-file <dataset_id> --file ./file.pdf
dify-cli knowledge segment list <dataset_id> <document_id>
dify-cli knowledge segment create <dataset_id> <document_id> --content "text"
```

---

## Environment Variables (Skip Config Entirely)

```bash
export DIFY_API_KEY=app-xxxx
export DIFY_BASE_URL=https://dify.example.com/v1
export DIFY_DEFAULT_USER=bot-agent
```

then run any command without `--api-key` / `--base-url`.

**Priority** (highest to lowest):
1. CLI flag: `--api-key <key>`
2. Environment variable: `DIFY_API_KEY`
3. Config file: `~/.dify/config.json`

---

## Common Failures Agents Face

**"Authorization header must be provided and start with 'Bearer'"**
→ The key is empty. Run `config init` or set `DIFY_API_KEY`.

**"Access token is invalid"**
→ The key is wrong or expired. Get a fresh one from Dify.

**"Cannot find module"**
→ Global install didn't register. Re-run `npm install -g @orangemust/dify-cli`.

**ENOTFOUND / FetchError**
→ Wrong `--base-url`. Make sure it ends with `/v1`.

**JSON output looks messy**
→ That's intentional. Parse with `jq`:

```bash
dify-cli knowledge list | jq '.data[].name'
```

---

## The One-Liner

For agents that trust copy-paste:

```bash
npm install -g @orangemust/dify-cli && dify-cli config init --api-key app-xxxx && dify-cli info
```

Replace `app-xxxx` with the actual key. Humans can paste this and you handle the rest.

---

## Done

You now have programmatic control over Dify. Chat, translate, upload, query knowledge bases — all from a terminal an agent can automate.

If something breaks: check the key first. 90% of issues are bad keys. The other 10% are wrong base URLs.
