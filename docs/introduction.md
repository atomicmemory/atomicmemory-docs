---
slug: /
sidebar_position: 1
---

# Introduction

AtomicMemory is an open-source memory engine for AI applications — semantic retrieval, AUDN mutation (Add / Update / Delete / No-op), and contradiction-safe claim versioning, delivered as an HTTP service you can run with one `docker compose up`. It is pluggable at every seam: swap the embedding provider, the LLM, the storage backend, or the scope model without forking. The engine ships as a standardized platform layer — not a framework, not a SaaS — so your agents, assistants, and products can compose the memory stack they need.

{/* 15-second value prop above; differentiation table below */}

## Why AtomicMemory

AI memory is becoming a platform concern, not a product feature. Most existing options force a hosted runtime, a specific agent framework, or a proprietary query language. AtomicMemory is designed around the opposite defaults.

| Dimension | AtomicMemory | mem0 | letta | zep |
|---|---|---|---|---|
| License | Apache 2.0 | Apache 2.0 (OSS + hosted) | Apache 2.0 | Apache 2.0 (OSS + hosted) |
| Primary language | TypeScript (Node, ESM) | Python | Python | Go |
| Deployment | Self-host, Docker Compose, HTTP-first | Self-host OSS + hosted platform | Self-host | Self-host OSS + hosted platform |
| Storage backend | Postgres + pgvector (swappable store interfaces) | Pluggable (multiple vector DBs) | Built-in agent state + vector | Internal store (self-managed) |
| Embedding providers | openai, openai-compatible, ollama, transformers (local WASM), voyage | Multi-provider | Multi-provider | Multi-provider |
| LLM providers | openai, openai-compatible, ollama, anthropic, google, groq | Multi-provider | Multi-provider | Multi-provider |
| Scope model | Explicit `user` / `workspace` / `agent` scopes at the request boundary | User + agent memory | Agent-centric | Session / user centric |
| Observability | Stable `observability` envelope on search responses (retrieval / packaging / assembly) | Logs + integrations | Framework-dependent | Hosted dashboards |
| API surface | HTTP (snake\_case) + [TypeScript SDK](/sdk/overview) | Python + Node SDKs, REST | Python + TypeScript SDKs, REST | Python + TypeScript + Go SDKs, REST |

Sources for third-party claims: [Mem0 OSS overview](https://docs.mem0.ai/open-source/overview), [Letta intro](https://docs.letta.com/guides/get-started/intro), [Zep overview](https://help.getzep.com/overview).

The pitch is not "we do more." It is: the seams are explicit, the contracts are stable, and you compose your own stack.

## Platform at a glance

- **Pluggable storage** — five domain-facing store interfaces so ingest, search, CRUD, lifecycle, and trust each see only the contract they need ([stores](/platform/stores))
- **Pluggable providers** — embeddings via openai, openai-compatible, ollama, transformers (local WASM), or voyage; LLM via openai, openai-compatible, ollama, anthropic, google, or groq ([providers](/platform/providers))
- **Explicit composition** — a single composition root wires the runtime container; no hidden singletons, no global state ([composition](/platform/composition))
- **First-class scope** — user, workspace, and agent scopes dispatched at the request boundary, not bolted on after ([scope](/platform/scope))
- **Observability as contract** — every search response carries a stable trace schema so dashboards and evals never break on a refactor ([observability](/platform/observability))
- **Domain separation** — Ingest, Search, CRUD, Lifecycle, and Trust are independent domains with their own routes and services ([architecture](/platform/architecture))

## Try it in 2 minutes

The fastest path is the [Quickstart](/quickstart): clone the core repo, set an API key, `docker compose up`, and run your first ingest and search with two curl commands.

Core is HTTP-first, so any language works today. The [TypeScript SDK](/sdk/overview) gives TypeScript and JavaScript consumers typed request and response shapes, richer ergonomics, scope-aware helpers, and a pluggable provider model that decouples your app from any particular memory engine — but nothing about core requires it.

AtomicMemory is [Apache-2.0 licensed](https://github.com/atomicmemory/atomicmemory-core/blob/main/LICENSE). Self-host it, fork it, run it behind your own gateway — the platform is yours.
