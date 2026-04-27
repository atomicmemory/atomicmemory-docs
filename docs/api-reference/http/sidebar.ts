import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api-reference/http/atomicmemory-http-api",
    },
    {
      type: "category",
      label: "Agents",
      items: [
        {
          type: "doc",
          id: "api-reference/http/list-agent-conflicts",
          label: "List open agent conflicts for a user.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/auto-resolve-agent-conflicts",
          label: "Auto-resolve all expired conflicts for a user.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/resolve-agent-conflict",
          label: "Resolve a specific conflict with one of the three enum variants.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/http/get-agent-trust",
          label: "Look up the trust level for a (user, agent) pair.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/set-agent-trust",
          label: "Set the calling user's trust level for a given agent.",
          className: "api-method put",
        },
      ],
    },
    {
      type: "category",
      label: "Audit",
      items: [
        {
          type: "doc",
          id: "api-reference/http/get-recent-audit",
          label: "Recent mutations for a user, limit-bounded.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/get-audit-summary",
          label: "Aggregate mutation statistics for a user's memory store.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/get-memory-audit-trail",
          label: "Per-memory version history.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Lifecycle",
      items: [
        {
          type: "doc",
          id: "api-reference/http/check-memory-cap",
          label: "Memory-cap status for a user's store.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/consolidate-memories",
          label: "Compute consolidation candidates; optionally execute (execute=true).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/evaluate-decay",
          label: "Evaluate decay candidates. dry_run=false archives them.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/reconcile-deferred",
          label: "Reconcile deferred mutations for a user (or all users when user_id is absent).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/get-reconcile-status",
          label: "Get deferred-mutation reconciliation status.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/reset-by-source",
          label: "Delete all memories for a given user + source_site.",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Configuration",
      items: [
        {
          type: "doc",
          id: "api-reference/http/update-config",
          label: "Mutate runtime config (dev/test only). 410 when disabled.",
          className: "api-method put",
        },
        {
          type: "doc",
          id: "api-reference/http/get-memory-health",
          label: "Subsystem liveness + current runtime config snapshot.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Memories",
      items: [
        {
          type: "doc",
          id: "api-reference/http/expand-memories",
          label: "Expand a list of memory IDs into full objects.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/ingest-memory",
          label: "Ingest a conversation transcript with full extraction.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/ingest-memory-quick",
          label: "Quick ingest (storeVerbatim when skip_extraction=true).",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/list-memories",
          label: "List memories for a user (or workspace).",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/search-memories",
          label: "Full semantic search with optional temporal / retrieval-mode / token-budget controls.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/search-memories-fast",
          label: "Latency-optimized search (skips LLM repair loop). ~88% lower latency than /search.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/get-stats",
          label: "Aggregate memory statistics for a user.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/delete-memory",
          label: "Delete a single memory by UUID.",
          className: "api-method delete",
        },
        {
          type: "doc",
          id: "api-reference/http/get-memory",
          label: "Fetch a single memory by UUID.",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Lessons",
      items: [
        {
          type: "doc",
          id: "api-reference/http/list-lessons",
          label: "List active lessons for a user.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/report-lesson",
          label: "Report a new lesson.",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api-reference/http/get-lesson-stats",
          label: "Lesson statistics for a user.",
          className: "api-method get",
        },
        {
          type: "doc",
          id: "api-reference/http/deactivate-lesson",
          label: "Deactivate a lesson by id.",
          className: "api-method delete",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
