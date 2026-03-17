"use client";

import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import { Bug, Star, MessageCircle, RefreshCw, ChevronRight } from "lucide-react";

const requestTypes = [
  {
    id: "bug",
    icon: Bug,
    title: "UAT Bug Report",
    description: "Found something broken? Report a bug with steps to reproduce and expected vs actual behavior.",
    color: "#f87171",
    bg: "rgba(239,68,68,0.1)",
  },
  {
    id: "feedback",
    icon: Star,
    title: "Feature Feedback",
    description: "Share your thoughts on existing features — what's working well, what could be better.",
    color: "#facc15",
    bg: "rgba(234,179,8,0.1)",
  },
  {
    id: "question",
    icon: MessageCircle,
    title: "Question / Clarification",
    description: "Not sure how something works? Ask the implementation team directly.",
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
  },
  {
    id: "change",
    icon: RefreshCw,
    title: "Change Request",
    description: "Request a change to scope, requirements, or configuration. Requires manager approval.",
    color: "#c084fc",
    bg: "rgba(168,85,247,0.1)",
  },
];

export default function PortalPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-4xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Submit a Request</h1>
            <p className="text-sm" style={{ color: '#64748b' }}>
              Choose a request type below to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requestTypes.map(({ id, icon: Icon, title, description, color, bg }) => (
              <div
                key={id}
                className="rounded-xl p-6 border cursor-pointer transition-all group"
                style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}
                onClick={() => router.push(`/portal/submit/${id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: bg }}>
                    <Icon size={22} style={{ color }} />
                  </div>
                  <ChevronRight size={16} style={{ color: '#334155' }}
                    className="group-hover:translate-x-0.5 transition-transform" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>
                  {description}
                </p>
                <button
                  className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
                  style={{ backgroundColor: '#1e1e2a', color: '#06b6d4' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/portal/submit/${id}`);
                  }}>
                  Submit →
                </button>
              </div>
            ))}
          </div>

          {/* Recent notice */}
          <div className="mt-6 p-4 rounded-xl border flex items-start gap-3"
            style={{ backgroundColor: 'rgba(6,182,212,0.06)', borderColor: 'rgba(6,182,212,0.2)' }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: '#06b6d4' }} />
            <div>
              <span className="text-sm font-medium" style={{ color: '#06b6d4' }}>UAT Sprint 3 is live</span>
              <span className="text-sm ml-2" style={{ color: '#64748b' }}>
                Please submit any bugs found in the new export module. SLA: 24h response.
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
