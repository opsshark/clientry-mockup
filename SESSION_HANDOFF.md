# Clientry — Session Handoff
*Session date: 2026-03-18*

---

## What Is Clientry?

White-label external collaborator portal for Jira Service Management. External users (clients, testers, vendors) submit and track tickets via magic link — no Jira account needed. See `CLAUDE_HANDOFF.md` for full product context.

---

## What Was Built This Session

7 commits covering Phase 2 hardening through admin setup:

| Commit | What |
|--------|------|
| `6e1d5de` | RLS policies, manager route protection, ticket caching (5min TTL), replace hardcoded org data |
| `a659967` | Personal + manager dashboards wired to real Jira data |
| `599bab9` | Multi-portal: `getJiraConfig()` loads from Supabase per portal, dynamic sidebar branding |
| `be830f6` | Auth callback handles both PKCE and implicit flows (was broken, now works) |
| `aced811` | Skip unsupported `service-entity-field` type (Affected Services) |
| `5b4536e` | Admin settings page — 4 tabs: Jira connection, branding, request types, users |

---

## Current Architecture

```
Browser → Next.js App Router (server components + server actions)
  → Jira REST API (per-portal config from Supabase)
  → Supabase (auth, portal config, ticket cache, user management)
```

**Key files:**
- `src/lib/jira.ts` — Jira API client (all endpoints accept JiraConfig)
- `src/lib/config.ts` — `getJiraConfig(portalId)` loads from Supabase, env-var fallback
- `src/actions/auth.ts` — `getCurrentUser()` returns email, role, portalId
- `src/actions/admin.ts` — All admin CRUD operations
- `src/actions/tickets.ts` — Ticket list/detail with Supabase caching
- `src/actions/forms.ts` — Form rendering with request type filtering
- `src/actions/dashboard.ts` — Dashboard aggregation from ticket data
- `src/app/portal/layout.tsx` — Shared layout, fetches portal branding
- `src/components/DynamicFormRenderer.tsx` — Renders JSM + Proforma forms
- `src/lib/proforma-to-form-schema.ts` — Proforma → form schema bridge

**Auth flow:**
1. User enters email on login page
2. `sendMagicLink()` checks `portal_users` allowlist, sends Supabase OTP
3. User clicks email link → `/auth/callback` (client page)
4. Callback handles both PKCE (`?code=`) and implicit (`#access_token=`) flows
5. Session set → redirect to `/portal`
6. Middleware refreshes session on every request, protects `/portal/*` when `AUTH_ENABLED=true`

**Roles:** `user` | `manager` | `admin`
- Users: submit tickets, view own tickets, personal dashboard
- Managers: everything users see + org tickets + manager dashboard
- Admins: everything managers see + settings page

---

## Environment

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tkxkethzgfkjedncpkzs.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Jira (fallback for pre-auth dev mode)
JIRA_BASE_URL=https://demostudio.atlassian.net
JIRA_EMAIL=theo@opsshark.com
JIRA_API_TOKEN=...
JIRA_SERVICE_DESK_ID=113

AUTH_ENABLED=false
# PORTAL_ENCRYPTION_KEY= (needed for admin token encryption)
```

**Supabase data:**
- Portal: "Acme Corp" (id: `f103d4df-4e83-4cf9-b3aa-bd5481834c0c`)
- Users: `theo@opsshark.com` (admin), `alex@acmecorp.com` (user)
- Jira creds set directly on the portal row

---

## Known Issues / Gaps

1. **PORTAL_ENCRYPTION_KEY not set** — admin page saves tokens, but encryption won't work without this env var. Set any random string.
2. **`service-entity-field` unsupported** — "Affected Services" field on "Get developer support" is skipped. Needs separate Jira services API.
3. **SLA data** — both dashboards show "Coming soon" placeholder. Per Theo: defer to dedicated SLA phase.
4. **Login page "Acme Corp" hardcode** — the login page still shows static "Acme Corp" branding since portal isn't known before login (email-based lookup). Fine for V1.
5. **Demo buttons on login** — "Demo: Enter as End User/Manager" buttons still show when `AUTH_ENABLED=true`. They just redirect back to login. Could hide them.
6. **Webhooks** — parked. TTL-based caching (5min) is fine for now.

---

## What's Next (Per Theo)

1. **Customer validation** — connect a real client's Jira instance through the admin UI
2. **Polish** — error states, loading skeletons, edge cases
3. **Deploy to Vercel** — production deployment for demo
4. **OAuth 2.0** — replace API token auth with Atlassian OAuth (V2)
5. **Self-serve signup** — registration + billing (V2)

---

## How to Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # verify before committing
```

To test with auth:
1. Set `AUTH_ENABLED=true` in `.env.local`
2. Enter theo@opsshark.com on login page
3. Check email for magic link, or use admin API to generate one:
   ```js
   // In node with env vars loaded:
   const { createClient } = require('@supabase/supabase-js');
   const c = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });
   c.auth.admin.generateLink({ type: 'magiclink', email: 'theo@opsshark.com', options: { redirectTo: 'http://localhost:3000/auth/callback' } });
   // Navigate to the returned action_link in browser
   ```

---

## Conventions

- **Build after every task**: `npm run build` must pass clean
- **Server actions for all Jira API calls**: tokens never reach the browser
- **Service role for DB writes**: RLS only has SELECT policies, all writes via service role
- **In-memory caches**: JiraConfig, PortalData, OrgNames — cleared on server restart or admin changes
- **Don't reorder Jira fields**: admins configure field order in JSM, respect it
- **Theo sequences execution**: follow his priority order when given
