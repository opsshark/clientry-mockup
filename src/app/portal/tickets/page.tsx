import { getMyTickets } from "@/actions/tickets";
import { mapJiraStatus } from "@/lib/jira-field-mappers";
import TicketList from "./TicketList";

export const dynamic = "force-dynamic";

export default async function MyTicketsPage() {
  const tickets = await getMyTickets();

  const mappedTickets = tickets.map((t) => ({
    ...t,
    displayStatus: mapJiraStatus(t.status, t.statusCategory),
  }));

  return (
    <div className="max-w-5xl">
      <TicketList tickets={mappedTickets} />
    </div>
  );
}
