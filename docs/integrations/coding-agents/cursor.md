---
title: Cursor
sidebar_position: 4
---

# Cursor

:::note[Planned]
This integration is on the roadmap. The shared `@atomicmemory/mcp-server` works with Cursor's MCP support today, but the packaged install (rules template + one-line MCP registration) is not yet shipped. See the manual setup below.
:::

## Intended shape

Cursor consumes memory through two surfaces — MCP for tool calls and `.cursor/rules` for always-on guidance. The integration will:

1. Ship a one-click MCP server registration via `cursor://` deep link.
2. Include a `.cursor/rules/atomicmemory.md` template with the search/ingest guidance.
3. Support the same config shape as the Claude Code and OpenClaw plugins.

## Manual setup (today)

Register the MCP server in Cursor's settings:

```json
{
  "mcpServers": {
    "atomicmemory": {
      "command": "npx",
      "args": ["-y", "@atomicmemory/mcp-server"],
      "env": {
        "ATOMICMEMORY_API_URL": "https://memory.yourco.com",
        "ATOMICMEMORY_API_KEY": "am_live_…"
      }
    }
  }
}
```

Then drop a rules file at `.cursor/rules/atomicmemory.md` using the [Claude Code skill body](/integrations/coding-agents/claude-code#the-skill) as a starting point.

## See also

- [Claude Code integration](/integrations/coding-agents/claude-code)
