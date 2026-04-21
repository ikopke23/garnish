import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RecipeSection, IngredientGroup } from '../api/recipes';

type ReorderModalProps =
  | {
      isOpen: boolean;
      mode: 'sections';
      items: RecipeSection[];
      onSave: (reordered: RecipeSection[]) => void;
      onCancel: () => void;
    }
  | {
      isOpen: boolean;
      mode: 'ingredients';
      items: IngredientGroup[];
      onSave: (reordered: IngredientGroup[]) => void;
      onCancel: () => void;
    };

const TRUNCATE_LEN = 58;
const truncate = (s: string) => s.length > TRUNCATE_LEN ? s.slice(0, TRUNCATE_LEN) + '…' : s;

function SortableRow({
  id,
  label,
  isSection,
  placeholder,
}: {
  id: string;
  label: string;
  isSection?: boolean;
  placeholder?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        // Replace default fast dnd-kit transition with smooth 500ms ease-out
        transition: transition
          ? 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
          : undefined,
        willChange: 'transform',
        position: 'relative',
        zIndex: isDragging ? 10 : undefined,

        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        borderRadius: '6px',
        padding: isSection ? '8px 12px' : '5px 10px',
        marginBottom: isSection ? '3px' : '2px',
        marginLeft: isSection ? '0' : '20px',

        background: isSection
          ? 'rgba(255, 130, 0, 0.11)'
          : 'rgba(255, 130, 0, 0.045)',
        borderLeft: isSection
          ? '3px solid var(--color-teal)'
          : '2px solid rgba(255, 130, 0, 0.22)',

        opacity: isDragging ? 0.45 : 1,
        boxShadow: isDragging
          ? '0 6px 18px rgba(0, 0, 0, 0.18)'
          : 'none',
      }}
    >
      {/* Grab handle */}
      <span
        {...attributes}
        {...listeners}
        style={{
          cursor: 'grab',
          touchAction: 'none',
          color: 'var(--color-teal)',
          fontSize: isSection ? '1rem' : '0.9rem',
          lineHeight: 1,
          flexShrink: 0,
          opacity: 0.65,
          userSelect: 'none',
        }}
      >
        ⠿
      </span>

      {/* Label */}
      <span
        style={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: isSection ? 600 : 400,
          fontSize: isSection ? '0.9rem' : '0.8rem',
          color: isSection ? 'var(--color-teal)' : 'inherit',
          opacity: isSection ? 1 : 0.72,
          letterSpacing: isSection ? '0.01em' : undefined,
        }}
      >
        {label.trim()
          ? label.trim()
          : <em style={{ opacity: 0.5 }}>{placeholder ?? (isSection ? 'Untitled section' : 'Unnamed item')}</em>
        }
      </span>
    </div>
  );
}

function buildSectionFlatIds(sections: RecipeSection[]): string[] {
  const ids: string[] = [];
  sections.forEach((s, gi) => {
    ids.push(`s-${gi}`);
    s.steps.forEach((_, stepIdx) => ids.push(`step-${gi}-${stepIdx}`));
  });
  return ids;
}

function buildIngredientFlatIds(groups: IngredientGroup[]): string[] {
  const ids: string[] = [];
  groups.forEach((g, gi) => {
    ids.push(`s-${gi}`);
    g.ingredients.forEach((_, ii) => ids.push(`i-${gi}-${ii}`));
  });
  return ids;
}

