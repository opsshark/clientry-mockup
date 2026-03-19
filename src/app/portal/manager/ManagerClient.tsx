"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { Filter, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface OrgTicket {
  issueKey: string;
  summary: string;
  status: string;
  displayStatus: string;
  reporter: string;
  createdFriendly: string;
  updatedFriendly: string;
}

const PAGE_SIZE = 10;

export default function ManagerClient({
  tickets,
  orgName,
}: {
  tickets: OrgTicket[];
  orgName: string;
}) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("All");
  const [submitterFilter, setSubmitterFilter] = useState("All");
  const [page, setPage] = useState(1);

  // Unique statuses and submitters for filter dropdowns
  const statuses = Array.from(new Set(tickets.map((t) => t.displayStatus)));
  const submitters = Array.from(new Set(tickets.map((t) => t.reporter)));

  const filtered = tickets.filter((t) => {
    const statusMatch =
      statusFilter === "All" || t.displayStatus === statusFilter;
    const submitterMatch =
      submitterFilter === "All" || t.reporter === submitterFilter;
    return statusMatch && submitterMatch;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const selectStyle = {
    backgroundColor: "#141418",
    border: "1px solid #1e1e2a",
    color: "#94a3b8",
    borderRadius: "8px",
    padding: "6px 10px",
    fontSize: "13px",
    outline: "none",
    cursor: "pointer",
  };

  return (
    <>
      {/* Manager banner */}
      <div
        className="rounded-xl p-4 mb-6 flex items-center gap-3"
        style={{
          backgroundColor: "rgba(168,85,247,0.1)",
          border: "1px solid rgba(168,85,247,0.2)",
        }}
      >
        <Users size={18} style={{ color: "#c084fc" }} />
        <div>
          <span
            className="text-sm font-semibold"
            style={{ color: "#c084fc" }}
          >
            Manager View
          </span>
          <span className="text-sm ml-2" style={{ color: "#94a3b8" }}>
            {orgName} — viewing all team tickets
          </span>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => router.push("/portal/manager/dashboard")}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{
              backgroundColor: "rgba(168,85,247,0.2)",
              color: "#c084fc",
            }}
          >
            View Dashboard →
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">All Org Tickets</h1>
          <p className="text-sm" style={{ color: "#64748b" }}>
            {filtered.length} tickets across all team members
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "#475569" }} />
          <span
            className="text-xs font-medium"
            style={{ color: "#475569" }}
          >
            FILTER:
          </span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="All">All Statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={submitterFilter}
          onChange={(e) => {
            setSubmitterFilter(e.target.value);
            setPage(1);
          }}
          style={selectStyle}
        >
          <option value="All">All Submitters</option>
          {submitters.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {(statusFilter !== "All" || submitterFilter !== "All") && (
          <button
            onClick={() => {
              setStatusFilter("All");
              setSubmitterFilter("All");
              setPage(1);
            }}
            className="text-xs px-3 py-1.5 rounded-lg"
            style={{ color: "#64748b", border: "1px solid #1e1e2a" }}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Table */}
      <div
        className="rounded-xl border overflow-x-auto"
        style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
      >
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid #1e1e2a" }}>
              {["Ticket", "Summary", "Submitter", "Status", "Created"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium"
                    style={{ color: "#475569" }}
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {pageData.map((ticket, i) => (
              <tr
                key={ticket.issueKey}
                className="cursor-pointer transition-colors"
                style={{
                  borderBottom:
                    i < pageData.length - 1
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
                <td className="px-4 py-3.5">
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: "#06b6d4" }}
                  >
                    {ticket.issueKey}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm">{ticket.summary}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(6,182,212,0.15)",
                        color: "#06b6d4",
                      }}
                    >
                      {ticket.reporter
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span
                      className="text-xs"
                      style={{ color: "#94a3b8" }}
                    >
                      {ticket.reporter}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={ticket.displayStatus} size="sm" />
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className="text-xs"
                    style={{ color: "#475569" }}
                  >
                    {ticket.createdFriendly}
                  </span>
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "#94a3b8" }}>
              {tickets.length === 0 ? "No organization tickets yet" : "No results"}
            </p>
            <p className="text-xs" style={{ color: "#475569" }}>
              {tickets.length === 0
                ? "Tickets submitted by your team will appear here."
                : "Try adjusting your search or filter."}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs" style={{ color: "#475569" }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
              style={{
                borderColor: "#1e1e2a",
                color: page === 1 ? "#334155" : "#94a3b8",
                cursor: page === 1 ? "not-allowed" : "pointer",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all"
                  style={{
                    backgroundColor:
                      page === p ? "#06b6d4" : "transparent",
                    color: page === p ? "white" : "#64748b",
                    border:
                      page === p ? "none" : "1px solid #1e1e2a",
                  }}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={page === totalPages}
              className="w-8 h-8 rounded-lg flex items-center justify-center border transition-all"
              style={{
                borderColor: "#1e1e2a",
                color:
                  page === totalPages ? "#334155" : "#94a3b8",
                cursor:
                  page === totalPages ? "not-allowed" : "pointer",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Summary stats */}
      <div
        className="mt-4 flex gap-4 text-xs"
        style={{ color: "#475569" }}
      >
        <span>{tickets.length} total</span>
        <span>·</span>
        <span>
          {tickets.filter((t) => t.displayStatus === "Open").length} open
        </span>
        <span>·</span>
        <span>
          {
            tickets.filter((t) => t.displayStatus === "In Review")
              .length
          }{" "}
          in review
        </span>
      </div>
    </>
  );
}
