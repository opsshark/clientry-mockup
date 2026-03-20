import { redirect } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import { getCurrentUser } from "@/actions/auth";
import { getPortalData } from "@/actions/portal";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // First-login gate: redirect to welcome if name not set
  if (user && !user.firstName) {
    redirect("/welcome");
  }

  const portal = user?.portalId && user.portalId !== "demo"
    ? await getPortalData(user.portalId)
    : null;

  const displayName = user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : null;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0f0f13" }}>
      <PortalSidebar
        isManager={user?.role === "manager" || user?.role === "admin"}
        isAdmin={user?.role === "admin"}
        userEmail={user?.email ?? null}
        userName={displayName}
        portalName={portal?.name ?? (user?.isDemo ? "Acme Corp" : null)}
        portalLogoUrl={portal?.logoUrl ?? null}
        primaryColor={portal?.primaryColor ?? "#06b6d4"}
      />
      <main className="flex-1 p-4 md:p-8 overflow-auto pt-16 md:pt-8">{children}</main>
    </div>
  );
}
