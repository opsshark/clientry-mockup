import { getPersonalDashboardData } from "@/actions/dashboard";
import { getCurrentUser } from "@/actions/auth";
import DashboardContent from "./DashboardContent";

export const dynamic = "force-dynamic";

export default async function PersonalDashboard() {
  const [data, user] = await Promise.all([
    getPersonalDashboardData(),
    getCurrentUser(),
  ]);

  const displayName = user?.email?.split("@")[0] ?? "there";

  return <DashboardContent data={data} userName={displayName} />;
}
