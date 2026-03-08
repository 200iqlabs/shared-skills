# [Organization] Multi-Agent System

## Context
[Who this system serves, what organization, key facts]

## Available Agents
Skills are loaded from `skills/`. Routing happens automatically
based on the user's query matching skill descriptions in YAML frontmatter.

## Context Files
Organization-specific data lives in `context/`:
[List key context directories and what they contain]

## Routing Guidelines
When a query touches multiple domains:
1. Load all relevant agent skills
2. Synthesize perspectives into a unified response
3. If agents would give conflicting advice — flag it explicitly
4. Always indicate which perspective is speaking

## Data Freshness
Every context file has a "Last updated" header. If data is older than
30 days, inform the user before giving advice based on it.

## Communication Style
[Language, tone, formatting preferences]
