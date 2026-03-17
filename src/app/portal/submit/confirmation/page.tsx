"use client";

import { useRouter } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import { CheckCircle2, ExternalLink, Send, Bell } from "lucide-react";

export default function ConfirmationPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar />
      
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle2 size={44} style={{ color: '#4ade80' }} />
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-2">Bug report submitted!</h1>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            Your request has been received by the Acme Corp implementation team.
          </p>

          {/* Ticket info card */}
          <div className="rounded-xl p-5 border mb-6 text-left"
            style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium" style={{ color: '#64748b' }}>TICKET NUMBER</span>
              <span className="font-mono font-bold text-lg" style={{ color: '#06b6d4' }}>UAT-2847</span>
            </div>
            <div className="h-px mb-3" style={{ backgroundColor: '#1e1e2a' }} />
            <div className="flex items-start gap-2">
              <Bell size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#475569' }} />
              <p className="text-sm" style={{ color: '#94a3b8' }}>
                We&apos;ll notify you at{' '}
                <span style={{ color: '#06b6d4' }}>user@theirclient.com</span>{' '}
                when there&apos;s an update.
              </p>
            </div>
          </div>

          {/* SLA note */}
          <div className="rounded-lg p-3 mb-6 flex items-center gap-2"
            style={{ backgroundColor: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Expected response time: <span style={{ color: '#06b6d4' }}>within 24 hours</span>
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/portal/tickets/UAT-2847')}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all"
              style={{ backgroundColor: '#06b6d4', color: 'white' }}>
              <ExternalLink size={16} />
              View your ticket
            </button>
            <button
              onClick={() => router.push('/portal')}
              className="w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all border"
              style={{ borderColor: '#1e1e2a', color: '#94a3b8' }}>
              <Send size={16} />
              Submit another request
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
