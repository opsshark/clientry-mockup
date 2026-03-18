-- Portal configurations (one per MSP/team)
CREATE TABLE portals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#06b6d4',
  jira_site_url text NOT NULL,
  jira_service_desk_id text NOT NULL,
  jira_api_token text,
  jira_email text,
  oauth_access_token text,
  oauth_refresh_token text,
  webhook_id text,
  webhook_expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Portal users (external users who have access)
CREATE TABLE portal_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid REFERENCES portals(id),
  email text NOT NULL,
  role text DEFAULT 'user',
  jira_org_id text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(portal_id, email)
);

-- Magic link sessions
CREATE TABLE magic_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid REFERENCES portals(id),
  email text NOT NULL,
  token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Ticket cache (Supabase as read cache)
CREATE TABLE ticket_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid REFERENCES portals(id),
  jira_key text NOT NULL,
  data jsonb NOT NULL,
  cached_at timestamptz DEFAULT now(),
  UNIQUE(portal_id, jira_key)
);

-- Visible request types per portal
CREATE TABLE portal_request_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_id uuid REFERENCES portals(id),
  jira_request_type_id text NOT NULL,
  display_name text,
  display_order int DEFAULT 0,
  enabled boolean DEFAULT true
);

-- Enable Row Level Security on all tables
ALTER TABLE portals ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE magic_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_request_types ENABLE ROW LEVEL SECURITY;
