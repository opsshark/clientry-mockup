/**
 * Jira Service Management API client.
 * All functions accept a JiraConfig so they work per-tenant.
 * Token never reaches the browser — server actions only.
 */

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  serviceDeskId: string;
}

// ─── Response Types ──────────────────────────────────────────

export interface RequestType {
  id: string;
  name: string;
  description: string;
  icon: {
    id: string;
    _links: {
      iconUrls: {
        "48x48": string;
        "24x24": string;
      };
    };
  };
  serviceDeskId: string;
  groupIds: string[];
}

export interface FieldValidValue {
  value: string;
  label: string;
  children: FieldValidValue[];
}

export interface RequestTypeField {
  fieldId: string;
  name: string;
  description: string;
  required: boolean;
  defaultValues: unknown[];
  validValues: FieldValidValue[];
  jiraSchema: {
    type: string;
    system?: string;
    items?: string;
    custom?: string;
  };
  visible: boolean;
}

export interface JiraRequest {
  issueId: string;
  issueKey: string;
  requestTypeId: string;
  serviceDeskId: string;
  createdDate: {
    iso8601: string;
    jpirelative: string;
    friendly: string;
  };
  reporter: {
    accountId: string;
    emailAddress: string;
    displayName: string;
    active: boolean;
  };
  requestFieldValues: Array<{
    fieldId: string;
    label: string;
    value: unknown;
  }>;
  currentStatus: {
    status: string;
    statusCategory: "UNDEFINED" | "NEW" | "INDETERMINATE" | "DONE";
    statusDate: {
      iso8601: string;
      friendly: string;
    };
  };
  _links: {
    web: string;
    self: string;
  };
}

export interface JiraComment {
  id: string;
  body: string;
  public: boolean;
  author: {
    accountId: string;
    emailAddress: string;
    displayName: string;
    active: boolean;
  };
  created: {
    iso8601: string;
    friendly: string;
  };
}

export interface CreatedRequest {
  issueKey: string;
  issueId: string;
  _links: {
    web: string;
    self: string;
  };
}

interface PaginatedResponse<T> {
  size: number;
  start: number;
  limit: number;
  isLastPage: boolean;
  values: T[];
}

// ─── Proforma Types ─────────────────────────────────────────

export interface ProformaChoice {
  id: string;
  label: string;
  other: boolean;
}

export interface ProformaQuestion {
  label: string;
  description: string;
  type: string; // tl=text line, pg=paragraph, cs=choice single, cd=choice dropdown, cm=choice multi, da=date, no=number, us=user single, um=user multi, ts=text short
  choices?: ProformaChoice[];
  jiraField?: string;
  questionKey?: string;
  validation: {
    rq: boolean; // required
    wh?: boolean;
  };
}

export interface ProformaCondition {
  i: {
    co: {
      cIds: Record<string, string[]>; // questionId → choice IDs
    };
  };
  o: {
    sIds: string[]; // section IDs to show
    t: string; // "sh" = show
  };
}

export interface ProformaSection {
  sectionType: string;
  name?: string;
  conditions?: string[]; // condition IDs
}

export interface ProformaForm {
  id: string;
  design: {
    conditions: Record<string, ProformaCondition>;
    layout: Array<{
      version: number;
      type: string;
      content: unknown[];
    }>;
    questions: Record<string, ProformaQuestion>;
    sections: Record<string, ProformaSection>;
    settings: {
      name: string;
      submit?: { lock: boolean; pdf: boolean };
    };
  };
  publish: {
    portalRequestTypeIds: number[];
    submitOnCreate: boolean;
    validateOnCreate: boolean;
  };
}

// ─── Internal Helpers ────────────────────────────────────────

