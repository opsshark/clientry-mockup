"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PortalSidebar from "@/components/PortalSidebar";
import { Bug, Star, MessageCircle, RefreshCw, Upload, ChevronLeft } from "lucide-react";

const formConfig: Record<string, {
  title: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = {
  bug: { title: "UAT Bug Report", icon: Bug, color: "#f87171", bg: "rgba(239,68,68,0.1)" },
  feedback: { title: "Feature Feedback", icon: Star, color: "#facc15", bg: "rgba(234,179,8,0.1)" },
  question: { title: "Question / Clarification", icon: MessageCircle, color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  change: { title: "Change Request", icon: RefreshCw, color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
};

export default function SubmitFormPage() {
  const router = useRouter();
  const params = useParams();
  const type = (params?.type as string) || "bug";
  const config = formConfig[type] || formConfig.bug;
  const Icon = config.icon;

  const [form, setForm] = useState({
    summary: "",
    description: "",
    severity: "Medium",
    steps: "",
    expected: "",
    actual: "",
  });
  const [dragging, setDragging] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/portal/submit/confirmation");
  };

  const inputStyle = {
    backgroundColor: '#0f0f13',
    border: '1px solid #1e1e2a',
    color: '#e2e8f0',
    borderRadius: '8px',
    padding: '10px 14px',
    width: '100%',
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '500',
    color: '#94a3b8',
    marginBottom: '6px',
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0f0f13' }}>
      <PortalSidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl">
          {/* Breadcrumb */}
          <button
            onClick={() => router.push('/portal')}
            className="flex items-center gap-1 text-sm mb-6 transition-colors"
            style={{ color: '#64748b' }}>
            <ChevronLeft size={16} />
            Back to request types
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: config.bg }}>
              <Icon size={24} style={{ color: config.color }} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{config.title}</h1>
              <p className="text-sm" style={{ color: '#64748b' }}>Acme Corp Implementation Portal</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="rounded-xl p-6 border space-y-5"
              style={{ backgroundColor: '#141418', borderColor: '#1e1e2a' }}>
              
              {/* Summary */}
              <div>
                <label style={labelStyle}>Summary <span style={{ color: '#f87171' }}>*</span></label>
                <input
                  type="text"
                  placeholder="Brief description of the issue"
                  value={form.summary}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                  style={inputStyle}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description <span style={{ color: '#f87171' }}>*</span></label>
                <textarea
                  placeholder="Provide a detailed description..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                />
              </div>

              {/* Severity */}
              {(type === 'bug' || type === 'change') && (
                <div>
                  <label style={labelStyle}>Severity <span style={{ color: '#f87171' }}>*</span></label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="Critical">🔴 Critical — System is down or blocking all users</option>
                    <option value="High">🟠 High — Major feature broken, workaround exists</option>
                    <option value="Medium">🟡 Medium — Feature degraded, limited impact</option>
                    <option value="Low">⚪ Low — Minor issue, cosmetic or edge case</option>
                  </select>
                </div>
              )}

              {/* Steps to Reproduce (for bugs) */}
              {type === 'bug' && (
                <div>
                  <label style={labelStyle}>Steps to Reproduce</label>
                  <textarea
                    placeholder={"1. Go to...\n2. Click on...\n3. Observe..."}
                    value={form.steps}
                    onChange={(e) => setForm({ ...form, steps: e.target.value })}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }}
                  />
                </div>
              )}

              {/* Expected vs Actual */}
              {type === 'bug' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>Expected Behavior</label>
                    <textarea
                      placeholder="What should have happened..."
                      value={form.expected}
                      onChange={(e) => setForm({ ...form, expected: e.target.value })}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Actual Behavior</label>
                    <textarea
                      placeholder="What actually happened..."
                      value={form.actual}
                      onChange={(e) => setForm({ ...form, actual: e.target.value })}
                      rows={3}
                      style={{ ...inputStyle, resize: 'vertical' }}
                    />
                  </div>
                </div>
              )}

              {/* Attachment */}
              <div>
                <label style={labelStyle}>Attachments</label>
                <div
                  className="rounded-lg border-2 border-dashed p-8 text-center transition-colors"
                  style={{
                    borderColor: dragging ? '#06b6d4' : '#1e1e2a',
                    backgroundColor: dragging ? 'rgba(6,182,212,0.05)' : 'transparent',
                    cursor: 'pointer',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={() => setDragging(false)}>
                  <Upload size={24} className="mx-auto mb-2" style={{ color: '#475569' }} />
                  <p className="text-sm" style={{ color: '#64748b' }}>
                    Drop files here or{' '}
                    <span style={{ color: '#06b6d4', cursor: 'pointer' }}>browse</span>
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#334155' }}>
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => router.push('/portal')}
                className="px-5 py-2.5 rounded-lg text-sm font-medium transition-all border"
                style={{ borderColor: '#1e1e2a', color: '#64748b' }}>
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: '#06b6d4', color: 'white' }}>
                Submit Request →
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
