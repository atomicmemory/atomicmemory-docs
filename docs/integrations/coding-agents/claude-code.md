---
title: Claude Code
sidebar_position: 1
---

# Claude Code

Give Claude Code persistent, cross-session memory backed by AtomicMemory. The plugin installs one MCP server exposing `memory_search`, `memory_ingest`, and `memory_package` as tools, plus a `SKILL.md` that teaches the agent when to call them.

:::danger[Not yet published]
`@atomicmemory/mcp-server` and the Claude Code plugin are not published to npm or to the Claude plugin marketplace yet. This page describes the integration shape — install steps will land once the packages are live.
:::

## What you get

- **Durable memory across sessions.** Claude Code stops forgetting what you told it yesterday.
- **Scope-aware retrieval.** `user` / `agent` / `namespace` / `thread` scopes are threaded through tool calls automatically.
- **Backend-agnostic.** Point the plugin at self-hosted `atomicmemory-core` or any other provider registered in the SDK's `MemoryProvider` registry.
- **Observability.** Every search returns AtomicMemory's stable `observability` envelope — retrieval, packaging, assembly.

## The skill

`skills/atomicmemory/SKILL.md` is loaded into the agent's context on every session and describes when to reach for memory:

```markdown
---
name: atomicmemory
description: Persistent semantic memory across Claude Code sessions — user preferences, project context, prior decisions, codebase facts. Call `memory_search` before answering questions that reference past work. Call `memory_ingest` after the user shares durable facts.
---

## When to search
- User references past work ("the fix we discussed", "that refactor")
- Question implies prior context ("why did we…")
- Starting work in an unfamiliar part of the codebase

## When to ingest
- User states a preference, constraint, or decision worth remembering
- A non-obvious fact about the code is established (invariant, workaround)
- User explicitly says "remember this"

## What NOT to save
- Ephemeral task state
- Facts already in CLAUDE.md or git history
- Anything the user can trivially re-derive
```

## MCP tools exposed

The plugin registers one MCP server that surfaces three tools to the agent:

| Tool | Maps to | Purpose |
|---|---|---|
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters |
| `memory_ingest` | `MemoryClient.ingest` | AUDN-mutating ingest (add/update/delete/no-op) — accepts text or messages |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query |

Tool schemas mirror the `MemoryClient` request / response types directly — same field names, same `scope` shape, same `observability` envelope in the response. See the [SDK reference overview](/sdk/api/overview) for the canonical `IngestInput`, `SearchRequest`, and `PackageRequest` shapes.

## Example session

```
you> remember that we always use pnpm in this repo, never npm
claude> [calls memory_ingest with the fact, scope.namespace=<repo>]
        Saved.

# next day, new session
you> what package manager does this project use?
claude> [calls memory_search "package manager"]
        pnpm — you set this as a repo-wide rule yesterday.
```

## Plugin manifest

For reference, `plugin.json`:

```json
{
  "name": "atomicmemory",
  "version": "0.1.0",
  "description": "Persistent semantic memory for Claude Code",
  "author": "AtomicMemory",
  "mcpServers": {
    "atomicmemory": {
      "command": "bash",
      "args": ["-c", "exec node \"$ATOMICMEMORY_MCP_SERVER_BIN\""],
      "env": {
        "ATOMICMEMORY_MCP_SERVER_BIN": "${ATOMICMEMORY_MCP_SERVER_BIN}",
        "ATOMICMEMORY_API_URL": "${ATOMICMEMORY_API_URL}",
        "ATOMICMEMORY_API_KEY": "${ATOMICMEMORY_API_KEY}"
      }
    }
  },
  "skills": ["./skills/atomicmemory"]
}
```

## Limitations

- **Rate limits.** Search is cheap, ingest is not — the plugin debounces ingest calls to avoid saving every utterance. Tune via `ingestDebounceMs`.
- **No automatic eviction.** AtomicMemory's contradiction-safe claim versioning keeps history; use the web console to prune if needed.

## View source

- [`plugins/claude-code/.claude-plugin/plugin.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/claude-code/.claude-plugin/plugin.json) — the canonical manifest
- [`plugins/claude-code/skills/atomicmemory/SKILL.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/claude-code/skills/atomicmemory/SKILL.md) — the agent-facing skill prompt
- [`packages/mcp-server/`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server) — the shared MCP server

## See also

- [SDK Overview](/sdk/overview) — the `MemoryProvider` model behind the plugin
- [Platform scope model](/platform/scope) — how scope fields dispatch
- [OpenClaw integration](/integrations/coding-agents/openclaw) — sibling plugin sharing the same MCP server
