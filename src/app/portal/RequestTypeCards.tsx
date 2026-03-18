"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import type { RequestType } from "@/lib/jira";

// Accent colors for visual variety
const COLORS = [
  { color: "#f87171", bg: "rgba(239,68,68,0.1)" },
  { color: "#facc15", bg: "rgba(234,179,8,0.1)" },
  { color: "#06b6d4", bg: "rgba(6,182,212,0.1)" },
  { color: "#c084fc", bg: "rgba(168,85,247,0.1)" },
  { color: "#34d399", bg: "rgba(52,211,153,0.1)" },
  { color: "#fb923c", bg: "rgba(251,146,60,0.1)" },
];

function RequestTypeIcon({ iconUrl, color, bg }: { iconUrl: string; color: string; bg: string }) {
  const [failed, setFailed] = useState(false);
  const proxiedUrl = `/api/icon?url=${encodeURIComponent(iconUrl)}`;

  return (
    <div
      className="w-11 h-11 rounded-xl flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      {failed ? (
        <span style={{ fontSize: "20px" }}>📋</span>
      ) : (
        <div
          style={{
            width: 24,
            height: 24,
            backgroundColor: color,
            WebkitMaskImage: `url(${proxiedUrl})`,
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: `url(${proxiedUrl})`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxiedUrl}
            alt=""
            style={{ display: "none" }}
            onError={() => setFailed(true)}
          />
        </div>
      )}
    </div>
  );
}

export default function RequestTypeCards({
  requestTypes,
}: {
  requestTypes: RequestType[];
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requestTypes.map((rt, i) => {
        const { color, bg } = COLORS[i % COLORS.length];
        const iconUrl = rt.icon._links.iconUrls["48x48"];

        return (
          <div
            key={rt.id}
            className="rounded-xl p-6 border cursor-pointer transition-all group"
            style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
            onClick={() => router.push(`/portal/submit/${rt.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <RequestTypeIcon iconUrl={iconUrl} color={color} bg={bg} />
              <ChevronRight
                size={16}
                style={{ color: "#334155" }}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
            <h3 className="font-semibold mb-2">{rt.name}</h3>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "#64748b" }}
            >
              {rt.description}
            </p>
            <button
              className="text-sm font-medium px-4 py-2 rounded-lg transition-all"
              style={{ backgroundColor: "#1e1e2a", color }}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/portal/submit/${rt.id}`);
              }}
            >
              Submit →
            </button>
          </div>
        );
      })}
    </div>
  );
}
