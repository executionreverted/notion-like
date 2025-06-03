// src/renderer/components/BlockEditorContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'heading2' | 'heading3' | 'list' | 'code' | 'image' | 'quote' | 'checklist';
  content: string;
  isEditing?: boolean;
  metadata?: any;
}

interface BlockEditorContextType {
  blocks: Block[];
  title: string;
  isEditingTitle: boolean;
  setIsEditingTitle: (isEditing: boolean) => void;
  setTitle: (title: string) => void;
  updateBlock: (id: string, content: string, type?: Block['type']) => void;
  deleteBlock: (id: string) => void;
  addBlock: (afterId?: string, type?: Block['type']) => void;
  handleDragEnd: (event: DragEndEvent) => void;
  setEditingState: (id: string, isEditing: boolean) => void;
}

const initialBlocks: Block[] = [
  { id: '1', type: 'heading', content: '# Welcome to Block Editor' },
  { id: '2', type: 'text', content: 'A **beautiful** and *intuitive* block-based editor with markdown support.' },
  { id: '3', type: 'quote', content: 'Design is not just what it looks like and feels like. Design is how it works.' },
  { id: '4', type: 'list', content: '- Drag blocks to reorder them\n- Click to edit inline\n- Supports rich markdown formatting\n- Clean macOS-inspired design' },
  { id: '5', type: 'code', content: 'const editor = new BlockEditor();\neditor.render();' },
];

const BlockEditorContext = createContext<BlockEditorContextType | undefined>(undefined);

export const useBlockEditor = () => {
  const context = useContext(BlockEditorContext);
  if (!context) {
    throw new Error('useBlockEditor must be used within a BlockEditorProvider');
  }
  return context;
};

export const BlockEditorProvider = ({ children }: { children: ReactNode }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [title, setTitle] = useState('Untitled Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const updateBlock = (id: string, content: string, type?: Block['type']) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content, type: type || block.type } : block
    ));
  };

  const setEditingState = (id: string, isEditing: boolean) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, isEditing } : block
    ));
  };

  const deleteBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const addBlock = (afterId?: string, type: Block['type'] = 'text') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: '',
      isEditing: true,
    };

    if (afterId) {
      const index = blocks.findIndex(block => block.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

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

  const value = {
    blocks,
    title,
    isEditingTitle,
    setIsEditingTitle,
    setTitle,
    updateBlock,
    deleteBlock,
    addBlock,
    handleDragEnd,
    setEditingState
  };

  return (
    <BlockEditorContext.Provider value={value}>
      {children}
    </BlockEditorContext.Provider>
  );
};
