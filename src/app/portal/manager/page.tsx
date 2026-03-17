"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Bug, Star, MessageCircle, RefreshCw, Filter, ChevronLeft, ChevronRight, Users } from "lucide-react";

const orgTickets = [
  { id: "UAT-2847", summary: "Login page not redirecting after SSO", submitter: "Alex Johnson", type: "Bug", status: "In Review", priority: "High", updated: "2h ago" },
  { id: "UAT-2846", summary: "User profile photo not saving", submitter: "Maria Santos", type: "Bug", status: "Open", priority: "Medium", updated: "3h ago" },
  { id: "UAT-2845", summary: "Bulk import failing for 500+ rows", submitter: "David Kim", type: "Bug", status: "Open", priority: "Critical", updated: "4h ago" },
  { id: "UAT-2844", summary: "Notification emails going to spam", submitter: "Lisa Chen", type: "Bug", status: "In Review", priority: "High", updated: "5h ago" },
  { id: "UAT-2843", summary: "Request to add dark mode option", submitter: "Alex Johnson", type: "Feature", status: "Pending Approval", priority: "Low", updated: "6h ago" },
  { id: "UAT-2842", summary: "Clarify data retention policy", submitter: "Tom Williams", type: "Question", status: "Answered", priority: "Low", updated: "8h ago" },
  { id: "UAT-2840", summary: "Date picker not working in Firefox", submitter: "Maria Santos", type: "Bug", status: "Open", priority: "Medium", updated: "1d ago" },
  { id: "UAT-2839", summary: "Can we add Salesforce integration?", submitter: "David Kim", type: "Change", status: "Pending Approval", priority: "High", updated: "1d ago" },
  { id: "UAT-2838", summary: "Report export timeout over 10k rows", submitter: "Lisa Chen", type: "Bug", status: "In Review", priority: "Critical", updated: "1d ago" },
  { id: "UAT-2831", summary: "Export CSV missing header row", submitter: "Alex Johnson", type: "Bug", status: "Open", priority: "Medium", updated: "1d ago" },
  { id: "UAT-2828", summary: "Permissions not inheriting from parent", submitter: "Tom Williams", type: "Bug", status: "Closed", priority: "High", updated: "2d ago" },
  { id: "UAT-2825", summary: "Add filter by custom field", submitter: "Maria Santos", type: "Change", status: "Pending Approval", priority: "Medium", updated: "2d ago" },
  { id: "UAT-2819", summary: "Confirm: does feature X support Y?", submitter: "Alex Johnson", type: "Question", status: "Answered", priority: "Low", updated: "2d ago" },
  { id: "UAT-2815", summary: "Two-factor auth not prompting on login", submitter: "David Kim", type: "Bug", status: "Closed", priority: "High", updated: "3d ago" },
  { id: "UAT-2810", summary: "Custom roles not applying to sub-orgs", submitter: "Lisa Chen", type: "Bug", status: "Closed", priority: "Critical", updated: "3d ago" },
  { id: "UAT-2805", summary: "API rate limits hitting during batch ops", submitter: "Tom Williams", type: "Bug", status: "Closed", priority: "High", updated: "4d ago" },
  { id: "UAT-2801", summary: "Dashboard loads slow on mobile", submitter: "Alex Johnson", type: "Bug", status: "In Review", priority: "Medium", updated: "3d ago" },
  { id: "UAT-2795", summary: "Webhook events not firing on delete", submitter: "Maria Santos", type: "Bug", status: "Closed", priority: "High", updated: "4d ago" },
  { id: "UAT-2788", summary: "Change request: add filter by date", submitter: "Alex Johnson", type: "Change", status: "Pending Approval", priority: "High", updated: "5d ago" },
  { id: "UAT-2780", summary: "SSO metadata XML format question", submitter: "David Kim", type: "Question", status: "Answered", priority: "Low", updated: "6d ago" },
];

const PAGE_SIZE = 10;