function getAuthHeaders(config: JiraConfig): Record<string, string> {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");
  return {
    Authorization: `Basic ${auth}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };
}

function serviceDeskUrl(config: JiraConfig, path: string): string {
  return `${config.baseUrl}/rest/servicedeskapi/servicedesk/${config.serviceDeskId}${path}`;
}

function requestUrl(config: JiraConfig, path: string): string {
  return `${config.baseUrl}/rest/servicedeskapi/request${path}`;
}

async function jiraFetch<T>(url: string, config: JiraConfig, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { ...getAuthHeaders(config), ...init?.headers },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Jira API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public API ──────────────────────────────────────────────

/**
 * Get all request types for the service desk.
 * Filters out internal-only types (groupIds is empty).
 */
export async function getRequestTypes(config: JiraConfig): Promise<RequestType[]> {
  const data = await jiraFetch<PaginatedResponse<RequestType>>(
    serviceDeskUrl(config, "/requesttype?limit=50"),
    config
  );
  return data.values.filter((rt) => rt.groupIds.length > 0);
}

/**
 * Get field definitions for a specific request type.
 */
export async function getRequestTypeFields(
  config: JiraConfig,
  requestTypeId: string
): Promise<{ requestTypeFields: RequestTypeField[]; canRaiseOnBehalfOf: boolean }> {
  return jiraFetch(
    serviceDeskUrl(config, `/requesttype/${requestTypeId}/field`),
    config
  );
}

/**
 * Create a new service request (ticket).
 */
export async function createRequest(
  config: JiraConfig,
  requestTypeId: string,
  fieldValues: Record<string, unknown>,
  raiseOnBehalfOf?: string
): Promise<CreatedRequest> {
  const body: Record<string, unknown> = {
    serviceDeskId: config.serviceDeskId,
    requestTypeId,
    requestFieldValues: fieldValues,
  };
  if (raiseOnBehalfOf) {
    body.raiseOnBehalfOf = raiseOnBehalfOf;
  }

  return jiraFetch<CreatedRequest>(
    requestUrl(config, ""),
    config,
    { method: "POST", body: JSON.stringify(body) }
  );
}

/**
 * Get requests where the user participated (submitted or was mentioned).
 */
export async function getMyRequests(
  config: JiraConfig,
  options?: { start?: number; limit?: number }
): Promise<PaginatedResponse<JiraRequest>> {
  const start = options?.start ?? 0;
  const limit = options?.limit ?? 50;
  // Using ALL_REQUESTS pre-auth (agent API key sees everything).
  // After Phase 2 auth, switch to filtering by authenticated user's email.
  return jiraFetch(
    requestUrl(config, `?requestOwnership=ALL_REQUESTS&start=${start}&limit=${limit}`),
    config
  );
}

/**
 * Get all requests for an organization (manager view).
 */
export async function getOrgRequests(
  config: JiraConfig,
  organizationId: string,
  options?: { start?: number; limit?: number }
): Promise<PaginatedResponse<JiraRequest>> {
  const start = options?.start ?? 0;
  const limit = options?.limit ?? 50;
  return jiraFetch(
    requestUrl(config, `?organizationId=${organizationId}&start=${start}&limit=${limit}`),
    config
  );
}

/**
 * Get a single request by its issue key (e.g. "ITSM-123").
 */
export async function getRequestByKey(
  config: JiraConfig,
  issueKey: string
): Promise<JiraRequest> {
  return jiraFetch(
    requestUrl(config, `/${issueKey}?expand=requestFieldValues`),
    config
  );
}

/**
 * Get public comments on a request.
 */
export async function getRequestComments(
  config: JiraConfig,
  issueKey: string,
  options?: { start?: number; limit?: number }
): Promise<PaginatedResponse<JiraComment>> {
  const start = options?.start ?? 0;
  const limit = options?.limit ?? 50;
  return jiraFetch(
    requestUrl(config, `/${issueKey}/comment?public=true&start=${start}&limit=${limit}`),
    config
  );
}

/**
 * Add a public comment to a request.
 */
export async function addRequestComment(
  config: JiraConfig,
  issueKey: string,
  body: string
): Promise<JiraComment> {
  return jiraFetch<JiraComment>(
    requestUrl(config, `/${issueKey}/comment`),
    config,
    { method: "POST", body: JSON.stringify({ body, public: true }) }
  );
}

/**
 * Get organizations visible to the authenticated user.
 */
export async function getOrganizations(
  config: JiraConfig
): Promise<PaginatedResponse<{ id: string; name: string }>> {
  return jiraFetch(
    `${config.baseUrl}/rest/servicedeskapi/organization`,
    config
  );
}

/**
 * Get SLA information for a request.
 */
export async function getRequestSlas(
  config: JiraConfig,
  issueKey: string
): Promise<PaginatedResponse<{
  id: string;
  name: string;
  completedCycles: Array<{ remainingTime: { friendly: string }; breached: boolean }>;
  ongoingCycle: { remainingTime: { friendly: string }; breached: boolean } | null;
}>> {
  return jiraFetch(
    requestUrl(config, `/${issueKey}/sla`),
    config
  );
}

/**
 * Get the Atlassian cloud ID for this site.
 * Cached in-memory since it never changes.
 */
let cachedCloudId: string | null = null;

async function getCloudId(config: JiraConfig): Promise<string> {
  if (cachedCloudId) return cachedCloudId;
  const res = await fetch(`${config.baseUrl}/_edge/tenant_info`, {
    headers: getAuthHeaders(config),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to get cloud ID");
  const data = (await res.json()) as { cloudId: string };
  cachedCloudId = data.cloudId;
  return data.cloudId;
}

/**
 * Get the Proforma form for a request type (if one exists).
 * Returns null if no Proforma form is configured.
 */
export async function getProformaForm(
  config: JiraConfig,
  requestTypeId: string
): Promise<ProformaForm | null> {
  const cloudId = await getCloudId(config);
  const url = `https://api.atlassian.com/jira/forms/cloud/${cloudId}/servicedesk/${config.serviceDeskId}/requesttype/${requestTypeId}/form`;

  const res = await fetch(url, {
    headers: getAuthHeaders(config),
    cache: "no-store",
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Proforma API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<ProformaForm>;
}
