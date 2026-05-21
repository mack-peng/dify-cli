# @orangemust/dify-cli

A command-line interface for interacting with Dify applications.

[![npm version](https://img.shields.io/npm/v/@orangemust/dify-cli.svg)](https://www.npmjs.com/package/@orangemust/dify-cli)

## Installation

```bash
npm install -g @orangemust/dify-cli
```

Or link locally for development:

```bash
cd dify-cli
npm link
```

## Quick Start

1. Initialize configuration with your Dify API key:

```bash
dify-cli config init --api-key <your-api-key>
```

> `--base-url` 可选，默认为 `https://api.dify.ai/v1`。自部署 Dify 需指定：
> ```bash
> dify-cli config init --api-key <key> --base-url https://your-dify.com/v1
> ```

2. Send a message to a Chat app:

```bash
dify-cli chat send "Hello, how are you?"
```

3. List knowledge bases:

```bash
dify-cli knowledge list
```

## Configuration

Configuration is stored in `~/.dify/config.json`. You can manage it via:

```bash
# Initialize with all options
dify-cli config init --api-key <key> --base-url <url> --default-user <user>

# Set individual values
dify-cli config set apiKey <key>
dify-cli config set baseUrl https://api.dify.ai/v1

# Get config values
dify-cli config get
dify-cli config get apiKey
```

Priority: CLI flags > Environment variables > Config file

Environment variables:
- `DIFY_API_KEY` - API key
- `DIFY_BASE_URL` - API base URL (default: `https://api.dify.ai/v1`)

## Commands

### App Information

```bash
dify-cli info                    # Get app info
dify-cli parameters              # Get app parameters
dify-cli meta                    # Get app meta
dify-cli site                    # Get WebApp settings
```

### Chat App

```bash
dify-cli chat send "message"                    # Send message (blocking)
dify-cli chat send "message" --mode streaming   # Send message (streaming)
dify-cli chat send "message" -c <conversation_id>  # Continue conversation
dify-cli chat stop <task_id>                    # Stop generation
dify-cli chat feedback <message_id> -r like     # Submit feedback
dify-cli chat suggested <message_id>            # Get suggested questions
```

### Completion App

```bash
dify-cli completion send "prompt"               # Send prompt
dify-cli completion send "prompt" --mode streaming
dify-cli completion stop <task_id>
```

### Chatflow App

```bash
dify-cli chatflow send "message"                # Send message
dify-cli chatflow stop <task_id>
dify-cli chatflow feedback <message_id> -r like
```

### Workflow App

```bash
dify-cli workflow run                           # Run workflow
dify-cli workflow run --inputs '{"key":"value"}'
dify-cli workflow stop <task_id>
dify-cli workflow logs                          # List workflow logs
dify-cli workflow detail <run_id>               # Get run details
```

### Knowledge Base

```bash
dify-cli knowledge list                         # List knowledge bases
dify-cli knowledge create "My Knowledge"        # Create knowledge base
dify-cli knowledge get <dataset_id>             # Get details
dify-cli knowledge update <dataset_id> --name "New Name"
dify-cli knowledge delete <dataset_id>

# Document operations
dify-cli knowledge document list <dataset_id>
dify-cli knowledge document create-text <dataset_id> --name "Doc" --text "content"
dify-cli knowledge document create-file <dataset_id> --file ./doc.pdf
dify-cli knowledge document get <dataset_id> <document_id>
dify-cli knowledge document delete <dataset_id> <document_id>
dify-cli knowledge document status <dataset_id> <batch>

# Segment operations
dify-cli knowledge segment list <dataset_id> <document_id>
dify-cli knowledge segment create <dataset_id> <document_id> --content "text"
dify-cli knowledge segment update <dataset_id> <document_id> <segment_id> --content "text"
dify-cli knowledge segment delete <dataset_id> <document_id> <segment_id>
```

### Conversation Management

```bash
dify-cli conversation list                      # List conversations
dify-cli conversation get <conversation_id>     # Get messages
dify-cli conversation rename <conversation_id> -n "New Name"
dify-cli conversation delete <conversation_id>
dify-cli conversation variables <conversation_id>
```

### File Operations

```bash
dify-cli file upload <file_path>               # Upload file
dify-cli file preview <file_id>                # Download file
```

### Audio Operations

```bash
dify-cli audio to-text <audio_file>            # Speech to text
dify-cli audio to-audio "text to speak"        # Text to speech
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
dify-cli annotation reply-config                # Get reply config
```

## Global Options

All commands support these global options:

```
--api-key <key>      Dify API key (overrides config and env)
--base-url <url>     Dify API base URL
--user <id>          User identifier
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch

# Type check
npx tsc --noEmit
```

## License

MIT