export default function ReorderModal(props: ReorderModalProps) {
  const { isOpen, mode, onCancel } = props;

  const [sectionDraft, setSectionDraft] = useState<RecipeSection[]>([]);
  const [sectionFlatIds, setSectionFlatIds] = useState<string[]>([]);

  const [groupDraft, setGroupDraft] = useState<IngredientGroup[]>([]);
  const [ingFlatIds, setIngFlatIds] = useState<string[]>([]);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (!isOpen) return;
    if (mode === 'sections') {
      const items = (props as Extract<ReorderModalProps, { mode: 'sections' }>).items;
      const draft = items.map(s => ({ ...s, steps: [...s.steps] }));
      setSectionDraft(draft);
      setSectionFlatIds(buildSectionFlatIds(draft));
    } else {
      const items = (props as Extract<ReorderModalProps, { mode: 'ingredients' }>).items;
      const draft = items.map(g => ({ ...g, ingredients: [...g.ingredients] }));
      setGroupDraft(draft);
      setIngFlatIds(buildIngredientFlatIds(draft));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isSectionHeader = (id: string) => id.startsWith('s-');

  const handleDragEndSections = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (isSectionHeader(activeId) && isSectionHeader(overId)) {
      const activeGi = parseInt(activeId.slice(2));
      const overGi = parseInt(overId.slice(2));
      const next = arrayMove(sectionDraft, activeGi, overGi);
      setSectionDraft(next);
      setSectionFlatIds(buildSectionFlatIds(next));
      return;
    }

    if (!isSectionHeader(activeId) && !isSectionHeader(overId)) {
      const activeParts = activeId.split('-');
      const overParts = overId.split('-');
      if (activeParts[1] !== overParts[1]) return;
      const gi = parseInt(activeParts[1]);
      const oldIdx = parseInt(activeParts[2]);
      const newIdx = parseInt(overParts[2]);
      const next = sectionDraft.map((s, i) =>
        i === gi ? { ...s, steps: arrayMove(s.steps, oldIdx, newIdx) } : s
      );
      setSectionDraft(next);
      setSectionFlatIds(buildSectionFlatIds(next));
    }
  };

  const handleDragEndIngredients = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = active.id as string;
    const overId = over.id as string;

    if (isSectionHeader(activeId) && isSectionHeader(overId)) {
      const activeGi = parseInt(activeId.slice(2));
      const overGi = parseInt(overId.slice(2));
      const next = arrayMove(groupDraft, activeGi, overGi);
      setGroupDraft(next);
      setIngFlatIds(buildIngredientFlatIds(next));
      return;
    }

    if (!isSectionHeader(activeId) && !isSectionHeader(overId)) {
      const activeParts = activeId.split('-');
      const overParts = overId.split('-');
      if (activeParts[1] !== overParts[1]) return;
      const gi = parseInt(activeParts[1]);
      const oldIdx = parseInt(activeParts[2]);
      const newIdx = parseInt(overParts[2]);
      const next = groupDraft.map((g, i) =>
        i === gi ? { ...g, ingredients: arrayMove(g.ingredients, oldIdx, newIdx) } : g
      );
      setGroupDraft(next);
      setIngFlatIds(buildIngredientFlatIds(next));
    }
  };

  const handleSave = () => {
    if (mode === 'sections') {
      (props as Extract<ReorderModalProps, { mode: 'sections' }>).onSave(sectionDraft);
    } else {
      (props as Extract<ReorderModalProps, { mode: 'ingredients' }>).onSave(groupDraft);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onCancel(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'sections' ? 'Reorder Sections' : 'Reorder Ingredients'}
          </DialogTitle>
        </DialogHeader>
        <div style={{ padding: '0.25rem 0' }}>
          {mode === 'sections' ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndSections}>
              <SortableContext items={sectionFlatIds} strategy={verticalListSortingStrategy}>
                {sectionDraft.map((s, gi) => (
                  <div key={gi} style={{ marginBottom: '10px' }}>
                    <SortableRow id={`s-${gi}`} label={s.title} isSection placeholder="Untitled section" />
                    {s.steps.map((step, stepIdx) => (
                      <SortableRow
                        key={`step-${gi}-${stepIdx}`}
                        id={`step-${gi}-${stepIdx}`}
                        label={truncate(step)}
                        placeholder="Empty step"
                      />
                    ))}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndIngredients}>
              <SortableContext items={ingFlatIds} strategy={verticalListSortingStrategy}>
                {groupDraft.map((g, gi) => (
                  <div key={gi} style={{ marginBottom: '10px' }}>
                    <SortableRow id={`s-${gi}`} label={g.label} isSection placeholder="Unnamed section" />
                    {g.ingredients.map((ing, ii) => (
                      <SortableRow key={`i-${gi}-${ii}`} id={`i-${gi}-${ii}`} label={ing.name} placeholder="Unnamed ingredient" />
                    ))}
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
