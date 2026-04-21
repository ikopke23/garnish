interface ProgressMiniProps {
  done: number;
  total: number;
}

export default function ProgressMini({ done, total }: ProgressMiniProps) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const complete = total > 0 && done === total;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        fontFamily: '"Cinzel", Georgia, serif',
        fontSize: '0.71875rem',
        color: 'var(--primary-hex)',
      }}>
        {done} / {total}
      </span>
      <span style={{
        display: 'inline-block',
        width: 64,
        height: 3,
        borderRadius: 2,
        background: 'hsl(var(--border))',
        overflow: 'hidden',
      }}>
        <span style={{
          display: 'block',
          height: '100%',
          width: `${pct}%`,
          borderRadius: 2,
          background: complete ? 'var(--primary-hex)' : 'var(--secondary-hex)',
          transition: 'width 250ms ease',
        }} />
      </span>
    </span>
  );
}
