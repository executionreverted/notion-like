// src/renderer/components/SortableBlock.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import {
  GripVertical,
  Plus,
  X,
} from 'lucide-react';
import { Block, useBlockEditor } from '../contexts/BlockEditorContext';
import { BlockTypeSelector } from './BlockTypeSelector';
import { BlockContent } from './BlockContent';

interface SortableBlockProps {
  block: Block;
  isFirst: boolean;
  isLast: boolean;
}

export const SortableBlock: React.FC<SortableBlockProps> = ({ block, isFirst, isLast }) => {
  const { updateBlock, deleteBlock, addBlock, setEditingState, blocks } = useBlockEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const [textareaHeight, setTextareaHeight] = useState('auto');

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
    opacity: isDragging ? 0.4 : 1,
  };

  // Adjust textarea height to content
  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
    setTextareaHeight(`${textarea.scrollHeight}px`);
  };

  useEffect(() => {
    if (block.isEditing && textareaRef.current) {
      textareaRef.current.focus();

      // Set cursor position to end
      const length = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(length, length);

      // Adjust height
      adjustTextareaHeight(textareaRef.current);
    }
  }, [block.isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Escape to blur
    if (e.key === 'Escape') {
      setEditingState(block.id, false);
    }
    // Cmd/Ctrl + Enter to blur
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      setEditingState(block.id, false);
    }
    // Enter (not shift) to add new block (except for code and list blocks)
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code' && block.type !== 'list') {
      e.preventDefault();
      setEditingState(block.id, false);
      addBlock(block.id);
    }

    // Tab key in code blocks - insert tab instead of changing focus
    if (e.key === 'Tab' && block.type === 'code') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      updateBlock(
        block.id,
        value.substring(0, start) + '  ' + value.substring(end)
      );

      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateBlock(block.id, e.target.value);
    adjustTextareaHeight(e.target);
  };

  const blockType = (type: Block['type']) => {
    switch (type) {
      case 'heading': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'heading3': return 'Heading 3';
      case 'text': return 'Text';
      case 'list': return 'List';
      case 'code': return 'Code';
      case 'quote': return 'Quote';
      case 'checklist': return 'Checklist';
      case 'image': return 'Image';
      default: return 'Text';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative min-h-[28px] transition-all duration-200 ${isDragging ? 'z-50 rotate-0.5 scale-[1.02]' : ''
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowTypeSelector(false);
      }}
    >
      <div className="flex items-start">
        {/* Block controls - visible on hover */}
        <div className={`flex-shrink-0 flex flex-col items-center pt-[5px] gap-1 w-8 transition-all duration-200 ${isHovered || isDragging ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}>
          <div className="flex flex-col gap-1">
            <button
              {...attributes}
              {...listeners}
              className="p-1.5 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors group"
              aria-label="Drag to reorder"
            >
              <GripVertical size={14} className="text-gray-400 group-hover:text-gray-600" />
            </button>

            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors group"
                aria-label="Add block"
              >
                <Plus size={14} className="text-gray-400 group-hover:text-gray-600" />
              </button>

              {showTypeSelector && (
                <BlockTypeSelector
                  onSelect={(type) => {
                    addBlock(block.id, type);
                    setShowTypeSelector(false);
                  }}
                  onClose={() => setShowTypeSelector(false)}
                />
              )}
            </div>

            {blocks.length > 1 && (
              <button
                onClick={() => deleteBlock(block.id)}
                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors group"
                aria-label="Delete block"
              >
                <X size={14} className="text-gray-400 group-hover:text-red-500" />
              </button>
            )}
          </div>
        </div>

        {/* Block content */}
        <div
          ref={blockRef}
          className="flex-1 min-w-0 min-h-[28px] relative"
        >
          {/* Block type label - shows on hover */}
          <div className={`absolute left-0 -top-[22px] text-[10px] font-medium text-gray-400 uppercase tracking-wide transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'
            }`}>
            {blockType(block.type)}
          </div>

          {/* Editable content area */}
          <div
            className={`relative block-content-wrapper min-h-[28px] w-full px-3 py-2 rounded-lg transition-all duration-150 ${block.isEditing ? 'bg-gray-50/60 ring-1 ring-gray-200/60' : 'hover:bg-gray-50/40'
              }`}
            onClick={() => !block.isEditing && setEditingState(block.id, true)}
          >
            {block.isEditing ? (
              <textarea
                ref={textareaRef}
                value={block.content}
                onChange={handleTextareaChange}
                onBlur={() => setEditingState(block.id, false)}
                onKeyDown={handleKeyDown}
                className={`w-full resize-none border-none outline-none bg-transparent text-gray-900 font-medium ${block.type === 'code' ? 'font-mono text-sm' : 'font-sans'
                  }`}
                placeholder={`Type '/' for commands`}
                style={{
                  height: textareaHeight,
                  minHeight: '24px'
                }}
                rows={1}
              />
            ) : (
              <BlockContent block={block} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
