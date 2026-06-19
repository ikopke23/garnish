import { Avatar } from './Avatar';

interface Member {
  uid: string;
  username: string;
}

interface Props {
  members: Member[];
  max?: number;
  size?: number;
}

export function AvatarStack({ members, max = 3, size = 24 }: Props) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div
          key={m.uid}
          style={{ marginLeft: i === 0 ? 0 : -(size / 3), zIndex: max - i }}
        >
          <Avatar name={m.username} size={size} ring />
        </div>
      ))}
      {overflow > 0 && (
        <span
          className="text-xs ml-1"
          style={{ color: 'var(--g-muted)' }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