const typeIcon = (type: string) => {
  switch (type) {
    case "Bug": return <Bug size={13} style={{ color: '#f87171' }} />;
    case "Feature": return <Star size={13} style={{ color: '#facc15' }} />;
    case "Question": return <MessageCircle size={13} style={{ color: '#06b6d4' }} />;
    case "Change": return <RefreshCw size={13} style={{ color: '#c084fc' }} />;
    default: return <Bug size={13} />;
  }
};

export default function ManagerPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = orgTickets.filter(t => {
    const statusMatch = statusFilter === "All" || t.status === statusFilter;
    const typeMatch = typeFilter === "All" || t.type === typeFilter;
    return statusMatch && typeMatch;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const selectStyle = {
    backgroundColor: '#141418',
    border: '1px solid #1e1e2a',
    color: '#94a3b8',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar isManager />
      
      <main className="flex-1 p-8">
        <div className="max-w-6xl">
          {/* Manager banner */}
          <div className="rounded-xl p-4 mb-6 flex items-center gap-3"
            style={{ backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
            <Users size={18} style={{ color: '#c084fc' }} />
            <div>
              <span className="text-sm font-semibold" style={{ color: '#c084fc' }}>Manager View</span>
              <span className="text-sm ml-2" style={{ color: '#94a3b8' }}>
                Acme Corp — viewing all team tickets
              </span>
            </div>
            <div className="ml-auto">
              <button
                onClick={() => router.push('/portal/manager/dashboard')}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#c084fc' }}>
                View Dashboard →
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">All Org Tickets</h1>
              <p className="text-sm" style={{ color: '#64748b' }}>
                {filtered.length} tickets across all team members
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} style={{ color: '#475569' }} />
              <span className="text-xs font-medium" style={{ color: '#475569' }}>FILTER:</span>
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} style={selectStyle}>
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Answered">Answered</option>
              <option value="Closed">Closed</option>
            </select>
            <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} style={selectStyle}>
              <option value="All">All Types</option>
              <option value="Bug">Bug</option>
              <option value="Feature">Feature</option>
              <option value="Question">Question</option>
              <option value="Change">Change</option>
            </select>
            <select style={selectStyle}>
              <option>All Submitters</option>
              <option>Alex Johnson</option>
              <option>Maria Santos</option>
              <option>David Kim</option>
              <option>Lisa Chen</option>
              <option>Tom Williams</option>
            </select>
            <select style={selectStyle}>
              <option>All Time</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
            {(statusFilter !== "All" || typeFilter !== "All") && (
              <button
                onClick={() => { setStatusFilter("All"); setTypeFilter("All"); setPage(1); }}
                className="text-xs px-3 py-1.5 rounded-lg"
                style={{ color: '#64748b', border: '1px solid #1e1e2a' }}>
                Clear filters
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2a' }}>
                  {['#', 'Summary', 'Submitter', 'Type', 'Priority', 'Status', 'Updated'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: '#475569' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: i < pageData.length - 1 ? '1px solid #1a1a22' : 'none' }}
                    onClick={() => router.push(`/portal/tickets/${ticket.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a1a22')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold" style={{ color: '#06b6d4' }}>
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm">{ticket.summary}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                          {ticket.submitter.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{ticket.submitter}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {typeIcon(ticket.type)}
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{ticket.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={ticket.status} size="sm" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs" style={{ color: '#475569' }}>{ticket.updated}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs" style={{ color: '#475569' }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                style={{
                  borderColor: '#1e1e2a',
                  color: page === 1 ? '#334155' : '#94a3b8',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}>
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    backgroundColor: page === p ? '#06b6d4' : 'transparent',
                    color: page === p ? 'white' : '#64748b',
                    border: page === p ? 'none' : '1px solid #1e1e2a',
                  }}>
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
                style={{
                  borderColor: '#1e1e2a',
                  color: page === totalPages ? '#334155' : '#94a3b8',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
