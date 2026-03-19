"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { ChevronRight, Search } from "lucide-react";

interface Ticket {
  issueKey: string;
  summary: string;
  status: string;
  displayStatus: string;
  reporter: string;
  createdFriendly: string;
  updatedFriendly: string;
}

export default function TicketList({ tickets }: { tickets: Ticket[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = tickets.filter(
    (t) =>
      t.summary.toLowerCase().includes(search.toLowerCase()) ||
      t.issueKey.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">My Tickets</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            Track your submitted requests and their status
          </p>
        </div>
        <button
          onClick={() => router.push("/portal")}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: "#06b6d4", color: "white" }}
        >
          + New Request
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "#475569" }}
        />
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: "#141418",
            border: "1px solid #1e1e2a",
            color: "#e2e8f0",
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
      >
        <table className="w-full min-w-[500px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
              {["Ticket", "Summary", "Status", "Created", ""].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium"
                  style={{ color: "#475569" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((ticket, i) => (
              <tr
                key={ticket.issueKey}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid #1a1a22"
                      : "none",
                }}
                onClick={() =>
                  router.push(`/portal/tickets/${ticket.issueKey}`)
                }
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#1a1a22")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td className="px-4 py-4">
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: "#06b6d4" }}
                  >
                    {ticket.issueKey}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm font-medium">
                    {ticket.summary}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={ticket.displayStatus} />
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs" style={{ color: "#475569" }}>
                    {ticket.createdFriendly}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ChevronRight size={14} style={{ color: "#334155" }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div
              className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "#1e1e2a" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 5H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
                <path d="M9 2h6v3H9z" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>
              {tickets.length === 0 ? "No tickets yet" : "No results"}
            </p>
            <p className="text-xs" style={{ color: "#475569" }}>
              {tickets.length === 0
                ? "Submit your first request to get started."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        )}
      </div>

      {/* Summary stats */}
      <div className="mt-4 flex gap-4 text-xs" style={{ color: "#475569" }}>
        <span>{tickets.length} total</span>
        <span>•</span>
        <span>
          {tickets.filter((t) => t.displayStatus === "Open").length} open
        </span>
        <span>•</span>
        <span>
          {tickets.filter((t) => t.displayStatus === "In Review").length} in
          review
        </span>
      </div>
    </>
  );
}
