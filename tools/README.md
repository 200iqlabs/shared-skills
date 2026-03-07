# Shared CLI Tools

Lightweight scripts for external integrations. Used by agents instead of MCP servers
to minimize context window usage.

## Setup
```bash
cp common/.env.example common/.env
# Fill in your API keys
```

## Available Tools

### ClickUp
- `clickup/get_tasks.sh <list_id>` — Fetch tasks from a list
- `clickup/create_task.sh <list_id> <name> [description]` — Create a task

### Revolut Business
- `revolut/get_transactions.py [--days 30] [--format json|csv]` — Recent transactions
- `revolut/get_balance.py` — Account balances

### Google Drive
- `google-drive/search_files.sh <query>` — Search files (TODO)
