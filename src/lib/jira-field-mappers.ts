/**
 * Map Jira status names and categories to StatusBadge-compatible values.
 *
 * Jira uses statusCategory (NEW, INDETERMINATE, DONE) to group statuses.
 * Individual status names vary per project. We map to our badge system.
 */

const STATUS_MAP: Record<string, string> = {
  // Common JSM statuses
  "Waiting for support": "In Review",
  "Waiting for customer": "Answered",
  "Pending": "Pending Approval",
  "In progress": "In Review",
  "Escalated": "In Review",
  "Resolved": "Resolved",
  "Closed": "Closed",
  "Done": "Closed",
  "Declined": "Closed",
  "Canceled": "Closed",
};

/**
 * Map a Jira status name to a StatusBadge-compatible status.
 * Falls back to category-based mapping if no exact match.
 */
export function mapJiraStatus(
  statusName: string,
  statusCategory: string
): string {
  // Check exact match first
  const mapped = STATUS_MAP[statusName];
  if (mapped) return mapped;

  // Fall back to category-based mapping
  switch (statusCategory) {
    case "NEW":
      return "Open";
    case "INDETERMINATE":
      return "In Review";
    case "DONE":
      return "Resolved";
    default:
      return statusName;
  }
}
