import { Avatar } from './Avatar';

interface Props {
  uid: string;
  username: string;
  highlight?: boolean;
}

export function MemberChip({ username, highlight }: Props) {
  return (
    <div
      className={`flex items-center gap-1 px-2 py-1 text-xs ${
        highlight
          ? 'border border-primary'
          : 'border border-border'
      }`}
      style={{
        borderRadius: 20,
        background: highlight
          ? 'color-mix(in oklab, var(--g-primary) 10%, var(--g-bg))'
          : 'color-mix(in oklab, var(--g-muted) 15%, var(--g-bg))',
        color: highlight ? 'var(--g-primary)' : 'var(--g-text)',
      }}
    >
      <Avatar name={username} size={20} />
      <span style={{ fontFamily: 'Cinzel, serif', fontWeight: highlight ? 600 : 400 }}>
        {highlight ? 'you' : username}
      </span>
    </div>
  );
}
