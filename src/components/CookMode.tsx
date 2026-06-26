import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWakeLock } from '../hooks/useWakeLock';
import type { Recipe } from '../api/recipes';
import { formatQty } from '../utils/format';

interface CookModeProps {
  recipe: Recipe;
  open: boolean;
  onClose: () => void;
  checkedSteps: Set<string>;
  onStepToggle: (key: string) => void;
  multiplier?: number;
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

export default function CookMode({ recipe, open, onClose, onStepToggle, multiplier = 1 }: Omit<CookModeProps, 'checkedSteps'> & { checkedSteps: Set<string> }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [stepsPerView, setStepsPerView] = useState<number>(() => {
    try {
      const stored = localStorage.getItem('cookModeStepsPerView');
      const n = stored ? parseInt(stored, 10) : 1;
      return n >= 1 && n <= 4 ? n : 1;
    } catch {
      return 1;
    }
  });
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

  useEffect(() => {
    try {
      localStorage.setItem('cookModeStepsPerView', String(stepsPerView));
    } catch {
      // private browsing — ignore
    }
  }, [stepsPerView]);

  if (!open || !current) return null;

  const stepLower = current.text.toLowerCase();
  const matched = (recipe.ingredients ?? []).filter(ing => stepLower.includes(ing.name.toLowerCase()));

  const isLast = currentIdx === total - 1;
  const windowSteps = steps.slice(currentIdx, currentIdx + stepsPerView);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 13, color: 'var(--muted-hex)', letterSpacing: '0.05em' }}>
            Step {currentIdx + 1} / {total}
          </span>
          <select
            value={stepsPerView}
            onChange={e => setStepsPerView(Number(e.target.value))}
            aria-label="Steps per view"
            style={{
              fontSize: 13,
              fontFamily: '"Cinzel", Georgia, serif',
              color: 'var(--muted-hex)',
              background: 'var(--bg)',
              border: '1px solid var(--border-hex)',
              borderRadius: 4,
              padding: '2px 4px',
              width: 72,
              cursor: 'pointer',
            }}
          >
            <option value={1}>1 step</option>
            <option value={2}>2 steps</option>
            <option value={3}>3 steps</option>
            <option value={4}>4 steps</option>
          </select>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close cook mode"
            style={{ color: 'var(--text)' }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem 2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: stepsPerView > 1 ? '2.5rem' : '1.5rem',
      }}>
        {windowSteps.map((step, wi) => {
          const isActive = wi === 0;
          return (
            <div key={step.key} style={{ opacity: isActive ? 1 : 0.45 }}>
              {step.sectionTitle && (
                <p style={{
                  fontFamily: '"Cinzel", Georgia, serif',
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  color: 'var(--primary-hex)',
                  margin: '0 0 0.5rem',
                }}>
                  {step.sectionTitle}
                </p>
              )}
              {isActive && (
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
              )}
              <p style={{
                fontFamily: '"Lora", Georgia, serif',
                fontSize: isActive ? 'clamp(26px, 5vw, 36px)' : 'clamp(16px, 3vw, 20px)',
                lineHeight: isActive ? 1.65 : 1.6,
                color: 'var(--text)',
                margin: 0,
              }}>
                {step.text}
              </p>
            </div>
          );
        })}

        {matched.length > 0 && (
          <div>
            <p style={{ fontFamily: '"Cinzel", Georgia, serif', fontSize: 10, textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--muted-hex)', marginBottom: 8 }}>
              You'll need:
            </p>
            <div className="flex flex-wrap gap-1">
              {matched.map((ing, i) => (
                <span key={i} className="ingredient-chip ingredient-chip-0">
                  {ing.quantity && ing.unit
                    ? `${formatQty(ing.quantity * multiplier)} ${ing.unit} ${ing.name}`
                    : ing.quantity
                    ? `${formatQty(ing.quantity * multiplier)} ${ing.name}`
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
