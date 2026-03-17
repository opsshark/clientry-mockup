"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { ChevronLeft, Send, Bug, Calendar, User, Tag, AlertTriangle } from "lucide-react";

const activity = [
  {
    id: 1,
    type: "system",
    author: "System",
    avatar: "S",
    message: "Ticket UAT-2847 created by Alex Johnson",
    time: "March 15, 2025 at 9:14 AM",
    isSystem: true,
  },
  {
    id: 2,
    type: "comment",
    author: "Sarah Chen",
    role: "Acme Implementation Team",
    avatar: "SC",
    message: "Thanks for reporting this. We can reproduce it — looking into it now.",
    time: "1h ago",
    isInternal: true,
  },
  {
    id: 3,
    type: "comment",
    author: "You",
    avatar: "AJ",
    message: "Any update on timeline?",
    time: "30m ago",
    isInternal: false,
  },
  {
    id: 4,
    type: "comment",
    author: "Sarah Chen",
    role: "Acme Implementation Team",
    avatar: "SC",
    message: "We've identified the fix, deploying in tonight's build. Should be resolved by 8PM EST.",
    time: "15m ago",
    isInternal: true,
  },
];

export default function TicketDetailPage() {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(activity);

  const handleSend = () => {
    if (!comment.trim()) return;
    setComments([...comments, {
      id: Date.now(),
      type: "comment",
      author: "You",
      avatar: "AJ",
      message: comment,
      time: "Just now",
      isInternal: false,
    }]);
    setComment("");
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        {/* Breadcrumb */}
        <button
          onClick={() => router.push('/portal/tickets')}
          className="flex items-center gap-1 text-sm mb-6"
          style={{ color: '#64748b' }}>
          <ChevronLeft size={16} />
          My Tickets
        </button>

        <div className="max-w-5xl flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="rounded-xl p-6 border mb-4"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-sm font-bold" style={{ color: '#06b6d4' }}>UAT-2847</span>
                <span style={{ color: '#334155' }}>•</span>
                <div className="flex items-center gap-1">
                  <Bug size={13} style={{ color: '#f87171' }} />
                  <span className="text-xs" style={{ color: '#f87171' }}>Bug Report</span>
                </div>
              </div>
              <h1 className="text-xl font-bold mb-4">Login page not redirecting after SSO</h1>
              <div className="flex items-center gap-3">
                <StatusBadge status="In Review" />
                <PriorityBadge priority="High" />
                <span className="text-xs" style={{ color: '#475569' }}>Submitted Mar 15, 2025</span>
              </div>
            </div>

            {/* Description */}
            <div className="rounded-xl p-6 border mb-4"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#94a3b8' }}>DESCRIPTION</h3>
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#cbd5e1' }}>
                After successful SSO authentication via Okta, the user is not being redirected to the 
                dashboard. Instead, they&apos;re landing on a blank white page with no content. The browser 
                console shows a CORS error on the callback URL.
              </p>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#0f0f13' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>EXPECTED</div>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    After SSO login, user should be redirected to /dashboard with their session active.
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#0f0f13', borderColor: '#2a1a1a' }}>
                  <div className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>ACTUAL</div>
                  <p className="text-sm" style={{ color: '#94a3b8' }}>
                    Blank page loads at /auth/callback. CORS error visible in console. No redirect occurs.
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg p-4" style={{ backgroundColor: '#0f0f13' }}>
                <div className="text-xs font-medium mb-2" style={{ color: '#64748b' }}>STEPS TO REPRODUCE</div>
                <ol className="space-y-1">
                  {[
                    "Go to /login and click \"Sign in with Okta\"",
                    "Authenticate with valid Okta credentials",
                    "Observe the callback URL",
                    "Page stays blank — no redirect to dashboard"
                  ].map((step, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: '#94a3b8' }}>
                      <span style={{ color: '#475569' }}>{i + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Activity */}
            <div className="rounded-xl border overflow-hidden"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <div className="px-6 py-4 border-b" style={{ borderColor: '#1e1e2a' }}>
                <h3 className="text-sm font-semibold">Activity</h3>
              </div>
              
              <div className="p-6 space-y-5">
                {comments.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.isSystem ? (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: '#1e1e2a' }}>
                        <AlertTriangle size={12} style={{ color: '#475569' }} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                        style={{
                          backgroundColor: item.author === 'You' ? 'rgba(6,182,212,0.2)' : 'rgba(168,85,247,0.2)',
                          color: item.author === 'You' ? '#06b6d4' : '#c084fc',
                        }}>
                        {item.avatar}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {item.isSystem ? (
                          <span className="text-xs" style={{ color: '#475569' }}>{item.message}</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium">{item.author}</span>
                            {'role' in item && item.role && (
                              <span className="text-xs px-1.5 py-0.5 rounded"
                                style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#c084fc' }}>
                                {item.role}
                              </span>
                            )}
                            <span className="text-xs" style={{ color: '#475569' }}>{item.time}</span>
                          </>
                        )}
                      </div>
                      {!item.isSystem && (
                        <p className="text-sm leading-relaxed" style={{ color: '#94a3b8' }}>
                          {item.message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment input */}
              <div className="px-6 pb-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-2"
                    style={{ backgroundColor: 'rgba(6,182,212,0.2)', color: '#06b6d4' }}>
                    AJ
                  </div>
                  <div className="flex-1 rounded-lg border overflow-hidden"
                    style={{ borderColor: '#1e1e2a' }}>
                    <textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend();
                      }}
                      rows={3}
                      className="w-full p-3 text-sm resize-none outline-none"
                      style={{ backgroundColor: '#0f0f13', color: '#e2e8f0' }}
                    />
                    <div className="flex justify-between items-center px-3 py-2"
                      style={{ backgroundColor: '#141418', borderTop: '1px solid #1e1e2a' }}>
                      <span className="text-xs" style={{ color: '#334155' }}>Cmd+Enter to send</span>
                      <button
                        onClick={handleSend}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                        style={{ backgroundColor: '#06b6d4', color: 'white' }}>
                        <Send size={12} />
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar metadata */}
          <div className="w-64 flex-shrink-0">
            <div className="rounded-xl border p-5 sticky top-8"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              <h3 className="text-xs font-semibold mb-4" style={{ color: '#475569' }}>DETAILS</h3>
              
              <div className="space-y-4">
                {[
                  { icon: Tag, label: "Type", value: "UAT Bug Report" },
                  { icon: AlertTriangle, label: "Priority", value: "High" },
                  { icon: User, label: "Reporter", value: "Alex Johnson" },
                  { icon: User, label: "Assignee", value: "Sarah Chen" },
                  { icon: Calendar, label: "Created", value: "Mar 15, 2025" },
                  { icon: Calendar, label: "Updated", value: "2h ago" },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon size={12} style={{ color: '#475569' }} />
                      <span className="text-xs" style={{ color: '#475569' }}>{label}</span>
                    </div>
                    <span className="text-sm" style={{ color: '#94a3b8' }}>{value}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t" style={{ borderColor: '#1e1e2a' }}>
                <div className="text-xs font-semibold mb-3" style={{ color: '#475569' }}>SPRINT</div>
                <span className="text-xs px-2 py-1 rounded"
                  style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#06b6d4' }}>
                  UAT Sprint 3
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
