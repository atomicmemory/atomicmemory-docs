---
title: OpenClaw
sidebar_position: 2
---

# OpenClaw

Ship AtomicMemory to OpenClaw as a plugin + skill bundle. OpenClaw's agent gets durable semantic memory across chat apps (WhatsApp, Telegram, Slack, iMessage) with the same HTTP API and SDK surface that powers the Claude Code plugin.

:::danger[Not yet published]
`@atomicmemory/mcp-server` and the OpenClaw plugin are not published to npm or to ClawHub yet. This page describes the integration shape — install steps will land once the packages are live.
:::

## What you get

- **Cross-channel memory.** OpenClaw users who message it from WhatsApp, Slack, and iMessage hit the same memory surface — scoped by user, not by channel.
- **Permission-aware.** The skill declares its `network` and `credentials` needs up front per the OpenClaw permission manifest standard — no silent network calls.
- **Same backend-agnostic story.** Point at self-hosted AtomicMemory or any other registered `MemoryProvider`.

## Plugin layout

```
plugins/openclaw/
├── openclaw.plugin.json         # plugin manifest
├── skills/
│   └── atomicmemory/
│       ├── skill.yaml           # skill manifest + permissions
│       └── instructions.md      # agent-facing guidance
└── src/
    └── index.ts                 # plugin entry (registers MCP bridge)
```

## Plugin manifest

`openclaw.plugin.json`:

```json
{
  "id": "atomicmemory",
  "name": "AtomicMemory",
  "description": "Persistent semantic memory for OpenClaw agents",
  "kind": "memory",
  "providers": ["atomicmemory.memory"],
  "skills": ["./skills/atomicmemory"],
  "configSchema": {
    "type": "object",
    "required": ["apiUrl", "apiKey"],
    "properties": {
      "apiUrl": {
        "type": "string",
        "format": "uri",
        "description": "AtomicMemory core URL"
      },
      "apiKey": {
        "type": "string",
        "description": "API key (stored in OpenClaw credentials vault)"
      },
      "provider": {
        "type": "string",
        "enum": ["atomicmemory", "mem0"],
        "default": "atomicmemory"
      },
      "scope": {
        "type": "object",
        "required": ["user"],
        "properties": {
          "user": { "type": "string" },
          "agent": { "type": "string" },
          "namespace": { "type": "string" },
          "thread": { "type": "string" }
        }
      }
    }
  }
}
```

## Skill manifest

`skills/atomicmemory/skill.yaml`:

```yaml
name: atomicmemory
version: 0.1.0
author:
  name: AtomicMemory
description: |
  Remember facts across conversations. Search prior context before answering
  questions that reference past work. Save durable facts the user shares.

permissions:
  network:
    - https://memory.yourco.com
    - https://api.atomicmemory.ai
  credentials:
    - atomicmemory.apiKey
  filesystem: []
  shell: []

entrypoint: ./instructions.md
```

The `permissions` block is load-bearing — OpenClaw enforces declared permissions at runtime. Declaring `filesystem: []` and `shell: []` explicitly tells the runtime this skill only makes HTTP calls, so users can grant memory access without granting disk or shell access.

## Instructions

`skills/atomicmemory/instructions.md` is the agent-facing prompt, same shape as the Claude Code `SKILL.md` body — when to search, when to ingest, what to skip.

## MCP bridge

OpenClaw plugins can register MCP servers via the plugin entry. The AtomicMemory plugin spawns the shared `@atomicmemory/mcp-server` process and bridges its tool surface into OpenClaw's skill runtime, so the same three tools (`memory_search`, `memory_ingest`, `memory_package`) are callable:

```ts
// src/index.ts
import { definePlugin } from '@openclaw/plugin-sdk';
import { spawnAtomicMemoryMcp } from '@atomicmemory/mcp-server/spawn';

export default definePlugin({
  id: 'atomicmemory',
  async onLoad(ctx) {
    const mcp = await spawnAtomicMemoryMcp({
      apiUrl: ctx.config.apiUrl,
      apiKey: ctx.config.apiKey,
      provider: ctx.config.provider ?? 'atomicmemory',
      scope: ctx.config.scope,
    });
    ctx.registerProvider('atomicmemory.memory', mcp.provider);
  },
});
```

## Example

From WhatsApp:

```
you> I'm switching us to pnpm for all node projects
claw> Got it — saved. [memory_ingest]

# later, from Slack
you> what package manager do we use?
claw> pnpm. You decided this on WhatsApp on 2026-04-21. [memory_search]
```

Same memory, different channel — because the plugin scopes by user, not by transport.

## View source

- [`plugins/openclaw/openclaw.plugin.json`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/openclaw/openclaw.plugin.json) — the canonical manifest
- [`plugins/openclaw/skills/atomicmemory/skill.yaml`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/openclaw/skills/atomicmemory/skill.yaml) — skill permissions + entrypoint
- [`plugins/openclaw/skills/atomicmemory/instructions.md`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/openclaw/skills/atomicmemory/instructions.md) — the agent-facing skill prompt
- [`plugins/openclaw/src/index.ts`](https://github.com/atomicmemory/atomicmemory-integrations/blob/main/plugins/openclaw/src/index.ts) — the plugin entry (spawns the MCP server in-process)

## See also

- [OpenClaw Plugin Manifest reference](https://docs.openclaw.ai/plugins/manifest)
- [Claude Code integration](/integrations/coding-agents/claude-code) — sibling plugin sharing the same MCP server
- [Platform scope model](/platform/scope)
