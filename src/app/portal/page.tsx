import { getPortalRequestTypes } from "@/actions/forms";
import RequestTypeCards from "./RequestTypeCards";

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const requestTypes = await getPortalRequestTypes();

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">Submit a Request</h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Choose a request type below to get started
        </p>
      </div>

      <RequestTypeCards requestTypes={requestTypes} />
    </div>
  );
}
