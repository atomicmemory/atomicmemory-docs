---
title: Codex
sidebar_position: 3
---

# Codex

Add persistent memory to [**OpenAI Codex**](https://openai.com/index/codex/) with the AtomicMemory plugin. Codex forgets everything between tasks — this plugin fixes that by wiring in an MCP server for semantic memory tools and a skill that teaches Codex when to retrieve context and store learnings.

:::danger[Not yet published]
`@atomicmemory/mcp-server` and the Codex plugin are not published to npm or to any public plugin marketplace yet. This page describes the integration shape — install steps will land once the packages are live.
:::

## Overview

1. **MCP Server** — three tools (`memory_search`, `memory_ingest`, `memory_package`) wired via the shared [`@atomicmemory/mcp-server`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server)
2. **Memory Protocol Skill** — teaches the agent to retrieve memories at task start, store learnings on completion, and capture session state before context loss
3. **Plugin Marketplace** — install via Codex's repo-level or personal plugin marketplace, with full interface metadata (category, default prompts, brand color)
4. **Backend-agnostic** — swap AtomicMemory core for any registered `MemoryProvider` by config

## What's Included

| Component | Plugin Install | MCP Only |
|---|:---:|:---:|
| MCP server (3 tools) | Yes | Yes |
| Memory Protocol skill | Yes | No |

## Available MCP Tools

Once installed, the following tools are available in every Codex task:

| Tool | Maps to | Description |
|---|---|---|
| `memory_search` | `MemoryClient.search` | Semantic retrieval with scope filters |
| `memory_ingest` | `MemoryClient.ingest` | AUDN-mutating ingest (text or messages) |
| `memory_package` | `MemoryClient.package` | Token-budgeted context package for a query |

See the [SDK reference overview](/sdk/api/overview) for the canonical `SearchRequest` / `IngestInput` / `PackageRequest` shapes.

## Memory Protocol Skill

Codex uses a skill-based approach instead of lifecycle hooks. The shipped skill ([`SKILL.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/skills/atomicmemory/SKILL.md)) instructs the agent:

### On Every New Task

1. Call `memory_search` with a task-related query to load relevant prior context
2. Review returned memories to understand what was learned in earlier sessions
3. For broad-context tasks, call `memory_package` — AtomicMemory selects and formats memories within a token budget

### After Completing Significant Work

Store key learnings via `memory_ingest`:

| What to store | Example |
|---|---|
| Architectural decisions | "Chose Express + Zod for the notifications API on 2026-04-21" |
| Strategies that worked | "Prefer `pnpm --filter` over `cd && pnpm` in CI — avoids cwd drift" |
| Failed approaches | "`any` casts through SDK types silently drop fields (see scope fix PR #1)" |
| User preferences observed | "User prefers one bundled PR over churn-y splits for cross-cutting refactors" |
| Environment discoveries | "Repo uses npm (`package-lock.json` + `npm ci` in CI); pnpm lockfiles are gitignored" |
| Conventions established | "All API routes follow `/api/v1/{resource}`; enforced by route tests" |

### Before Losing Context

If context is about to be compacted or the task is ending, ingest a comprehensive session summary — goal, accomplished, key decisions, files touched, current state — so the next task can pick up where this one left off.

Scope flows automatically from the shell env vars picked up by the MCP server. Override per call only when the user explicitly asks.

## Example Workflow

```text
# Task 1: Setting up a new service
You: Create a REST API for the notifications service using Express and TypeScript.

# Codex searches memory, finds nothing relevant, proceeds.
# After the task, memory_ingest stores:
#   - Decision: "Notifications service uses Express + TypeScript + Zod validation"
#   - Convention: "All API routes follow /api/v1/{resource} pattern"
#   - Preference: "User prefers explicit error types over generic catch-all"

# Task 2 (days later): Extending the service
You: Add WebSocket support for real-time notification delivery.

# Codex searches memory for "websocket notification service",
# retrieves the architecture decisions and conventions,
# and follows the same patterns established in the first task.
```

## Troubleshooting

- **"Connection failed"** — verify shell env is set: `echo $ATOMICMEMORY_API_URL` and `$ATOMICMEMORY_API_KEY`. Also confirm the core is reachable: `curl -sS -X POST "$ATOMICMEMORY_API_URL/v1/memories/search/fast" -H "Authorization: Bearer $ATOMICMEMORY_API_KEY" -H "content-type: application/json" -d '{"query":"ping","limit":1}'`
- **No tools appearing** — restart your Codex session after plugin installation
- **Plugin not found** — ensure `.agents/plugins/marketplace.json` is at the repository root and `source.path` points to the correct plugin directory
- **Skill not loading** — verify the `skills` field in `.codex-plugin/plugin.json` points at `./skills/`, and that the directory contains `atomicmemory/SKILL.md`
- **"scope required" errors** — the server rejects scopeless requests. At least one of `ATOMICMEMORY_SCOPE_USER` / `AGENT` / `NAMESPACE` / `THREAD` must be set

## View source

- [`plugins/codex/.codex-plugin/plugin.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/.codex-plugin/plugin.json) — Codex plugin manifest with interface metadata
- [`plugins/codex/.codex-mcp.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/.codex-mcp.json) — MCP server spec
- [`plugins/codex/skills/atomicmemory/SKILL.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/skills/atomicmemory/SKILL.md) — memory protocol skill
- [`plugins/codex/marketplace.example.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/codex/marketplace.example.json) — `marketplace.json` template
- [`packages/mcp-server/`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server) — the shared MCP server

## See also

- [Claude Code integration](/integrations/coding-agents/claude-code) — sibling plugin with lifecycle hooks on top of the same MCP server
- [OpenClaw integration](/integrations/coding-agents/openclaw)
- [Platform scope model](/platform/scope) — how `user` / `agent` / `namespace` / `thread` scopes dispatch
