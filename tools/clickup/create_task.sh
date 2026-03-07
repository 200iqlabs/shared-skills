#!/bin/bash
# Usage: ./create_task.sh <list_id> <name> [description]
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common/helpers.sh"
load_env "$SCRIPT_DIR/../common/.env"
LIST_ID="${1:?Usage: create_task.sh <list_id> <name> [description]}"
NAME="${2:?Task name required}"
DESC="${3:-}"
curl -s -X POST \
    -H "Authorization: $CLICKUP_API_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"name\": \"$NAME\", \"description\": \"$DESC\"}" \
    "https://api.clickup.com/api/v2/list/$LIST_ID/task" | json_pp
