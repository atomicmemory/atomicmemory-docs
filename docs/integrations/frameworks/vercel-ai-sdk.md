---
title: Vercel AI SDK
sidebar_position: 1
---

# Vercel AI SDK

:::note[Planned]
This adapter is on the roadmap. AtomicMemory's SDK already runs in any Node / edge / browser context where the Vercel AI SDK runs, but the packaged adapter (`@atomicmemory/vercel-ai`) with `streamText` middleware is not yet shipped. See the manual pattern below to compose it today.
:::

## Intended shape

```ts
import { streamText } from 'ai';
import { withMemory } from '@atomicmemory/vercel-ai';
import { MemoryClient } from '@atomicmemory/atomicmemory-sdk';

const memory = new MemoryClient({
  providers: { atomicmemory: { apiUrl: process.env.ATOMICMEMORY_URL } },
});

const result = streamText({
  model,                             // any AI SDK model — plain string routes via AI Gateway
  messages,
  experimental_transform: withMemory(memory, {
    scope: { user: userId },
    ingestOnFinish: true,
  }),
});
```

The adapter:

- **Retrieves** relevant memories before the LLM call and injects them into the system prompt.
- **Ingests** the final turn after `onFinish`, using AtomicMemory's AUDN mutation so duplicates don't accumulate.
- **Honors capabilities** — if the backing provider doesn't support packaging or trust, the adapter degrades gracefully.

## Manual pattern (today)

Until `@atomicmemory/vercel-ai` ships, compose manually around `streamText`:

```ts
const context = await memory.search({ query, scope });
const result = streamText({
  model,
  system: `Prior context:\n${context.memories.map(m => m.content).join('\n')}`,
  messages,
  onFinish: async ({ text }) => {
    await memory.ingest({
      mode: 'messages',
      messages: [...messages, { role: 'assistant', content: text }],
      scope,
    });
  },
});
```

## See also

- [SDK Overview](/sdk/overview)
- [Mastra integration](/integrations/frameworks/mastra)
