---
title: Integrations
sidebar_position: 1
---

# Integrations

AtomicMemory is a platform layer, so the useful question is never "what integrates with it?" — it is "what wants persistent, pluggable memory?" Two audiences already do: coding agents that need durable context across sessions, and AI frameworks that want a swappable memory backend behind their agent loops.

Every integration on this page consumes AtomicMemory through the same two seams:

- **HTTP API** — `ingest` / `search` / `package` / `trust`, documented under [API Reference](/api-reference/http/conventions)
- **TypeScript SDK** — `MemoryClient` with the pluggable `MemoryProvider` model, documented under [SDK](/sdk/overview)

Coding-agent integrations additionally share a **common MCP server** (`@atomicmemory/mcp-server`) shipped from [`atomicmemory-integrations`](https://github.com/atomicmemory/atomicmemory-integrations). It exposes three tools — `memory_search`, `memory_ingest`, `memory_package` — so Claude Code, OpenClaw, Codex, and Cursor all speak to the same memory surface through the same tool contract. `memory_ingest` supports extracted writes (`mode: "text"` / `mode: "messages"`) and deterministic one-record snapshots (`mode: "verbatim"`) for handoffs and lifecycle summaries.

## Coding Agents

Agents that edit code, run shells, and drive browsers need memory that survives session boundaries. The integrations repo ships each agent's plugin manifest and skill files; installs run from a local clone of the repo rather than through any public plugin marketplace.

| Integration | Status | Install surface | Source |
|---|---|---|---|
| [Claude Code](/integrations/coding-agents/claude-code) | 🔧 Source available¹ | Local marketplace (`plugin.json` + `SKILL.md`) | [`plugins/claude-code`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/plugins/claude-code) |
| [OpenClaw](/integrations/coding-agents/openclaw) | 🔧 Source available¹ | Local install (`openclaw.plugin.json` + `skill.yaml`) | [`plugins/openclaw`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/plugins/openclaw) |
| [Codex](/integrations/coding-agents/codex) | 🔧 Source available¹ | Local marketplace (`.codex-plugin/` + `.codex-mcp.json`) | [`plugins/codex`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/plugins/codex) |
| [Cursor](/integrations/coding-agents/cursor) | 🛠️ Planned | MCP server + `.cursor/rules` | — |

¹ Plugin manifest and skill files are committed to the integrations repo. Nothing is published to a public plugin marketplace — see each integration page for the clone-and-install steps.

## Frameworks

Framework integrations expose AtomicMemory as the memory primitive inside an agent's loop — retrieved context goes into prompts, new turns get ingested, capabilities are surfaced to the framework's tool system.

| Integration | Status | Package |
|---|---|---|
| [Vercel AI SDK](/integrations/frameworks/vercel-ai-sdk) | 🛠️ Planned | `@atomicmemory/vercel-ai` |
| [LangChain (JS)](/integrations/frameworks/langchain-js) | 🛠️ Planned | `@atomicmemory/langchain` |
| [Mastra](/integrations/frameworks/mastra) | 🛠️ Planned | `@atomicmemory/mastra` |
| [OpenAI Agents SDK](/integrations/frameworks/openai-agents) | 🛠️ Planned | `@atomicmemory/openai-agents` |
| [LangGraph (JS)](/integrations/frameworks/langgraph-js) | 🛠️ Planned | `@atomicmemory/langgraph` |

## Choosing a backend

Every integration on this page is **backend-agnostic**. The SDK's [`MemoryProvider` model](/sdk/concepts/provider-model) means the same Claude Code plugin or Vercel AI adapter can point at self-hosted `atomicmemory-core` or any other registered `MemoryProvider` — by config, not by code change.

## Contributing

Source lives at [`atomicmemory/atomicmemory-integrations`](https://github.com/atomicmemory/atomicmemory-integrations). The shared MCP server is in [`packages/mcp-server`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/packages/mcp-server); per-tool wrappers live under [`plugins/`](https://github.com/atomicmemory/atomicmemory-integrations/tree/main/plugins). If the tool you want isn't here, the cheapest path is usually: copy the closest plugin, swap the manifest shape for the target agent's, and reuse the MCP server unchanged.
