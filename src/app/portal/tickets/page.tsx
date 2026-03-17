"use client";

import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Bug, Star, MessageCircle, RefreshCw, ChevronRight, Search } from "lucide-react";
import { useState } from "react";

const tickets = [
  { id: "UAT-2847", summary: "Login page not redirecting after SSO", type: "Bug", status: "In Review", priority: "High", updated: "2h ago" },
  { id: "UAT-2831", summary: "Export CSV missing header row", type: "Bug", status: "Open", priority: "Medium", updated: "1d ago" },
  { id: "UAT-2819", summary: "Confirm: does feature X support Y?", type: "Question", status: "Answered", priority: "Low", updated: "2d ago" },
  { id: "UAT-2801", summary: "Dashboard loads slow on mobile", type: "Bug", status: "In Review", priority: "Medium", updated: "3d ago" },
  { id: "UAT-2788", summary: "Change request: add filter by date", type: "Change", status: "Pending Approval", priority: "High", updated: "5d ago" },
];

const typeIcon = (type: string) => {
  switch (type) {
    case "Bug": return <Bug size={14} style={{ color: '#f87171' }} />;
    case "Feature": return <Star size={14} style={{ color: '#facc15' }} />;
    case "Question": return <MessageCircle size={14} style={{ color: '#06b6d4' }} />;
    case "Change": return <RefreshCw size={14} style={{ color: '#c084fc' }} />;
    default: return <Bug size={14} />;
  }
};

export default function MyTicketsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(t =>
    t.summary.toLowerCase().includes(search.toLowerCase()) ||
    t.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-5xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">My Tickets</h1>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Track your submitted requests and their status
              </p>
            </div>
            <button
              onClick={() => router.push('/portal')}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: '#06b6d4', color: 'white' }}>
              + New Request
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
              style={{
                backgroundColor: '#141418',
                border: '1px solid #1e1e2a',
                color: '#e2e8f0',
                outline: 'none',
              }}
            />
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #1e1e2a' }}>
                  {['Ticket', 'Summary', 'Type', 'Priority', 'Status', 'Updated', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium"
                      style={{ color: '#475569' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket, i) => (
                  <tr
                    key={ticket.id}
                    className="cursor-pointer transition-colors"
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid #1a1a22' : 'none',
                    }}
                    onClick={() => router.push(`/portal/tickets/${ticket.id}`)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#1a1a22')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold" style={{ color: '#06b6d4' }}>
                        {ticket.id}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium">{ticket.summary}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        {typeIcon(ticket.type)}
                        <span className="text-xs" style={{ color: '#94a3b8' }}>{ticket.type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <PriorityBadge priority={ticket.priority} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs" style={{ color: '#475569' }}>{ticket.updated}</span>
                    </td>
                    <td className="px-4 py-4">
                      <ChevronRight size={14} style={{ color: '#334155' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm" style={{ color: '#475569' }}>No tickets found</p>
              </div>
            )}
          </div>

          {/* Summary stats */}
          <div className="mt-4 flex gap-4 text-xs" style={{ color: '#475569' }}>
            <span>{tickets.length} total</span>
            <span>•</span>
            <span>{tickets.filter(t => t.status === 'Open').length} open</span>
            <span>•</span>
            <span>{tickets.filter(t => t.status === 'In Review').length} in review</span>
          </div>
        </div>
      </main>
    </div>
  );
}
