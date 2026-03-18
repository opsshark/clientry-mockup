import { getTicketDetail } from "@/actions/tickets";
import { mapJiraStatus } from "@/lib/jira-field-mappers";
import TicketDetailClient from "./TicketDetailClient";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: issueKey } = await params;

  const ticket = await getTicketDetail(issueKey);
  const displayStatus = mapJiraStatus(ticket.status, ticket.statusCategory);

  return <TicketDetailClient ticket={{ ...ticket, displayStatus }} />;
}
