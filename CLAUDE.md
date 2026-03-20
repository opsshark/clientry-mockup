# Clientry

White-label external collaborator portal for Jira Service Management. External users submit and track JSM tickets through a branded portal using magic link auth — no Jira account required.

## Commands

```bash
npm run dev        # Start dev server (http://localhost:3000)
npm run build      # Production build — must pass clean after every change
npm run lint       # ESLint
```

## Architecture

- **Next.js 16 App Router** — Server Components + Server Actions. Never use Pages Router.
- **Supabase as cache, Jira as source of truth** — Ticket data cached with 5-min TTL. No permanent Jira data storage.
- **Server Actions for all Jira calls** — API tokens must never reach the browser.
- **Multi-tenant** — `portals` table holds per-tenant Jira config, branding, and user lists. RLS enforces isolation.
- **Roles:** `user` | `manager` | `admin`, enforced server-side.
- **Service role for DB writes** — RLS only has SELECT policies; all writes use the Supabase service role client.

## Key Files

- `src/lib/jira.ts` — Jira API client (all endpoints accept JiraConfig)
- `src/lib/config.ts` — `getJiraConfig(portalId)` loads from Supabase with env-var fallback
- `src/actions/` — All server actions (auth, tickets, forms, admin, dashboard, portal, org)
- `src/components/DynamicFormRenderer.tsx` — Core form engine (JSM + Proforma schemas, conditional fields)
- `src/middleware.ts` — Auth guard + session refresh
- `supabase/migrations/` — 5 migration files

## Conventions

- **TypeScript strict** — no `any` types
- **Don't reorder Jira fields** — admins configure field order in JSM, respect it
- **`npm run build` must pass clean** after every task
- **Direct communication** — skip pleasantries, move fast
- **Follow Travis's priority order** when given a sequence of tasks

## Jira API Gotchas

- Select field values are numeric IDs (`"10004"` not `"High"`) — pass numeric strings directly
- Internal request types have `groupIds: []` — filter them out
- `service-entity-field` type is unsupported — skip it
- Rate limit: 65K points/hour shared across all tenants — cache aggressively
- Jira icon URLs require auth — use emoji fallbacks for portal display

## Context

See `CLAUDE_HANDOFF.md` for full product context, session history, and known issues.
See `CLAUDE_HANDOFF_ORIGINAL.md` for original product vision.
