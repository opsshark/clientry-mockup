"use client";

import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Clock, Inbox } from "lucide-react";
import type { PersonalDashboardData } from "@/actions/dashboard";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "#1a1a22",
    border: "1px solid #1e1e2a",
    borderRadius: "8px",
    color: "#e2e8f0",
    fontSize: "12px",
  },
};

interface Props {
  data: PersonalDashboardData;
  userName: string;
}

export default function DashboardContent({ data, userName }: Props) {
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const stats = [
    {
      label: "Open Tickets",
      value: String(data.openCount),
      color: "#3b82f6",
    },
    {
      label: "In Review",
      value: String(data.inReviewCount),
      color: "#eab308",
    },
    {
      label: "Resolved This Week",
      value: String(data.resolvedThisWeek),
      color: "#22c55e",
    },
    {
      label: "Total Tickets",
      value: String(data.totalCount),
      color: "#06b6d4",
    },
  ];

  const isEmpty = data.totalCount === 0;

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">
          {greeting}, {userName}. 👋
        </h1>
        <p className="text-sm" style={{ color: "#64748b" }}>
          Here&apos;s a summary of your support activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-5 border"
            style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
          >
            <div className="text-3xl font-bold mb-1" style={{ color }}>
              {value}
            </div>
            <div className="text-sm font-medium">{label}</div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        /* ─── Empty state ─── */
        <div
          className="rounded-xl p-12 border text-center"
          style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(6,182,212,0.1)" }}
          >
            <Inbox size={24} style={{ color: "#06b6d4" }} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Submit your first request to get started.
          </p>
          <button
            onClick={() => router.push("/portal")}
            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={{ backgroundColor: "#06b6d4", color: "white" }}
          >
            Submit a Request
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Donut chart */}
            <div
              className="col-span-1 md:col-span-2 rounded-xl p-5 border"
              style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
            >
              <h3 className="text-sm font-semibold mb-4">Tickets by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={data.statusCounts}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {data.statusCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {data.statusCounts.map(({ name, value, color }) => (
                  <div
                    key={name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span style={{ color: "#94a3b8" }}>{name}</span>
                    </div>
                    <span style={{ color: "#64748b" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent tickets */}
            <div
              className="col-span-1 md:col-span-3 rounded-xl border"
              style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
            >
              <div
                className="px-5 py-4 border-b"
                style={{ borderColor: "#1e1e2a" }}
              >
                <h3 className="text-sm font-semibold">Recent Tickets</h3>
              </div>
              <div className="p-3">
                {data.recentTickets.map((ticket) => (
                  <div
                    key={ticket.issueKey}
                    className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-white/[0.02] cursor-pointer"
                    onClick={() =>
                      router.push(`/portal/tickets/${ticket.issueKey}`)
                    }
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: "rgba(6,182,212,0.1)" }}
                    >
                      <FileText size={14} style={{ color: "#06b6d4" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-xs font-bold"
                          style={{ color: "#06b6d4" }}
                        >
                          {ticket.issueKey}
                        </span>
                        <StatusBadge status={ticket.displayStatus} />
                      </div>
                      <p
                        className="text-sm mt-0.5 truncate"
                        style={{ color: "#94a3b8" }}
                      >
                        {ticket.summary}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#475569" }}
                      >
                        Updated {ticket.updatedFriendly}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SLA placeholder */}
          <div
            className="mt-6 p-4 rounded-xl border flex items-center gap-4"
            style={{
              backgroundColor: "rgba(100,116,139,0.06)",
              borderColor: "rgba(100,116,139,0.2)",
            }}
          >
            <Clock size={18} style={{ color: "#64748b" }} />
            <div>
              <span
                className="text-sm font-medium"
                style={{ color: "#94a3b8" }}
              >
                SLA data coming soon
              </span>
              <span className="text-sm ml-2" style={{ color: "#475569" }}>
                Response time tracking will be available in a future update.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
