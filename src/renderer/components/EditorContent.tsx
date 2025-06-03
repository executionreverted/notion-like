// src/renderer/components/EditorContent.tsx
import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBlock } from './SortableBlock';
import { useBlockEditor } from '../contexts/BlockEditorContext';

export const EditorContent = () => {
  const { blocks, handleDragEnd } = useBlockEditor();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={blocks.map(block => block.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {blocks.map((block, index) => (
            <SortableBlock
              key={block.id}
              block={block}
              isFirst={index === 0}
              isLast={index === blocks.length - 1}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};
