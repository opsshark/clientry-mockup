# Clientry — Claude Code Handoff Document
*Written by Theo (AI assistant) for Claude Code*  
*Date: 2026-03-17*

---

## What Is Clientry?

Clientry is a **white-label external collaborator portal for Jira Service Management (JSM)**. It's a standalone SaaS product — no Atlassian Marketplace listing required.

**The problem it solves:** When companies use JSM for project delivery (implementations, UAT, vendor management), external stakeholders (clients, testers, vendors) need to submit and track tickets. But Atlassian requires every user to have an account. Clientry removes that requirement — external users get a branded portal where they can submit tickets and track them via magic link, with no Jira account needed.

**Primary use case (validated with domain expert Travis):**
> A software company is implementing their product for a client. The client's team needs to submit UAT bugs and track them. They don't want to create Atlassian accounts. Clientry gives them a branded portal at `client.clientry.app` to do exactly that.

---

## The Product

### User Types

**End User** (external, no Jira account):
- Receives a magic link via email
- Can submit new tickets via forms pulled from JSM
- Can view only their own tickets (status, comments)
- Has a personal dashboard (my tickets, response times)

**Manager** (elevated external user):
- Same as end user PLUS
- Can see ALL tickets from their organization (scoped by JSM Organization field)
- Has an org-level dashboard (volume, status breakdown, SLA health)

**Jira Admin** (internal, sets up the portal):
- Connects their JSM instance via API
- Configures branding (logo, colors, custom domain)
- Selects which request types are visible on the portal
- Invites external users and assigns roles (end user / manager)

### Core Features (V1)

1. **Magic link auth** — user enters email → gets a link → click → they're in. No passwords, no accounts.
2. **Real JSM forms** — portal auto-imports request types from JSM. Renders them dynamically including Proforma (dynamic) forms with conditional field logic.
3. **Two-way comments** — portal users comment on tickets, Jira agents reply from within Jira. Full sync both directions.
4. **Org-scoped permissions** — managers see their org's tickets via JSM's native Organization field.
5. **White-labeling** — each portal instance has its own branding (logo, colors, domain). "Powered by Clientry" only in footer.
6. **Approval status display** — tickets show approval status as read-only. No approval mechanics in V1.

### Explicitly Out of Scope (V1)
- SSO / SAML (V2)
- Google/Microsoft OAuth login (V2)
- Approval workflows (V2 — too complex, JSM handles it natively anyway)
- SaaS multi-tenancy admin panel (V2 — manually onboard first customers)

---

## Tech Stack

```
Frontend:     Next.js (App Router only) + TypeScript (strict) + Tailwind CSS
Components:   shadcn/ui
Auth:         Supabase Auth (magic link)
Database:     Supabase (postgres) — no ORM, direct client
Email:        Resend + React Email
Forms:        React Hook Form + Zod
Animation:    Framer Motion
Charts:       Recharts
Errors:       Sentry (from day one)
Analytics:    Vercel Analytics
Deployment:   Vercel
Package mgr:  npm (confirm with Travis if he prefers pnpm)
```

---

## Architecture

```
External User
     ↓
Clientry Portal (Next.js)
     ↓ Server Actions (token never in browser)
Jira REST API / JSM API
     ↓
Supabase (cache layer + auth + portal config)
     ↑
Jira Webhooks (push updates: status changes, new comments)
```

### Key architectural decisions

**1. Supabase as cache, Jira as source of truth**
Don't store ticket data permanently in Supabase. Use it as a read cache (TTL ~5 min). Webhooks from Jira invalidate the cache when tickets change. This avoids data sync complexity and keeps Jira as the single source of truth.

**2. Server Actions for all Jira API calls**
The Jira API token (or OAuth token) must NEVER reach the browser. All Jira calls go through Next.js server actions or route handlers. The browser only talks to Supabase (for auth/session) and your own API.

**3. OAuth 2.0 3LO (not API tokens) for production**
Each MSP/team connects their Jira via OAuth flow. They click "Connect Jira" → redirect to Atlassian → approve → return with token. Store tokens encrypted in Supabase. For the current demo/spike we're using Basic auth (email + API token) but OAuth is the production path.

**4. Webhook lifecycle management**
Jira webhooks expire after 30 days (OAuth apps). Must implement a cron job that refreshes webhooks before expiry. Show webhook health on admin dashboard. Silent failure here = portal goes stale.

