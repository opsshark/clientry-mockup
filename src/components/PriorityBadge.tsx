interface PriorityBadgeProps {
  priority: string;
}

const priorityConfig: Record<string, { bg: string; color: string }> = {
  'Critical': { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  'High': { bg: 'rgba(249,115,22,0.15)', color: '#fb923c' },
  'Medium': { bg: 'rgba(234,179,8,0.15)', color: '#facc15' },
  'Low': { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
};

export default function PriorityBadge({ priority }: PriorityBadgeProps) {
  const config = priorityConfig[priority] || { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' };

  return (
    <span className="inline-flex items-center rounded-full font-medium text-xs"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '3px 10px',
      }}>
      {priority}
    </span>
  );
}
