import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getOrgTickets } from "@/actions/tickets";
import { getOrgName } from "@/actions/org";
import { mapJiraStatus } from "@/lib/jira-field-mappers";
import ManagerClient from "./ManagerClient";

export const dynamic = "force-dynamic";

export default async function ManagerPage() {
  const user = await getCurrentUser();

  // Role gate: only managers can access this page
  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    redirect("/portal");
  }

  if (!user.jiraOrgId) {
    return (
      <div className="max-w-6xl">
        <div
          className="rounded-xl p-8 text-center max-w-lg mx-auto mt-12"
          style={{ backgroundColor: "#141418", border: "1px solid #1e1e2a" }}
        >
          <div
            className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: "#1e1e2a" }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#e2e8f0" }}>
            No Organization Linked
          </h3>
          <p className="text-sm mb-1" style={{ color: "#64748b" }}>
            Your account isn&apos;t linked to a Jira organization yet.
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            Ask your portal admin to set your organization ID in Settings &rarr; Users.
          </p>
        </div>
      </div>
    );
  }

  const [tickets, orgName] = await Promise.all([
    getOrgTickets(user.jiraOrgId),
    getOrgName(user.jiraOrgId),
  ]);

  const mapped = tickets.map((t) => ({
    ...t,
    displayStatus: mapJiraStatus(t.status, t.statusCategory),
  }));

  return (
    <div className="max-w-6xl">
      <ManagerClient tickets={mapped} orgName={orgName} />
    </div>
  );
}
