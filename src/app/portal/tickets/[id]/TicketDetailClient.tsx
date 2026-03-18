"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { ChevronLeft, Send, Calendar, User, Loader2 } from "lucide-react";
import { addComment } from "@/actions/tickets";

interface TicketProps {
  issueKey: string;
  summary: string;
  description: string;
  status: string;
  displayStatus: string;
  reporter: string;
  reporterEmail: string;
  createdDate: string;
  createdFriendly: string;
  fields: Array<{ label: string; value: string }>;
  comments: Array<{
    id: string;
    body: string;
    author: string;
    createdFriendly: string;
    isPublic: boolean;
  }>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TicketDetailClient({
  ticket,
}: {
  ticket: TicketProps;
}) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [localComments, setLocalComments] = useState(ticket.comments);
  const [sending, setSending] = useState(false);

  async function handleSend() {
    if (!comment.trim() || sending) return;
    setSending(true);

    try {
      const result = await addComment(ticket.issueKey, comment);
      setLocalComments((prev) => [
        ...prev,
        {
          id: result.id,
          body: comment,
          author: result.author,
          createdFriendly: result.createdFriendly,
          isPublic: true,
        },
      ]);
      setComment("");
    } catch {
      // Could show error toast here
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/portal/tickets")}
        className="flex items-center gap-1 text-sm mb-6"
        style={{ color: "#64748b" }}
      >
        <ChevronLeft size={16} />
        My Tickets
      </button>

      <div className="max-w-5xl flex gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div
            className="rounded-xl p-6 border mb-4"
            style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span
                className="font-mono text-sm font-bold"
                style={{ color: "#06b6d4" }}
              >
                {ticket.issueKey}
              </span>
            </div>
            <h1 className="text-xl font-bold mb-4">{ticket.summary}</h1>
            <div className="flex items-center gap-3">
              <StatusBadge status={ticket.displayStatus} />
              <span className="text-xs" style={{ color: "#475569" }}>
                {ticket.createdFriendly}
              </span>
            </div>
          </div>

          {/* Description */}
          {ticket.description && (
            <div
              className="rounded-xl p-6 border mb-4"
              style={{
                backgroundColor: "#141418",
                borderColor: "#1e1e2a",
              }}
            >
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: "#94a3b8" }}
              >
                DESCRIPTION
              </h3>
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "#cbd5e1" }}
              >
                {ticket.description}
              </p>
            </div>
          )}

          {/* Activity / Comments */}
          <div
            className="rounded-xl border overflow-hidden"
            style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
          >
            <div
              className="px-6 py-4 border-b"
              style={{ borderColor: "#1e1e2a" }}
            >
              <h3 className="text-sm font-semibold">
                Comments ({localComments.length})
              </h3>
            </div>

            <div className="p-6 space-y-5">
              {localComments.length === 0 && (
                <p className="text-sm text-center" style={{ color: "#475569" }}>
                  No comments yet
                </p>
              )}
              {localComments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5"
                    style={{
                      backgroundColor: "rgba(168,85,247,0.2)",
                      color: "#c084fc",
                    }}
                  >
                    {getInitials(c.author)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {c.author}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "#475569" }}
                      >
                        {c.createdFriendly}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      style={{ color: "#94a3b8" }}
                    >
                      {c.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment input */}
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-2"
                  style={{
                    backgroundColor: "rgba(6,182,212,0.2)",
                    color: "#06b6d4",
                  }}
                >
                  You
                </div>
                <div
                  className="flex-1 rounded-lg border overflow-hidden"
                  style={{ borderColor: "#1e1e2a" }}
                >
                  <textarea
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                        handleSend();
                    }}
                    rows={3}
                    className="w-full p-3 text-sm resize-none outline-none"
                    style={{
                      backgroundColor: "#0f0f13",
                      color: "#e2e8f0",
                    }}
                  />
                  <div
                    className="flex justify-between items-center px-3 py-2"
                    style={{
                      backgroundColor: "#141418",
                      borderTop: "1px solid #1e1e2a",
                    }}
                  >
                    <span className="text-xs" style={{ color: "#334155" }}>
                      Cmd+Enter to send
                    </span>
                    <button
                      onClick={handleSend}
                      disabled={sending || !comment.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        backgroundColor:
                          sending || !comment.trim()
                            ? "#1e1e2a"
                            : "#06b6d4",
                        color:
                          sending || !comment.trim()
                            ? "#475569"
                            : "white",
                      }}
                    >
                      {sending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
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
          <div
            className="rounded-xl border p-5 sticky top-8"
            style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
          >
            <h3
              className="text-xs font-semibold mb-4"
              style={{ color: "#475569" }}
            >
              DETAILS
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <User size={12} style={{ color: "#475569" }} />
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Reporter
                  </span>
                </div>
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  {ticket.reporter}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar size={12} style={{ color: "#475569" }} />
                  <span className="text-xs" style={{ color: "#475569" }}>
                    Created
                  </span>
                </div>
                <span className="text-sm" style={{ color: "#94a3b8" }}>
                  {ticket.createdFriendly}
                </span>
              </div>

              {/* Additional fields from Jira */}
              {ticket.fields.map((f) => (
                <div key={f.label}>
                  <div className="text-xs mb-1" style={{ color: "#475569" }}>
                    {f.label}
                  </div>
                  <span className="text-sm" style={{ color: "#94a3b8" }}>
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
