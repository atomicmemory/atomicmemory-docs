# atomicmemory-docs

Documentation site for [AtomicMemory](https://github.com/atomicmemory) — the
standardized platform layer for AI memory.

Live site: **[docs.atomicmemory.ai](https://docs.atomicmemory.ai)**

Built with [Docusaurus](https://docusaurus.io/). Deployed to GitHub Pages.

## Structure

```
docs/
├─ introduction.md          # Landing page (served at /)
├─ quickstart.md            # Docker → first ingest/search in 2 minutes
├─ platform/                # Why modular — the differentiator narrative
│  ├─ architecture.md       # Ingest / Search / CRUD / Lifecycle / Trust separation
│  ├─ composition.md        # createCoreRuntime, createApp, bindEphemeral seams
│  ├─ stores.md             # MemoryStore / SearchStore / ClaimStore / EntityStore / EpisodeStore
│  ├─ providers.md          # Pluggable embedding + LLM
│  ├─ scope.md              # MemoryScope (user / workspace / agent)
│  └─ observability.md      # RetrievalResult.observability, trace schemas
└─ api-reference/
   ├─ http/                 # Generated from @atomicmemory/atomicmemory-core's OpenAPI spec
   └─ sdk/                  # SDK method reference (coming soon)
```

## Local development

```bash
npm install
npm start      # Open http://localhost:3013
npm run build  # Static build in build/
```

Both `start` and `serve` are pinned to port **3013**.

## Refreshing the HTTP API reference

The `/api-reference/http/*` pages are generated from the OpenAPI spec
vendored under `vendor/atomicmemory-core-openapi.yaml`. After
`atomicmemory-core` ships a new release:

```bash
npm install @atomicmemory/atomicmemory-core@<new-version>
npm run vendor:spec     # refresh the vendored openapi.yaml
npm run regen:api       # clean + regenerate the .mdx artifacts
git commit -am "Refresh vendored core openapi spec"
```

`prestart` and `prebuild` both run `regen:api` so local dev and CI
builds always render from the committed vendored spec.

## Contributing

`platform/` and `sdk/` pages are authored by hand. `api-reference/http/`
pages are generated — edit `atomicmemory-core/src/schemas/*.ts` and
regenerate via the workflow above to change them.

Apache-2.0 licensed. See [atomicmemory-core](https://github.com/atomicmemory/atomicmemory-core)
for the engine this documents.
