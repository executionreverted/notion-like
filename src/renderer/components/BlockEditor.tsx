// src/renderer/components/BlockEditor.tsx
import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import { Grip, Plus, Type, List, Code2, Image } from 'lucide-react';

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'list' | 'code' | 'image';
  content: string;
  isEditing?: boolean;
}

const initialBlocks: Block[] = [
  { id: '1', type: 'heading', content: '# Welcome to Your Block Editor' },
  { id: '2', type: 'text', content: 'This is a **Notion-style** block editor with drag-and-drop support.' },
  { id: '3', type: 'list', content: '- Drag blocks to reorder\n- Edit content inline\n- Supports markdown' },
  { id: '4', type: 'code', content: 'console.log("Hello World!");' },
];

const BlockTypeSelector = ({ onSelect }: { onSelect: (type: Block['type']) => void }) => {
  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Text' },
    { type: 'heading' as const, icon: Type, label: 'Heading' },
    { type: 'list' as const, icon: List, label: 'List' },
    { type: 'code' as const, icon: Code2, label: 'Code' },
    { type: 'image' as const, icon: Image, label: 'Image' },
  ];

  return (
    <div className="absolute top-12 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-10">
      {blockTypes.map(({ type, icon: Icon, label }) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-gray-100 rounded-md transition-colors"
        >
          <Icon size={16} />
          <span className="text-sm">{label}</span>
        </button>
      ))}
    </div>
  );
};

const SortableBlock = ({ block, onUpdate, onDelete }: {
  block: Block;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPlaceholder = (type: Block['type']) => {
    switch (type) {
      case 'heading': return '# Heading';
      case 'list': return '- List item';
      case 'code': return 'Code block';
      case 'image': return 'Image URL or description';
      default: return 'Type something...';
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setIsEditing(false);
            if (e.key === 'Enter' && e.metaKey) setIsEditing(false);
          }}
          placeholder={getPlaceholder(block.type)}
          className="w-full resize-none border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
          style={{ minHeight: '1.5rem' }}
          autoFocus
        />
      );
    }

    if (block.type === 'code') {
      return (
        <pre className="bg-gray-50 rounded-md p-3 overflow-x-auto">
          <code className="text-sm font-mono">{block.content}</code>
        </pre>
      );
    }

    if (block.type === 'image') {
      return (
        <div className="bg-gray-50 rounded-md p-4 text-center text-gray-500">
          {block.content || 'Image placeholder'}
        </div>
      );
    }

    return (
      <ReactMarkdown>
        {block.content || getPlaceholder(block.type)}
      </ReactMarkdown>
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all duration-200 mb-2"
    >
      <div className="flex items-start gap-3 p-4">
        <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            {...attributes}
            {...listeners}
            className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
          >
            <Grip size={14} className="text-gray-400" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <Plus size={14} className="text-gray-400" />
            </button>
            {showTypeSelector && (
              <BlockTypeSelector
                onSelect={(type) => {
                  // This would add a new block of the selected type
                  setShowTypeSelector(false);
                }}
              />
            )}
          </div>
        </div>
        <div
          className="flex-1 cursor-text"
          onClick={() => setIsEditing(true)}
        >
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export const BlockEditor = () => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
  };

  const addBlock = (type: Block['type'] = 'text') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: '',
      isEditing: true,
    };
    setBlocks([...blocks, newBlock]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Block Editor
          </h1>
          <p className="text-gray-600">
            Create and organize your content with drag-and-drop blocks
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                />
              ))}
            </SortableContext>
          </DndContext>

          <button
            onClick={() => addBlock()}
            className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors mt-4 p-2 rounded-lg hover:bg-gray-50"
          >
            <Plus size={16} />
            <span className="text-sm">Add a block</span>
          </button>
        </div>
      </div>
    </div>
  );
};
