"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle2, Clock, Inbox } from "lucide-react";
import type { ManagerDashboardData } from "@/actions/dashboard";

const tooltipStyle = {
  contentStyle: {
    backgroundColor: '#1a1a22',
    border: '1px solid #1e1e2a',
    borderRadius: '8px',
    color: '#e2e8f0',
    fontSize: '12px',
  },
};

interface Props {
  data: ManagerDashboardData;
  orgName: string;
}

export default function ManagerDashboardContent({ data, orgName }: Props) {
  const isEmpty = data.totalCount === 0;

  const bigStats = [
    { label: "Total Tickets", value: String(data.totalCount), icon: TrendingUp, color: "#06b6d4", sub: "all time" },
    { label: "Open", value: String(data.openCount), icon: AlertTriangle, color: "#3b82f6", sub: "need attention" },
    { label: "Resolved", value: String(data.resolvedCount), icon: CheckCircle2, color: "#22c55e", sub: data.totalCount > 0 ? `${Math.round((data.resolvedCount / data.totalCount) * 100)}% resolution rate` : "—" },
    { label: "Overdue", value: String(data.overdueCount), icon: Clock, color: "#f87171", sub: ">24h no response" },
  ];

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1">{orgName} — Overview</h1>
        <p className="text-sm" style={{ color: '#64748b' }}>
          Organization ticket analytics
        </p>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {bigStats.map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="rounded-xl p-5 border"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#475569' }}>{label.toUpperCase()}</span>
              <Icon size={16} style={{ color }} />
            </div>
            <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
            <div className="text-xs" style={{ color: '#475569' }}>{sub}</div>
          </div>
        ))}
      </div>

      {isEmpty ? (
        /* ─── Empty state ─── */
        <div className="rounded-xl p-12 border text-center"
          style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'rgba(6,182,212,0.1)' }}>
            <Inbox size={24} style={{ color: '#06b6d4' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
          <p className="text-sm" style={{ color: '#64748b' }}>
            No tickets have been submitted for this organization.
          </p>
        </div>
      ) : (
        <>
          {/* SLA placeholder */}
          <div className="rounded-xl p-5 border mb-6"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">SLA Health</h3>
              <span className="text-xs px-2 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(100,116,139,0.15)', color: '#94a3b8' }}>
                Coming soon
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: '#475569' }}>
              SLA compliance tracking will be available in a future update.
            </p>
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-5 gap-6 mb-6">
            {/* Bar chart - by status */}
            <div className="col-span-3 rounded-xl p-5 border"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <h3 className="text-sm font-semibold mb-4">Tickets by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.statusCounts} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.statusCounts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart - by type */}
            <div className="col-span-2 rounded-xl p-5 border"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <h3 className="text-sm font-semibold mb-4">Tickets by Type</h3>
              {data.typeCounts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={data.typeCounts}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {data.typeCounts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-1">
                    {data.typeCounts.map(({ name, value, color }) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                          <span style={{ color: '#94a3b8' }}>{name}</span>
                        </div>
                        <span style={{ color: '#64748b' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-center py-8" style={{ color: '#475569' }}>
                  No type data available
                </p>
              )}
            </div>
          </div>

          {/* Line chart - volume */}
          <div className="rounded-xl p-5 border mb-6"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <h3 className="text-sm font-semibold mb-4">Submission Volume — Last 14 Days</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={data.volumeByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2a" vertical={false} />
                <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top submitters */}
          {data.topSubmitters.length > 0 && (
            <div className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#1e1e2a' }}>
                <h3 className="text-sm font-semibold">Top Submitters</h3>
              </div>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e1e2a' }}>
                    {['User', 'Total', 'Open', 'Resolved', 'Activity'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium"
                        style={{ color: '#475569' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topSubmitters.map((user, i) => (
                    <tr key={user.name}
                      style={{ borderBottom: i < data.topSubmitters.length - 1 ? '1px solid #1a1a22' : 'none' }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold" style={{ color: '#06b6d4' }}>{user.tickets}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: '#60a5fa' }}>{user.open}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm" style={{ color: '#4ade80' }}>{user.closed}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1">
                          {Array.from({ length: 10 }, (_, idx) => {
                            const maxTickets = data.topSubmitters[0]?.tickets ?? 1;
                            const filled = Math.round((user.tickets / maxTickets) * 10);
                            return (
                              <div key={idx}
                                className="w-2 h-5 rounded-sm"
                                style={{
                                  backgroundColor: idx < filled ? '#06b6d4' : '#1e1e2a',
                                  opacity: idx < filled ? 0.4 + (idx * 0.06) : 1,
                                }}
                              />
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
