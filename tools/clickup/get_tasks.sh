#!/bin/bash
# Usage: ./get_tasks.sh <list_id> [query]
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../common/helpers.sh"
load_env "$SCRIPT_DIR/../common/.env"
LIST_ID="${1:?Usage: get_tasks.sh <list_id> [query]}"
curl -s -H "Authorization: $CLICKUP_API_TOKEN" \
    "https://api.clickup.com/api/v2/list/$LIST_ID/task?page=0&subtasks=true" | json_pp
