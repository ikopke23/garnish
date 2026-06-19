import { Avatar as ShadAvatar, AvatarFallback } from '@/components/ui/avatar';

interface Props {
  name: string;
  size?: number;
  ring?: boolean;
}

export function Avatar({ name, size = 36, ring = false }: Props) {
  return (
    <ShadAvatar
      style={{ width: size, height: size }}
      className={ring ? 'ring-2 ring-primary' : ''}
    >
      <AvatarFallback
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: size * 0.4,
          fontWeight: 500,
          background: 'color-mix(in oklab, var(--g-primary) 15%, var(--g-bg))',
          color: 'var(--g-text)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </ShadAvatar>
  );
}
