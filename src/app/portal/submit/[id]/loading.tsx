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
    <div className="max-w-3xl mx-auto">
      <Pulse style={{ width: 80, height: 14, marginBottom: 24 }} />
      <Pulse style={{ width: 250, height: 28, marginBottom: 8 }} />
      <Pulse style={{ width: 180, height: 14, marginBottom: 32 }} />
      <div
        className="rounded-xl border p-6 space-y-6"
        style={{ backgroundColor: "#141418", borderColor: "#1e1e2a" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i}>
            <Pulse style={{ width: 100, height: 12, marginBottom: 8 }} />
            <Pulse style={{ width: "100%", height: 40 }} />
          </div>
        ))}
        <Pulse style={{ width: 120, height: 40, marginTop: 16 }} />
      </div>
    </div>
  );
}
