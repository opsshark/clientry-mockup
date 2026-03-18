"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";
import DynamicFormRenderer from "@/components/DynamicFormRenderer";
import type { FormSchema } from "@/components/DynamicFormRenderer";
import { submitRequest } from "@/actions/forms";

interface SubmitFormClientProps {
  requestTypeId: string;
  name: string;
  description: string;
  schema: FormSchema;
  proformaFormId?: string;
}

export default function SubmitFormClient({
  requestTypeId,
  name,
  description,
  schema,
  proformaFormId,
}: SubmitFormClientProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setError(null);

    try {
      const result = await submitRequest(requestTypeId, values, proformaFormId);
      router.push(
        `/portal/submit/confirmation?key=${encodeURIComponent(result.issueKey)}`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to submit request"
      );
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Breadcrumb */}
      <button
        onClick={() => router.push("/portal")}
        className="flex items-center gap-1 text-sm mb-6 transition-colors"
        style={{ color: "#64748b" }}
      >
        <ChevronLeft size={16} />
        Back to request types
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold">{name}</h1>
        {description && (
          <p className="text-sm mt-1" style={{ color: "#64748b" }}>
            {description}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 p-4 rounded-lg border text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.08)",
            borderColor: "rgba(239,68,68,0.3)",
            color: "#f87171",
          }}
        >
          {error}
        </div>
      )}

      {/* Submitting overlay */}
      {submitting && (
        <div
          className="mb-6 p-4 rounded-lg border text-sm flex items-center gap-3"
          style={{
            backgroundColor: "rgba(6,182,212,0.08)",
            borderColor: "rgba(6,182,212,0.3)",
            color: "#06b6d4",
          }}
        >
          <Loader2 size={16} className="animate-spin" />
          Creating ticket in Jira...
        </div>
      )}

      {/* Form */}
      <div style={{ opacity: submitting ? 0.5 : 1, pointerEvents: submitting ? "none" : "auto" }}>
        <DynamicFormRenderer schema={schema} onSubmit={handleSubmit} />
      </div>
    </>
  );
}
