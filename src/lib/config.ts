import type { JiraConfig } from "./jira";

/**
 * Get Jira config for the current portal.
 * For now reads from env vars (single portal).
 * Will later read from Supabase `portals` table per-tenant.
 */
export function getJiraConfig(): JiraConfig {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const serviceDeskId = process.env.JIRA_SERVICE_DESK_ID;

  if (!baseUrl || !email || !apiToken || !serviceDeskId) {
    throw new Error(
      "Missing Jira env vars. Required: JIRA_BASE_URL, JIRA_EMAIL, JIRA_API_TOKEN, JIRA_SERVICE_DESK_ID"
    );
  }

  return { baseUrl, email, apiToken, serviceDeskId };
}
