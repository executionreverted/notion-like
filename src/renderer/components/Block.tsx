// Enhanced Block.tsx
import { useState, useRef } from "react";
import { useAutoResize, useBlockEditor } from "../contexts/BlockEditorContext";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  GripVertical,
  Type,
  Hash,
  Code2,
  Quote,
  List,
  Image,
  CheckCircle2
} from "lucide-react";
import { BlockTypeSelector } from "./BlockTypeSelector";
import { BlockContent } from "./BlockContent";

export const Block = ({ block, index, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: any) => {
  const { updateBlock, deleteBlock, addBlock, setEditingState, blocks, moveBlockToPosition } = useBlockEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const textareaRef = useAutoResize(block.content, block.isEditing || false);
  const blockRef = useRef<HTMLDivElement>(null);

  // Enhanced keyboard handling
  const handleKeyDown = (e: any) => {
    if (e.key === 'Escape') {
      setEditingState(block.id, false);
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      setEditingState(block.id, false);
    }
    if (e.key === 'Enter' && !e.shiftKey && !['code', 'list', 'checklist'].includes(block.type)) {
      e.preventDefault();
      setEditingState(block.id, false);
      addBlock(block.id);
    }
    if (e.key === 'Tab' && block.type === 'code') {
      e.preventDefault();
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      const value = e.currentTarget.value;
      updateBlock(block.id, value.substring(0, start) + '  ' + value.substring(end));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
    if (e.key === '/' && e.currentTarget.value === '') {
      e.preventDefault();
      setShowTypeSelector(true);
    }

    // Arrow key navigation
    if (e.key === 'ArrowUp' && e.metaKey && !block.isEditing) {
      e.preventDefault();
      if (canMoveUp) onMoveUp();
    }
    if (e.key === 'ArrowDown' && e.metaKey && !block.isEditing) {
      e.preventDefault();
      if (canMoveDown) onMoveDown();
    }
  };

  // Enhanced drag and drop
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';

    // Custom drag image with better styling
    if (blockRef.current) {
      const dragImage = blockRef.current.cloneNode(true) as HTMLElement;
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.left = '-1000px';
      dragImage.style.opacity = '0.9';
      dragImage.style.transform = 'rotate(-1deg) scale(0.95)';
      dragImage.style.width = `${blockRef.current.offsetWidth}px`;
      dragImage.style.background = 'rgba(255,255,255,0.98)';
      dragImage.style.borderRadius = '16px';
      dragImage.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, blockRef.current.offsetWidth / 2, 20);
      setTimeout(() => document.body.removeChild(dragImage), 0);
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const dropIndex = e.clientY < midpoint ? index : index + 1;
    setDragOverIndex(dropIndex);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    if (draggedId !== block.id && dragOverIndex !== null) {
      moveBlockToPosition(draggedId, dragOverIndex);
    }

    setDragOverIndex(null);
  };

  const getBlockIcon = (type: string) => {
    const iconMap = {
      text: Type,
      heading: Hash,
      heading2: Hash,
      heading3: Hash,
      code: Code2,
      quote: Quote,
      list: List,
      checklist: CheckCircle2,
      image: Image,
    };
    return iconMap[type] || Type;
  };

  const getPlaceholder = (type: any) => {
    const placeholders = {
      heading: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      list: '• List item',
      quote: 'Quote',
      code: '// Code block',
      checklist: '☐ To-do item',
      image: 'Image description or URL',
      text: 'Type \'/\' for commands'
    };
    return placeholders[type] || 'Type something...';
  };

  const getTextareaClass = (type: any) => {
    switch (type) {
      case 'heading':
        return 'text-4xl font-bold leading-tight text-slate-900';
      case 'heading2':
        return 'text-3xl font-semibold leading-tight text-slate-900';
      case 'heading3':
        return 'text-2xl font-medium leading-tight text-slate-900';
      case 'code':
        return 'font-mono text-sm leading-relaxed text-slate-800 bg-slate-50/50';
      default:
        return 'text-lg leading-relaxed text-slate-800';
    }
  };

  const BlockIcon = getBlockIcon(block.type);

  return (
    <>
      {/* Enhanced drop indicator */}
      {dragOverIndex === index && (
        <div className="relative h-1 mx-4 my-3">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm"></div>
        </div>
      )}

      <div
        ref={blockRef}
        className={`group relative transition-all duration-300 ease-out ${isDragging ? 'opacity-50 rotate-1 scale-[0.98] z-50' : 'opacity-100'
          } ${isHovered ? 'transform-gpu' : ''}`}
        draggable={!block.isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTypeSelector(false);
        }}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-start gap-3">
          {/* Enhanced toolbar */}
          <div className={`flex flex-col gap-1 pt-3 transition-all duration-300 ease-out ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}>
            {/* Block type indicator */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${block.type === 'text' ? 'bg-slate-100 text-slate-500' :
              block.type.startsWith('heading') ? 'bg-indigo-100 text-indigo-600' :
                block.type === 'code' ? 'bg-slate-800 text-white' :
                  block.type === 'quote' ? 'bg-amber-100 text-amber-600' :
                    block.type === 'list' ? 'bg-green-100 text-green-600' :
                      block.type === 'checklist' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
              }`}>
              <BlockIcon size={14} />
            </div>

            {/* Drag handle */}
            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 cursor-grab active:cursor-grabbing group/drag"
              title="Drag to reorder"
            >
              <GripVertical size={14} className="group-hover/drag:scale-110 transition-transform" />
            </button>

            <div className="w-full h-px bg-slate-200 my-1"></div>

            {/* Move buttons */}
            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${canMoveUp
                  ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600 hover:scale-105'
                  : 'text-slate-200 cursor-not-allowed'
                  }`}
                title="Move up (⌘↑)"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${canMoveDown
                  ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600 hover:scale-105'
                  : 'text-slate-200 cursor-not-allowed'
                  }`}
                title="Move down (⌘↓)"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="w-full h-px bg-slate-200 my-1"></div>

            {/* Add block button */}
            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all duration-200 hover:scale-105"
                title="Add block below"
              >
                <Plus size={14} />
              </button>

              {showTypeSelector && (
                <BlockTypeSelector
                  position=""
                  onSelect={(type) => {
                    addBlock(block.id, type);
                    setShowTypeSelector(false);
                  }}
                  onClose={() => setShowTypeSelector(false)}
                />
              )}
            </div>

            {/* Delete button */}
            {blocks.length > 1 && (
              <button
                onClick={() => deleteBlock(block.id)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all duration-200 hover:scale-105"
                title="Delete block"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Enhanced block content */}
          <div className="flex-1 min-w-0">
            <div
              className={`relative w-full rounded-2xl transition-all duration-300 ease-out ${block.isEditing
                ? 'bg-white shadow-2xl shadow-indigo-500/10 ring-2 ring-indigo-200/70 ring-offset-2 ring-offset-white scale-[1.01]'
                : 'hover:bg-slate-50/50 cursor-text hover:shadow-lg hover:shadow-slate-200/50'
                }`}
              onClick={() => !block.isEditing && !isDragging && setEditingState(block.id, true)}
            >
              {block.isEditing ? (
                <textarea
                  ref={textareaRef}
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  onBlur={() => setEditingState(block.id, false)}
                  onKeyDown={handleKeyDown}
                  placeholder={getPlaceholder(block.type)}
                  className={`w-full p-6 border-none outline-none bg-transparent resize-none placeholder-slate-400 ${getTextareaClass(block.type)}`}
                  style={{
                    minHeight: '4rem',
                    height: 'auto',
                  }}
                />
              ) : (
                <div className="p-6">
                  <BlockContent block={block} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drop indicator below */}
      {dragOverIndex === index + 1 && (
        <div className="relative h-1 mx-4 my-3">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-sm"></div>
        </div>
      )}
    </>
  );
};
