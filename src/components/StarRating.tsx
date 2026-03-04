import { useState, memo } from 'react';

interface StarRatingProps {
  value: number | null;
  onChange: (rating: number) => void;
}

const StarRating = memo(function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const active = hovered ?? value ?? 0;

  return (
    <div className="d-flex gap-1" style={{ fontSize: '1.8rem', cursor: 'pointer', userSelect: 'none' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          style={{
            color: star <= active ? 'var(--star-filled, #FFD700)' : 'var(--star-empty, #ccc)',
            transition: 'color 0.1s',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
});

export default StarRating;