**5. Rate limits**
65K points/hour shared across ALL Clientry workspaces (Jira's Tier 1 global pool). Cache aggressively. At scale, apply for Tier 2 (per-tenant quotas).

---

## Jira API Reference

**Base URL:** `https://{site}.atlassian.net`

**Auth (Basic for now):**
```typescript
const auth = Buffer.from(`${email}:${apiToken}`).toString('base64')
headers: { 'Authorization': `Basic ${auth}` }
```

**Key endpoints:**

| What | Endpoint |
|------|----------|
| Get service desks | `GET /rest/servicedeskapi/servicedesk` |
| Get request types | `GET /rest/servicedeskapi/servicedesk/{id}/requesttype` |
| Get request type fields | `GET /rest/servicedeskapi/servicedesk/{id}/requesttype/{typeId}/field` |
| Submit ticket | `POST /rest/servicedeskapi/request` |
| Get tickets (by user) | `GET /rest/servicedeskapi/request?requestOwnership=PARTICIPATED_REQUESTS` |
| Get tickets (by org) | `GET /rest/servicedeskapi/request?organizationId={id}` |
| Get comments | `GET /rest/servicedeskapi/request/{key}/comment?public=true` |
| Add comment | `POST /rest/servicedeskapi/request/{key}/comment` |
| Get organizations | `GET /rest/servicedeskapi/organization` |
| Get SLAs | `GET /rest/servicedeskapi/request/{key}/sla` |

**Submit ticket body:**
```json
{
  "serviceDeskId": "7",
  "requestTypeId": "46",
  "requestFieldValues": {
    "summary": "...",
    "description": "..."
  },
  "raiseOnBehalfOf": "user@theirdomain.com"
}
```

**Two form systems exist:**
- **Classic fields** — use `requestFieldValues` in the submit body
- **Proforma forms** — newer, richer. Use `form.answers` in submit body. Conditional logic is client-side only — you must replicate it in React.

---

## Demo Environment

```
Site:       https://demostudio.atlassian.net
Email:      theo@opsshark.com  
API Token:  (see credentials.md in the repo or ask Travis)
Project:    ITSM (IT Service Desk, service desk id: 7)
```

Available JSM projects on demostudio:
- Customer Service Desk (CSDD)
- Example Help Desk (EHD)
- Facilities Service Desk (FSD)
- HR Service Desk (HRSD)
- IT Essentials (IE)
- **IT Service Desk (ITSM)** ← use this one
- Legal Service Desk (LSD)

---

## Supabase Schema

```sql
-- Portal configurations (one per MSP/team)
create table portals (
  id uuid primary key default gen_random_uuid(),
  name text not null,                          -- "Acme Corp IT Portal"
  slug text unique not null,                   -- subdomain: acme.clientry.app
  logo_url text,
  primary_color text default '#06b6d4',
  jira_site_url text not null,                 -- https://acme.atlassian.net
  jira_service_desk_id text not null,
  jira_api_token text,                         -- encrypted, Basic auth (pre-OAuth)
  jira_email text,
  oauth_access_token text,                     -- OAuth 2.0 (production)
  oauth_refresh_token text,
  webhook_id text,
  webhook_expires_at timestamptz,
  created_at timestamptz default now()
);

-- Portal users (external users who have access)
create table portal_users (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references portals(id),
  email text not null,
  role text default 'user',                    -- 'user' | 'manager'
  jira_org_id text,                            -- JSM organization id (for managers)
  created_at timestamptz default now(),
  unique(portal_id, email)
);

-- Magic link sessions
create table magic_sessions (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references portals(id),
  email text not null,
  token text unique not null,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz default now()
);

-- Ticket cache (Supabase as read cache)
create table ticket_cache (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references portals(id),
  jira_key text not null,                      -- e.g. ITSM-1234
  data jsonb not null,                         -- full ticket JSON from Jira
  cached_at timestamptz default now(),
  unique(portal_id, jira_key)
);

-- Visible request types per portal
create table portal_request_types (
  id uuid primary key default gen_random_uuid(),
  portal_id uuid references portals(id),
  jira_request_type_id text not null,
  display_name text,                           -- override JSM name
  display_order int default 0,
  enabled boolean default true
);
```

---

## Dynamic Form Renderer

This is core to Clientry's value prop. JSM has a form builder (Proforma) that lets admins create forms with conditional logic. Clientry must render these forms natively — not just show a textarea.

The renderer takes a form schema (fetched from JSM API) and renders each field based on type. Conditional fields animate in/out with Framer Motion when their conditions are met.

**Supported field types:**
- `short_text` — single line input
- `paragraph` — auto-growing textarea
- `dropdown` — styled select
- `single_choice` — radio buttons as pill cards
- `checkbox_group` — pill chips, multi-select
- `file_upload` — drag & drop UI
- `date_picker` — date input
- `number` — number input
- `user_picker` — text input (search Jira users, V2)

**Conditional logic operators:**
- `equals` — value equals X
- `in` — value is in list
- `contains` — (checkbox groups) checked values contain X

**Key detail:** Conditional logic from Proforma forms is client-side only. The JSM API returns the schema including conditions. You evaluate them in React state. There's no server-side evaluation.

---

## Design System

**Colors:**
```css
--bg-primary: #0f0f13;
--bg-sidebar: #141418;
--bg-card: #1a1a22;
--bg-input: #1e1e2e;
--border: #2a2a3a;
--accent: #06b6d4;          /* teal — Clientry brand */
--accent-hover: #0891b2;
--text-primary: #e2e8f0;
--text-secondary: #94a3b8;
--text-muted: #64748b;
--success: #10b981;
--warning: #f59e0b;
--danger: #ef4444;
```

**Status badge colors:**
- Open → blue (`#3b82f6`)
- In Review → yellow (`#f59e0b`)
- Answered / Resolved → green (`#10b981`)
- Pending Approval → purple (`#8b5cf6`)
- Closed → gray (`#64748b`)

**Typography:** Inter (via next/font)

**The white-label principle:** The portal should look like the client's portal, not like Clientry. Clientry branding is ONLY in the footer: "Powered by Clientry". Everything else — logo, colors, domain — is the client's brand.

---

## Existing Repos

| Repo | URL | Purpose |
|------|-----|---------|
| `clientry-mockup` | https://github.com/theo-opsshark/clientry-mockup | Full clickable mockup (hardcoded data) |
| `clientry-spike` | https://github.com/theo-opsshark/clientry-spike | Real Jira API connection spike (in progress) |

**Live mockup:** https://clientry-mockup.vercel.app
- Click "Demo: Enter as End User" or "Demo: Enter as Manager"
- Go to Submit → UAT Bug Report to see the dynamic form renderer with conditional logic

---

## Business Context

**Who Travis is:**
- Atlassian Platinum partner with 10+ years JSM experience
- Runs OpSharp (his own consulting/app company)
- Goal: build profitable apps through OpSharp, eventually leave his day job
- Has existing client relationships who are potential beta customers

**Why Clientry:**
- Validated pain: teams doing implementations/UAT constantly hit the "client needs to track tickets but won't create Atlassian accounts" wall
- Travis has unfair advantage: domain expertise, existing clients for validation, natural upsell in every JSM engagement
- Standalone SaaS (not Marketplace) = no 25% revenue share, faster to ship, full pricing control

**Monetization model (TBD):**
- Per portal per month (~$99-299/month)
- Or per active user on the portal
- First 10 customers should be direct from Travis's network

---

## What's Been Built So Far

1. ✅ **Mockup** — 9 screens, fully clickable, dark theme, teal accent, white-labeled as "Acme Corp"
2. ✅ **Dynamic form renderer** — takes a JSON schema, renders fields, conditional logic with Framer Motion animations
3. ✅ **Jira API connection confirmed** — authenticated against demostudio.atlassian.net, pulled live request types
4. 🔄 **Spike in progress** — real Next.js app hitting real Jira API (being built right now)

---

## Recommended Next Steps

1. **Pull the spike repo** when it's done — it'll have the working Jira API integration pattern
2. **Merge mockup + spike** — take the spike's API layer, apply the mockup's UI, get a real working demo
3. **Build the admin setup flow** — the "Connect your Jira" onboarding is the hardest UX problem
4. **Validate with 1 real client** — show Travis a working portal connected to their Jira instance, get feedback

---

## Notes for Claude Code

- Travis prefers **direct, no-fluff communication**. Skip the pleasantries.
- He vibe codes — he'll guide direction, you build. Move fast.
- Always use App Router, never Pages Router.
- TypeScript strict — no `any` types.
- shadcn/ui for components where possible.
- The Jira API token should NEVER be in the browser. Server actions only.
- When in doubt about product decisions, refer back to this doc — a lot of the "why" is documented here.

Good luck. Build something great.

— Theo
