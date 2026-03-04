import { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { RecipeSection } from '../api/recipes';

interface Props {
  isOpen: boolean;
  sections: RecipeSection[];
  onSave: (reordered: RecipeSection[]) => void;
  onCancel: () => void;
}

function SortableRow({ id, title }: { id: string; title: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
         className="d-flex align-items-center gap-3 py-2 px-3 mb-2 rounded reorder-row">
      <span {...attributes} {...listeners}
            style={{ cursor: 'grab', touchAction: 'none', fontSize: '1.1rem', color: 'var(--color-teal)' }}>
        ⠿
      </span>
      <span style={{ fontWeight: 500 }}>
        {title.trim() ? title.trim() : <em className="text-muted">Untitled section</em>}
      </span>
    </div>
  );
}

export default function ReorderSectionsModal({ isOpen, sections, onSave, onCancel }: Props) {
  const [draft, setDraft] = useState<RecipeSection[]>([]);
  const [ids, setIds] = useState<string[]>([]);

  // Snapshot sections each time the modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft([...sections]);
      setIds(sections.map((s, i) => s.section_id ?? `row-${i}`));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]); // intentionally not including sections — we snapshot on open

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(active.id as string);
    const newIdx = ids.indexOf(over.id as string);
    setDraft(prev => arrayMove(prev, oldIdx, newIdx));
    setIds(prev => arrayMove(prev, oldIdx, newIdx));
  };

  return (
    <Modal isOpen={isOpen} toggle={onCancel} centered>
      <ModalHeader toggle={onCancel}>Reorder Sections</ModalHeader>
      <ModalBody>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            {draft.map((s, i) => (
              <SortableRow key={ids[i]} id={ids[i]} title={s.title} />
            ))}
          </SortableContext>
        </DndContext>
      </ModalBody>
      <ModalFooter>
        <Button color="link" onClick={onCancel}>Cancel</Button>
        <Button color="primary" onClick={() => onSave(draft)}>Save</Button>
      </ModalFooter>
    </Modal>
  );
}
