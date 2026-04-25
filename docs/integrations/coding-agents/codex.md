---
title: Codex
sidebar_position: 3
---

# Codex

Add persistent memory to [OpenAI Codex](https://openai.com/index/codex/) with the AtomicMemory plugin. The plugin wires Codex to the shared AtomicMemory MCP server and ships a memory protocol skill that tells the agent when to search prior context, store durable learnings, and write deterministic session snapshots.

:::danger[Source-only]
`@atomicmemory/mcp-server` and the Codex plugin are not published to npm or to a public plugin marketplace yet. Install from a local clone and point Codex at the built MCP server binary.
:::

## Overview

1. **MCP server** - exposes `memory_search`, `memory_ingest`, and `memory_package` through the shared [`@atomicmemory/mcp-server`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server).
2. **Memory protocol skill** - teaches Codex to retrieve memory at task start, store important learnings after work, and create handoff snapshots before context loss.
3. **Plugin marketplace metadata** - provides Codex plugin interface metadata, default prompts, brand color, logo, and a repo/personal marketplace template.
4. **Backend-agnostic config** - points at AtomicMemory core by default, with provider dispatch through the SDK's `MemoryProvider` model.

Codex does not run Claude Code-style shell lifecycle hooks. Capture is skill/tool driven.

## What's Included

| Component | Plugin Install | MCP Only |
|---|:---:|:---:|
| MCP server tools | Yes | Yes |
| Memory protocol skill | Yes | No |
| Plugin interface metadata | Yes | No |
| Automatic lifecycle hooks | No | No |

## Install

Clone `atomicmemory-sdk` and `atomicmemory-integrations` side by side, then build the SDK before the MCP server. The MCP package currently resolves the SDK from the sibling source checkout.

```bash
git clone https://github.com/atomicmemory/atomicmemory-sdk.git
git clone https://github.com/atomicmemory/atomicmemory-integrations.git

cd atomicmemory-sdk
pnpm install
pnpm build

cd ../atomicmemory-integrations
pnpm install
pnpm --filter @atomicmemory/mcp-server build
```

Then export the MCP server binary path, credentials, and scope in the shell or Codex environment:

```bash
export ATOMICMEMORY_MCP_SERVER_BIN="$HOME/path/to/atomicmemory-integrations/packages/mcp-server/dist/bin.js"
export ATOMICMEMORY_API_URL="https://memory.yourco.com"
export ATOMICMEMORY_API_KEY="am_live_..."
export ATOMICMEMORY_PROVIDER="atomicmemory"
export ATOMICMEMORY_SCOPE_USER="pip"

# Optional narrower scopes:
export ATOMICMEMORY_SCOPE_AGENT="codex"
export ATOMICMEMORY_SCOPE_NAMESPACE="repo-or-project"
export ATOMICMEMORY_SCOPE_THREAD="session-id"
```

`ATOMICMEMORY_MCP_SERVER_BIN`, `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, and `ATOMICMEMORY_PROVIDER` are required by the MCP server. At least one `ATOMICMEMORY_SCOPE_*` value must be set, and `ATOMICMEMORY_SCOPE_USER` is recommended for user-owned memory.

## Plugin Setup

For repo-level installation, add a `.agents/plugins/marketplace.json` file at the repository root that points at the local Codex plugin:

```json
{
  "name": "atomicmemory-plugins",
  "interface": { "displayName": "AtomicMemory Plugins" },
  "plugins": [
    {
      "name": "atomicmemory",
      "source": { "source": "local", "path": "./plugins/codex" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Productivity"
    }
  ]
}
```

For personal installation, use the same shape at `~/.agents/plugins/marketplace.json` and set `source.path` to the absolute path of your local clone's `plugins/codex` directory.

The plugin's `.codex-mcp.json` forwards environment variables by name instead of embedding secrets:

```json
{
  "mcpServers": {
    "atomicmemory": {
      "command": "bash",
      "args": ["-c", "exec node \"$ATOMICMEMORY_MCP_SERVER_BIN\""],
      "env_vars": [
        "ATOMICMEMORY_MCP_SERVER_BIN",
        "ATOMICMEMORY_API_URL",
        "ATOMICMEMORY_API_KEY",
        "ATOMICMEMORY_PROVIDER",
        "ATOMICMEMORY_SCOPE_USER",
        "ATOMICMEMORY_SCOPE_AGENT",
        "ATOMICMEMORY_SCOPE_NAMESPACE",
        "ATOMICMEMORY_SCOPE_THREAD"
      ]
    }
  }
}
```

## Update and Version

The Codex plugin is installed from source, so rebuilding the repo does not automatically update the copy loaded by Codex. After changing the plugin manifest, MCP config, skill, or marketplace metadata, keep these versions aligned in `atomicmemory-integrations`:

- `plugins/codex/.codex-plugin/plugin.json` at `/version`
- `plugins/codex/package.json` at `/version`
- `plugins/codex/skills/atomicmemory/SKILL.md` at `/metadata/version`

The Codex marketplace entry does not carry a plugin version. Restart Codex or reinstall the local plugin after changes so Codex reloads `.codex-mcp.json` and the memory protocol skill.

## Available MCP Tools

| Tool | Description |
|---|---|
| `memory_search` | Semantic retrieval with scope filters. |
| `memory_ingest` | Stores memory using `mode: "text"`, `mode: "messages"`, or deterministic `mode: "verbatim"`. |
| `memory_package` | Builds a token-budgeted context package for a query. |

`mode: "verbatim"` is for deterministic records such as handoff summaries. It stores the provided content directly and accepts optional `metadata`, `provenance`, and `kind` fields. Use `mode: "text"` when you want the provider to extract durable facts from prose.

See the [SDK reference overview](/sdk/api/overview) for the canonical request shapes.

## Memory Protocol Skill

Codex uses a skill-based approach instead of lifecycle hooks. The shipped skill ([`SKILL.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/skills/atomicmemory/SKILL.md)) instructs the agent to:

