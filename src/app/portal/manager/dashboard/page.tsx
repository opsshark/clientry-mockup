import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getManagerDashboardData } from "@/actions/dashboard";
import { getOrgName } from "@/actions/org";
import ManagerDashboardContent from "./DashboardContent";

export const dynamic = "force-dynamic";

export default async function ManagerDashboardPage() {
  const user = await getCurrentUser();

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
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-2" style={{ color: "#e2e8f0" }}>
            No Organization Linked
          </h3>
          <p className="text-sm mb-1" style={{ color: "#64748b" }}>
            Dashboard data requires an organization link.
          </p>
          <p className="text-xs" style={{ color: "#475569" }}>
            Ask your portal admin to set your organization ID in Settings &rarr; Users.
          </p>
        </div>
      </div>
    );
  }

  const [data, orgName] = await Promise.all([
    getManagerDashboardData(user.jiraOrgId),
    getOrgName(user.jiraOrgId),
  ]);

  return <ManagerDashboardContent data={data} orgName={orgName} />;
}
