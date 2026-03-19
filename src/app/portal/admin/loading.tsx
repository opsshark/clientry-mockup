function Pulse({ style }: { style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: "#1e1e2a",
        borderRadius: "0.5rem",
        animation: "pulse 1.5s ease-in-out infinite",
        ...style,
      }}
    />
  );
}

export default function Loading() {
  return (
    <div className="max-w-4xl">
      <Pulse style={{ width: 120, height: 28, marginBottom: 8 }} />
      <Pulse style={{ width: 220, height: 14, marginBottom: 32 }} />
      <div className="flex gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Pulse key={i} style={{ width: 100, height: 36, borderRadius: 999 }} />
        ))}
      </div>
      <div
        className="rounded-xl border p-6 space-y-6"
        style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Pulse style={{ width: 100, height: 12, marginBottom: 8 }} />
            <Pulse style={{ width: "100%", height: 40 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
