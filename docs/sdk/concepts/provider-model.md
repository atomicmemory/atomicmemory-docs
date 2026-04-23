---
title: Memory providers
sidebar_position: 2
---

# Memory providers

> **Disambiguation.** On this page, "provider" means a **memory backend** — a concrete implementation of the `MemoryProvider` interface that `MemoryClient` routes operations through. Core's [providers](/platform/providers) page is about **embedding and LLM providers** inside the engine (OpenAI, Ollama, etc.). Different layer, different concept.

The provider model is what makes `MemoryClient` backend-agnostic. It has three pieces: an interface every backend implements, a registry the client consults at init time, and an extension system for backend-specific capabilities.

## The interface

```mermaid
classDiagram
  class MemoryProvider {
    <<interface>>
    +name
    +ingest(input) IngestResult
    +search(req) SearchResultPage
    +get(ref) Memory
    +delete(ref) void
    +list(req) ListResultPage
    +capabilities() Capabilities
    +getExtension(name) T
  }
  class BaseMemoryProvider {
    <<abstract>>
  }
  class Packager
  class TemporalSearch
  class Versioner
  class Updater
  class GraphSearch
  class Forgetter
  class Profiler
  class Reflector
  class BatchOps
  class Health
  class AtomicMemoryProvider
  class Mem0Provider

  MemoryProvider <|.. BaseMemoryProvider
  BaseMemoryProvider <|-- AtomicMemoryProvider
  BaseMemoryProvider <|-- Mem0Provider
  AtomicMemoryProvider ..|> Packager
  AtomicMemoryProvider ..|> Versioner
  AtomicMemoryProvider ..|> Health
  Mem0Provider ..|> Health
```

Every backend implements the same six core operations: `ingest`, `search`, `get`, `delete`, `list`, `capabilities`. Beyond the core, the provider may opt into any of a fixed menu of **extensions** — `Packager`, `TemporalSearch`, `Versioner`, `Updater`, `GraphSearch`, `Forgetter`, `Profiler`, `Reflector`, `BatchOps`, `Health` — and declare which ones it supports through its `Capabilities` object.

This is why capabilities are runtime-queryable: an app that wants to use `memory.package()` must first check that the active provider supports the `package` extension, because not every backend does.

## The registry

Providers are instantiated at init time from the `providers` config. The registry (`src/memory/providers/registry.ts`) maps provider names to factory functions. The default registry includes `atomicmemory` and `mem0`:

```typescript
new MemoryClient({
  providers: {
    atomicmemory: { apiUrl: 'http://localhost:3050' },
    mem0: { apiUrl: 'http://localhost:8000' },
  },
  defaultProvider: 'atomicmemory',
});
```

`defaultProvider` names the provider every operation routes to unless overridden. When only one provider is configured, it is the default implicitly. A custom provider is registered the same way — see [Writing a custom provider](/sdk/guides/custom-provider).

## Extensions: the probe pattern

When an app calls `memory.package()`, `MemoryService` asks the active provider "do you implement the `package` extension?" via `getExtension('package')`:

```mermaid
sequenceDiagram
  participant App
  participant MC as MemoryClient
  participant MS as MemoryService
  participant P as Provider
  participant Pk as Packager ext

  App->>MC: package(req)
  MC->>MS: package(req)
  MS->>P: getExtension<Packager>('package')
  alt supported
    P-->>MS: Packager impl
    MS->>Pk: package(req)
    Pk->>Pk: rank + fit to tokenBudget
    Pk-->>MS: ContextPackage
    MS-->>MC: ContextPackage
  else not supported
    P-->>MS: undefined
    MS-->>MC: UnsupportedOperationError
  end
  MC-->>App: ContextPackage | error
```

The key is named after the **capability** (`'package'`), not the interface type (`Packager`). A provider either returns a value that satisfies the `Packager` interface or returns `undefined`, in which case `MemoryService` raises `UnsupportedOperationError`.

This design is deliberate: extensions are optional, but they are not second-class. Apps can use them freely as long as they check `capabilities()` first.

## Shipped providers

- **`AtomicMemoryProvider`** — HTTP client for `atomicmemory-core`. Implements the core operations plus `Packager`, `TemporalSearch`, `Versioner`, `Updater`, `Health`. See [Using the atomicmemory backend](/sdk/guides/atomicmemory-backend).
- **`Mem0Provider`** — HTTP client for Mem0. Implements core operations plus `Health`. See [Using the Mem0 backend](/sdk/guides/mem0-backend).

A third provider is always possible — you write it. See [Writing a custom provider](/sdk/guides/custom-provider).

## Next

- [Capabilities](/sdk/concepts/capabilities) — how to query what a provider supports before calling an extension
- [Scopes and identity](/sdk/concepts/scopes-and-identity) — the scope model every provider receives
