"use client";

import StatusBadge from "@/components/StatusBadge";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Bug, MessageCircle, RefreshCw, Clock } from "lucide-react";

const donutData = [
  { name: "Open", value: 3, color: "#3b82f6" },
  { name: "In Review", value: 2, color: "#eab308" },
  { name: "Answered", value: 1, color: "#22c55e" },
  { name: "Pending", value: 1, color: "#a855f7" },
  { name: "Closed", value: 8, color: "#334155" },
];

const recentActivity = [
  { ticket: "UAT-2847", action: "Status changed to In Review", time: "2h ago", icon: Bug, color: "#f87171" },
  { ticket: "UAT-2847", action: "Sarah Chen added a comment", time: "1h ago", icon: MessageCircle, color: "#06b6d4" },
  { ticket: "UAT-2831", action: "New ticket submitted", time: "1d ago", icon: Bug, color: "#f87171" },
  { ticket: "UAT-2819", action: "Marked as Answered", time: "2d ago", icon: MessageCircle, color: "#06b6d4" },
  { ticket: "UAT-2788", action: "Pending manager approval", time: "5d ago", icon: RefreshCw, color: "#c084fc" },
];

const stats = [
  { label: "Open Tickets", value: "3", sub: "+1 this week", color: "#3b82f6" },
  { label: "In Review", value: "2", sub: "avg 18h in review", color: "#eab308" },
  { label: "Resolved This Week", value: "4", sub: "↑ from 2 last week", color: "#22c55e" },
  { label: "Avg Response Time", value: "2.4h", sub: "within SLA", color: "#06b6d4" },
];

export default function PersonalDashboard() {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
        <div className="max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">{greeting}, Alex. 👋</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Here&apos;s a summary of your activity on the Acme Corp portal.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {stats.map(({ label, value, sub, color }) => (
              <div key={label} className="rounded-xl p-5 border"
                style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
                <div className="text-3xl font-bold mb-1" style={{ color }}>{value}</div>
                <div className="text-sm font-medium mb-1">{label}</div>
                <div className="text-xs" style={{ color: '#475569' }}>{sub}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-5 gap-6">
            {/* Donut chart */}
            <div className="col-span-2 rounded-xl p-5 border"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <h3 className="text-sm font-semibold mb-4">Tickets by Status</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a22',
                      border: '1px solid #1e1e2a',
                      borderRadius: '8px',
                      color: '#e2e8f0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {donutData.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span style={{ color: '#94a3b8' }}>{name}</span>
                    </div>
                    <span style={{ color: '#64748b' }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity feed */}
            <div className="col-span-3 rounded-xl border"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: '#1e1e2a' }}>
                <h3 className="text-sm font-semibold">Recent Activity</h3>
              </div>
              <div className="p-3">
                {recentActivity.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg transition-colors"
                      style={{ cursor: 'default' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${item.color}22` }}>
                        <Icon size={14} style={{ color: item.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold" style={{ color: '#06b6d4' }}>
                            {item.ticket}
                          </span>
                          <span className="text-xs" style={{ color: '#475569' }}>{item.time}</span>
                        </div>
                        <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{item.action}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SLA notice */}
          <div className="mt-6 p-4 rounded-xl border flex items-center gap-4"
            style={{ backgroundColor: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}>
            <Clock size={18} style={{ color: '#06b6d4' }} />
            <div>
              <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>
                100% SLA compliance
              </span>
              <span className="text-sm ml-2" style={{ color: '#64748b' }}>
                All your tickets have received a response within the agreed 24-hour window.
              </span>
            </div>
          </div>
        </div>
  );
}
