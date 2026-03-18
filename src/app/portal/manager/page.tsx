import { getOrgTickets } from "@/actions/tickets";
import { mapJiraStatus } from "@/lib/jira-field-mappers";
import ManagerClient from "./ManagerClient";

export const dynamic = "force-dynamic";

// Hardcoded org for now — will come from session/portal config after auth
const ORG_ID = "1";
const ORG_NAME = "Empyra";

export default async function ManagerPage() {
  const tickets = await getOrgTickets(ORG_ID);

  const mapped = tickets.map((t) => ({
    ...t,
    displayStatus: mapJiraStatus(t.status, t.statusCategory),
  }));

  return (
    <div className="max-w-6xl">
      <ManagerClient tickets={mapped} orgName={ORG_NAME} />
    </div>
  );
}
