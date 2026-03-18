import PortalSidebar from "@/components/PortalSidebar";
import { getCurrentUser } from "@/actions/auth";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#0f0f13" }}>
      <PortalSidebar
        isManager={user?.role === "manager"}
        userEmail={user?.email ?? null}
      />
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
