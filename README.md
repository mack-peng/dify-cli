# @orangemust/dify-cli

A command-line interface for interacting with Dify applications.

[![npm version](https://img.shields.io/npm/v/@orangemust/dify-cli.svg)](https://www.npmjs.com/package/@orangemust/dify-cli)

---

## Installation

### For Humans

Copy and paste this prompt to your LLM agent (Claude Code, Cursor, Codex, etc.):

```text
Install and configure dify-cli by following the instructions here:
https://raw.githubusercontent.com/mack-peng/dify-cli/main/docs/guide/installation.md
```

Or read the [Installation Guide](docs/guide/installation.md), but seriously, let an agent do it. Humans fat-finger configs.

### For LLM Agents

Fetch the installation guide and follow it:

```bash
curl -s https://raw.githubusercontent.com/mack-peng/dify-cli/main/docs/guide/installation.md
```

---

## Quick Start

### Install

```bash
npm install -g @orangemust/dify-cli

# Or run without installing:
# npx @orangemust/dify-cli chat send "hello"
```

### 1. Configure API Key

Dify 有两种 API Key，**互不通用**。配置哪个 key，后续命令就操作哪个资源。

```bash
# 操作应用（chat/completion/workflow）用 app- 开头的 key
dify-cli config init --api-key app-xxxx

# 操作知识库用 dataset- 开头的 key
dify-cli config init --api-key dataset-xxxx

# 自部署需指定 base-url
dify-cli config init --api-key app-xxxx --base-url https://dify.example.com/v1
```

> 切换操作对象时重新 `config init`，或用 `--api-key` 临时覆盖：
> `dify-cli chat send "hello" --api-key app-xxxx`
> `dify-cli knowledge list --api-key dataset-xxxx`

### 2. Try It

```bash
# 如果配了 app key
dify-cli info

# 如果配了 dataset key
dify-cli knowledge list
```

---

## API Keys

| Type | Prefix | Commands |
|------|--------|----------|
| App Key | `app-` | `info`, `chat`, `completion`, `chatflow`, `workflow`, `conversation`, `file`, `audio`, `feedback`, `annotation` |
| Dataset Key | `dataset-` | `knowledge` (datasets, documents, segments) |

Config file (`~/.dify/config.json`) holds one key at a time. Switch by re-running `config init` or override per-command with `--api-key`.

---

## Configuration

```bash
# Initialize
dify-cli config init --api-key <key> --base-url <url> --default-user <user>

# Set individual values
dify-cli config set apiKey <key>
dify-cli config set baseUrl https://api.dify.ai/v1

# Get config
dify-cli config get
dify-cli config get apiKey
```

Priority: CLI flags > Environment variables > Config file

```
DIFY_API_KEY       API key
DIFY_BASE_URL      API base URL (default: https://api.dify.ai/v1)
DIFY_DEFAULT_USER  User identifier (default: cli-user)
```

---

## Commands

### App Info

```bash
dify-cli info                    # Get app info
dify-cli parameters              # Get app parameters
dify-cli meta                    # Get app meta
dify-cli site                    # Get WebApp settings
```

### Chat App

```bash
dify-cli chat send "message"                    # Blocking
dify-cli chat send "message" --mode streaming   # Streaming
dify-cli chat send "message" -c <conversation_id>  # Continue conversation
dify-cli chat stop <task_id>                    # Stop generation
dify-cli chat feedback <message_id> -r like     # Feedback
dify-cli chat suggested <message_id>            # Suggested questions
```

### Completion App

```bash
dify-cli completion send "prompt"
dify-cli completion send "prompt" --mode streaming
dify-cli completion stop <task_id>
```

### Chatflow App

```bash
dify-cli chatflow send "message"
dify-cli chatflow stop <task_id>
dify-cli chatflow feedback <message_id> -r like
```

### Workflow App

```bash
dify-cli workflow run
dify-cli workflow run --inputs '{"key":"value"}'
dify-cli workflow stop <task_id>
dify-cli workflow logs
dify-cli workflow detail <run_id>
```

### Knowledge Base

```bash
dify-cli knowledge list
dify-cli knowledge create "My Knowledge"
dify-cli knowledge get <dataset_id>
dify-cli knowledge update <dataset_id> --name "New Name"
dify-cli knowledge delete <dataset_id>

# Documents
dify-cli knowledge document list <dataset_id>
dify-cli knowledge document create-text <dataset_id> --name "Doc" --text "content"
dify-cli knowledge document create-text <dataset_id> --name "Doc" --text "content" --process-rule-mode custom --max-tokens 500 --overlap 50
dify-cli knowledge document create-file <dataset_id> --file ./doc.pdf
dify-cli knowledge document create-file <dataset_id> --file ./doc.pdf --process-rule-mode custom --separator "\n" --max-tokens 500 --overlap 50 --remove-extra-spaces
dify-cli knowledge document get <dataset_id> <document_id>
dify-cli knowledge document delete <dataset_id> <document_id>
dify-cli knowledge document status <dataset_id> <batch>

# Segments
dify-cli knowledge segment list <dataset_id> <document_id>
dify-cli knowledge segment create <dataset_id> <document_id> --content "text"
dify-cli knowledge segment update <dataset_id> <document_id> <segment_id> --content "text"
dify-cli knowledge segment delete <dataset_id> <document_id> <segment_id>
```

### Conversation

```bash
dify-cli conversation list
dify-cli conversation get <conversation_id>
dify-cli conversation rename <conversation_id> -n "New Name"
dify-cli conversation delete <conversation_id>
dify-cli conversation variables <conversation_id>
```

### File

```bash
dify-cli file upload <file_path>
dify-cli file preview <file_id>
```

### Audio

```bash
dify-cli audio to-text <audio_file>
dify-cli audio to-audio "text to speak"
```

### Feedback

```bash
dify-cli feedback list --app-type chat
```

### Annotations

```bash
dify-cli annotation create -q "question" -a "answer"
dify-cli annotation list
dify-cli annotation update <id> -q "new question" -a "new answer"
dify-cli annotation delete <id>
dify-cli annotation reply-config
```

---

## Global Options

```
--api-key <key>      Override API key
--base-url <url>     Override base URL
--user <id>          User identifier (default: cli-user)
```

---

## Development

```bash
npm install
npm run build
npm run watch
npx tsc --noEmit
```

## License

MIT
