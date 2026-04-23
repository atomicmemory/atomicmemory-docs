---
title: OpenAI Agents SDK
sidebar_position: 4
---

# OpenAI Agents SDK

:::note[Planned]
This adapter is on the roadmap. The shape below is the intended API, not a shipped package.
:::

## Intended shape

`@atomicmemory/openai-agents` will expose AtomicMemory as agent tools and as a session-level context provider:

```ts
import { Agent } from '@openai/agents';
import { atomicMemoryTools } from '@atomicmemory/openai-agents';

const agent = new Agent({
  name: 'assistant',
  instructions: '…',
  tools: atomicMemoryTools({ client: memoryClient, scope }),
});
```

For multi-agent workflows, the adapter also supplies a session handoff that preserves memory scope across agent boundaries — so a routing agent's memory is visible to the specialist agent it hands off to, when scoped the same way.

## See also

- [SDK Overview](/sdk/overview)
