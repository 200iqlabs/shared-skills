#!/bin/bash
# Shared helper functions for CLI tools

load_env() {
    local env_file="${1:-.env}"
    if [ -f "$env_file" ]; then
        set -a
        source "$env_file"
        set +a
    else
        echo "Error: $env_file not found" >&2
        echo "Copy .env.example to .env and fill in your API keys" >&2
        exit 1
    fi
}

json_pp() {
    if command -v jq >/dev/null 2>&1; then
        jq .
    else
        cat
    fi
}

die() {
    echo "Error: $1" >&2
    exit 1
}
