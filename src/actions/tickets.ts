"use server";

import { getJiraConfig } from "@/lib/config";
import {
  getMyRequests,
  getOrgRequests,
  getRequestByKey,
  getRequestComments,
  addRequestComment,
  type JiraRequest,
  type JiraComment,
} from "@/lib/jira";
import { getCurrentUser } from "./auth";

export interface TicketListItem {
  issueKey: string;
  summary: string;
  status: string;
  statusCategory: string;
  reporter: string;
  createdDate: string;
  createdFriendly: string;
  updatedFriendly: string;
}

export interface TicketDetail {
  issueKey: string;
  summary: string;
  description: string;
  status: string;
  statusCategory: string;
  reporter: string;
  reporterEmail: string;
  createdDate: string;
  createdFriendly: string;
  fields: Array<{ label: string; value: string }>;
  comments: Array<{
    id: string;
    body: string;
    author: string;
    createdFriendly: string;
    isPublic: boolean;
  }>;
}

function extractSummary(request: JiraRequest): string {
  const summaryField = request.requestFieldValues?.find(
    (f) => f.fieldId === "summary"
  );
  return (summaryField?.value as string) ?? request.issueKey;
}

function extractDescription(request: JiraRequest): string {
  const descField = request.requestFieldValues?.find(
    (f) => f.fieldId === "description"
  );
  return (descField?.value as string) ?? "";
}

/**
 * Get the current user's tickets.
 * When authenticated, filters to only show tickets reported by the user.
 * When not authenticated (pre-auth dev), shows all tickets.
 */
export async function getMyTickets(): Promise<TicketListItem[]> {
  const config = getJiraConfig();
  const data = await getMyRequests(config);
  const user = await getCurrentUser();

  let requests = data.values;

  // Filter to user's own tickets when authenticated
  if (user?.email) {
    requests = requests.filter(
      (req) =>
        req.reporter.emailAddress?.toLowerCase() === user.email.toLowerCase()
    );
  }

  return requests.map((req) => ({
    issueKey: req.issueKey,
    summary: extractSummary(req),
    status: req.currentStatus.status,
    statusCategory: req.currentStatus.statusCategory,
    reporter: req.reporter.displayName,
    createdDate: req.createdDate.iso8601,
    createdFriendly: req.createdDate.friendly,
    updatedFriendly: req.currentStatus.statusDate.friendly,
  }));
}

/**
 * Get all tickets for an organization (manager view).
 * Uses hardcoded org ID for now — will use session after auth.
 */
export async function getOrgTickets(
  organizationId: string
): Promise<TicketListItem[]> {
  const config = getJiraConfig();
  const data = await getOrgRequests(config, organizationId);

  return data.values.map((req) => ({
    issueKey: req.issueKey,
    summary: extractSummary(req),
    status: req.currentStatus.status,
    statusCategory: req.currentStatus.statusCategory,
    reporter: req.reporter.displayName,
    createdDate: req.createdDate.iso8601,
    createdFriendly: req.createdDate.friendly,
    updatedFriendly: req.currentStatus.statusDate.friendly,
  }));
}

/**
 * Get full ticket detail including comments.
 */
export async function getTicketDetail(
  issueKey: string
): Promise<TicketDetail> {
  const config = getJiraConfig();

  const [request, commentsData] = await Promise.all([
    getRequestByKey(config, issueKey),
    getRequestComments(config, issueKey),
  ]);

  // Map additional fields (skip summary, description, attachment)
  const skipFields = new Set(["summary", "description", "attachment"]);
  const fields = (request.requestFieldValues ?? [])
    .filter((f) => !skipFields.has(f.fieldId))
    .map((f) => ({
      label: f.label,
      value: formatFieldValue(f.value),
    }));

  const comments = commentsData.values.map((c: JiraComment) => ({
    id: c.id,
    body: c.body,
    author: c.author.displayName,
    createdFriendly: c.created.friendly,
    isPublic: c.public,
  }));

  return {
    issueKey: request.issueKey,
    summary: extractSummary(request),
    description: extractDescription(request),
    status: request.currentStatus.status,
    statusCategory: request.currentStatus.statusCategory,
    reporter: request.reporter.displayName,
    reporterEmail: request.reporter.emailAddress,
    createdDate: request.createdDate.iso8601,
    createdFriendly: request.createdDate.friendly,
    fields,
    comments,
  };
}

/**
 * Add a comment to a ticket.
 */
export async function addComment(
  issueKey: string,
  body: string
): Promise<{ id: string; author: string; createdFriendly: string }> {
  const config = getJiraConfig();
  const comment = await addRequestComment(config, issueKey, body);
  return {
    id: comment.id,
    author: comment.author.displayName,
    createdFriendly: comment.created.friendly,
  };
}

// ─── Helpers ─────────────────────────────────────────────────

function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object" && value !== null) {
    // Jira option fields come as { value: "id", name: "label" }
    if ("name" in value) return (value as { name: string }).name;
    if ("value" in value) return (value as { value: string }).value;
    // Arrays
    if (Array.isArray(value)) {
      return value.map((v) => formatFieldValue(v)).join(", ");
    }
  }
  return String(value);
}