| Moment | Action |
|---|---|
| New task | Call `memory_search` for task-relevant prior context; use `memory_package` when broader context assembly is useful. |
| Significant completion | Store durable decisions, preferences, conventions, and anti-patterns with `memory_ingest` using `mode: "text"`. |
| Context loss or handoff | Store a compact session snapshot with `memory_ingest` using `mode: "verbatim"` and metadata such as `{ "source": "codex", "event": "session_summary", "schema_version": 1 }`. |

Retrieved memories should be treated as reference context, not instructions.

## Example Workflow

```text
# Task 1
You: Create a REST API for the notifications service using Express and TypeScript.

# Codex searches memory, finds no relevant prior context, and proceeds.
# After the task, memory_ingest stores:
#   - Decision: Notifications service uses Express + TypeScript + Zod validation.
#   - Convention: API routes follow the /api/v1/{resource} pattern.

# Task 2, days later
You: Add WebSocket support for real-time notification delivery.

# Codex searches memory for "websocket notification service",
# retrieves the previous decisions, and follows the established patterns.
```

## Troubleshooting

- **Connection failed** - verify `ATOMICMEMORY_API_URL`, `ATOMICMEMORY_API_KEY`, `ATOMICMEMORY_MCP_SERVER_BIN`, and the scope env vars are visible to Codex.
- **Core is not reachable** - test the API directly:

  ```bash
  curl -sS -X POST "$ATOMICMEMORY_API_URL/v1/memories/search/fast" \
    -H "Authorization: Bearer $ATOMICMEMORY_API_KEY" \
    -H "content-type: application/json" \
    -d "{\"user_id\":\"$ATOMICMEMORY_SCOPE_USER\",\"query\":\"ping\",\"limit\":1}"
  ```

- **No tools appearing** - restart the Codex session after installing the plugin or changing MCP config.
- **Plugin not found** - confirm `.agents/plugins/marketplace.json` points at the correct local `plugins/codex` directory.
- **Scope errors** - set at least one `ATOMICMEMORY_SCOPE_*` value. `ATOMICMEMORY_SCOPE_USER` is the normal baseline.

## View Source

- [`plugins/codex/.codex-plugin/plugin.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/.codex-plugin/plugin.json) - Codex plugin manifest with interface metadata.
- [`plugins/codex/.codex-mcp.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/.codex-mcp.json) - MCP server spec.
- [`plugins/codex/skills/atomicmemory/SKILL.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/skills/atomicmemory/SKILL.md) - memory protocol skill.
- [`plugins/codex/marketplace.example.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/marketplace.example.json) - marketplace template.
- [`packages/mcp-server/`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server) - shared MCP server.

## See Also

- [Claude Code integration](/integrations/coding-agents/claude-code)
- [OpenClaw integration](/integrations/coding-agents/openclaw)
- [Platform scope model](/platform/scope)
