interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusConfig: Record<string, { bg: string; color: string; dot: string }> = {
  'Open': { bg: 'rgba(59,130,246,0.15)', color: '#60a5fa', dot: '#3b82f6' },
  'In Review': { bg: 'rgba(234,179,8,0.15)', color: '#facc15', dot: '#eab308' },
  'Answered': { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', dot: '#22c55e' },
  'Pending Approval': { bg: 'rgba(168,85,247,0.15)', color: '#c084fc', dot: '#a855f7' },
  'Closed': { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', dot: '#64748b' },
  'Resolved': { bg: 'rgba(34,197,94,0.15)', color: '#4ade80', dot: '#22c55e' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', dot: '#64748b' };
  const px = size === 'sm' ? '8px' : '10px';
  const py = size === 'sm' ? '2px' : '4px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        paddingLeft: px,
        paddingRight: px,
        paddingTop: py,
        paddingBottom: py,
        fontSize,
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: config.dot }} />
      {status}
    </span>
  );
}
