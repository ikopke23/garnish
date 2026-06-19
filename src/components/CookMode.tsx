import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWakeLock } from '../hooks/useWakeLock';
import type { Recipe } from '../api/recipes';

interface CookModeProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
  checkedSteps: Set<string>;
  onStepToggle: (key: string) => void;
}

interface FlatStep {
  key: string;
  sectionTitle: string;
  text: string;
}

function buildFlatSteps(recipe: Recipe): FlatStep[] {
  return (recipe.sections ?? []).flatMap((section, sIdx) =>
    section.steps.map((text, stepIdx) => ({
      key: `${sIdx}-${stepIdx}`,
      sectionTitle: section.title,
      text,
    }))
  );
}

export default function CookMode({ recipe, open, onClose, onStepToggle }: Omit<CookModeProps, 'checkedSteps'> & { checkedSteps: Set<string> }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  useWakeLock(open);

  const steps = buildFlatSteps(recipe);
  const total = steps.length;
  const current = steps[currentIdx];

  useEffect(() => {
    if (open) setCurrentIdx(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); setCurrentIdx(i => Math.max(0, i - 1)); }
      if (e.key === 'ArrowRight') { e.preventDefault(); setCurrentIdx(i => Math.min(total - 1, i + 1)); }
      if (e.key === ' ')          { e.preventDefault(); if (current) onStepToggle(current.key); }
      if (e.key === 'Escape')     { onClose(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, current, total, onStepToggle, onClose]);

  if (!open || !current) return null;

  const stepLower = current.text.toLowerCase();
  const matched = (recipe.ingredients ?? []).filter(ing => stepLower.includes(ing.name.toLowerCase()));

  const isLast = currentIdx === total - 1;

  const handleNext = () => {
    onStepToggle(current.key);
    if (isLast) {
      onClose();
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 60,
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        height: 52,
        borderBottom: '1px solid var(--border-hex)',
        flexShrink: 0,
      }}>
        <span style={{ fontFamily: '"Lora", Georgia, serif', fontSize: 15, color: 'var(--muted-hex)' }}>
          {recipe.name}
        </span>
        <span style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13, color: 'var(--muted-hex)', letterSpacing: '0.05em' }}>
          Step {currentIdx + 1} / {total}
        </span>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close cook mode"
          style={{ color: 'var(--text)' }}
        >
          <X size={20} />
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}>
        {current.sectionTitle && (
          <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 11, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-hex)', margin: 0 }}>
            {current.sectionTitle}
          </p>
        )}
        <div style={{
          fontFamily: '"Cinzel", Georgia, serif',
          fontSize: 96,
          fontWeight: 700,
          color: 'var(--primary-hex)',
          lineHeight: 1,
          opacity: 0.15,
        }}>
          {currentIdx + 1}
        </div>
        <p style={{
          fontFamily: '"Lora", Georgia, serif',
          fontSize: 'clamp(17px, 4vw, 20px)',
          lineHeight: 1.7,
          color: 'var(--text)',
          margin: 0,
        }}>
          {current.text}
        </p>

        {matched.length > 0 && (
          <div>
            <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--muted-hex)', marginBottom: 8 }}>
              You'll need:
            </p>
            <div className="flex flex-wrap gap-1">
              {matched.map((ing, i) => (
                <span key={i} className="ingredient-chip ingredient-chip-0">
                  {ing.quantity && ing.unit
                    ? `${ing.quantity} ${ing.unit} ${ing.name}`
                    : ing.quantity
                    ? `${ing.quantity} ${ing.name}`
                    : ing.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        gap: 8,
        padding: '1rem 1.5rem',
        background: 'var(--bg)',
        borderTop: '1px solid var(--border-hex)',
        minHeight: 72,
        alignItems: 'center',
        flexShrink: 0,
      }}>
        <Button
          variant="outline"
          className="h-11"
          disabled={currentIdx === 0}
          onClick={() => setCurrentIdx(i => i - 1)}
        >
          ← Prev
        </Button>
        <Button
          variant="default"
          className="h-11 flex-1"
          onClick={handleNext}
        >
          {isLast ? 'Finish ✓' : 'Done — Next →'}
        </Button>
      </div>
    </div>
  );
}
