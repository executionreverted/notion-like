// Updated Block.tsx - Integrated with ChecklistBlock
import { useState, useRef, useEffect, useCallback } from "react";
import { useBlockEditor } from "../contexts/BlockEditorContext";
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
import { ChecklistBlock } from "./ChecklistBlock";

interface BlockProps {
  block: any;
  index: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export const Block = ({ block, index, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: BlockProps) => {
  const { updateBlock, deleteBlock, addBlock, blocks, moveBlockToPosition, convertBlockType } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isEmpty, setIsEmpty] = useState(!block.content || block.content.trim() === '');
  const [showToolbar, setShowToolbar] = useState(false);

  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const dragHandleRef = useRef<HTMLButtonElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced content update
  const debouncedUpdate = useCallback((content: string) => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(() => {
      updateBlock(block.id, content);
    }, 150);
  }, [block.id, updateBlock]);

  // Initialize content when component mounts or block changes
  useEffect(() => {
    if (block.type !== 'checklist' && contentRef.current && contentRef.current.textContent !== block.content) {
      contentRef.current.textContent = block.content || '';
      setIsEmpty(!block.content || block.content.trim() === '');
    }
  }, [block.content, block.type]);

  // Handle input with debounced updates
  const handleInput = useCallback(() => {
    if (!contentRef.current) return;

    const content = contentRef.current.textContent || '';
    setIsEmpty(content.trim() === '');
    debouncedUpdate(content);
  }, [debouncedUpdate]);

  // Enhanced keyboard handling
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const content = contentRef.current?.textContent || '';

    // Escape to blur
    if (e.key === 'Escape') {
      e.preventDefault();
      contentRef.current?.blur();
      return;
    }

    // Handle empty block with "/"
    if (e.key === '/' && content === '') {
      e.preventDefault();
      setShowTypeSelector(true);
      return;
    }

    // Handle markdown shortcuts for empty blocks
    if (content === '' && e.key === ' ') {
      const beforeSpace = (e.target as HTMLElement).textContent || '';

      if (beforeSpace === '#') {
        e.preventDefault();
        convertBlockType(block.id, 'heading');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '##') {
        e.preventDefault();
        convertBlockType(block.id, 'heading2');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '###') {
        e.preventDefault();
        convertBlockType(block.id, 'heading3');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '>') {
        e.preventDefault();
        convertBlockType(block.id, 'quote');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '```') {
        e.preventDefault();
        convertBlockType(block.id, 'code');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '-' || beforeSpace === '*') {
        e.preventDefault();
        convertBlockType(block.id, 'list');
        contentRef.current!.textContent = '';
        return;
      }
      if (beforeSpace === '[]') {
        e.preventDefault();
        convertBlockType(block.id, 'checklist');
        contentRef.current!.textContent = '';
        return;
      }
    }

    // Enter behavior
    if (e.key === 'Enter' && !e.shiftKey) {
      const isHeading = ['heading', 'heading2', 'heading3'].includes(block.type);

      if (isHeading || content.trim() === '') {
        e.preventDefault();
        const finalContent = contentRef.current?.textContent || '';
        updateBlock(block.id, finalContent);

        // Create new block
        setTimeout(() => {
          addBlock(block.id, 'text');
        }, 0);
        return;
      }
    }

    // Backspace on empty block
    if (e.key === 'Backspace' && content === '' && blocks.length > 1) {
      e.preventDefault();
      const prevIndex = index - 1;
      if (prevIndex >= 0) {
        // Focus previous block and delete current
        const prevBlock = document.querySelector(`[data-block-id="${blocks[prevIndex].id}"] [contenteditable]`) as HTMLElement;
        if (prevBlock) {
          prevBlock.focus();
          // Set cursor to end
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(prevBlock);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
      deleteBlock(block.id);
      return;
    }

    // Arrow key navigation between blocks
    if (e.key === 'ArrowUp' && e.metaKey) {
      e.preventDefault();
      onMoveUp();
      return;
    }
    if (e.key === 'ArrowDown' && e.metaKey) {
      e.preventDefault();
      onMoveDown();
      return;
    }

    // Navigate to adjacent blocks with arrow keys when at start/end
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);

      if (range && contentRef.current) {
        const isAtStart = range.startOffset === 0;
        const isAtEnd = range.endOffset === contentRef.current.textContent?.length;

        if ((e.key === 'ArrowUp' && isAtStart) || (e.key === 'ArrowDown' && isAtEnd)) {
          e.preventDefault();
          const targetIndex = e.key === 'ArrowUp' ? index - 1 : index + 1;
          if (targetIndex >= 0 && targetIndex < blocks.length) {
            const targetBlock = document.querySelector(`[data-block-id="${blocks[targetIndex].id}"] [contenteditable]`) as HTMLElement;
            if (targetBlock) {
              targetBlock.focus();
              // Set cursor position
              const range = document.createRange();
              const sel = window.getSelection();
              range.selectNodeContents(targetBlock);
              range.collapse(e.key === 'ArrowUp');
              sel?.removeAllRanges();
              sel?.addRange(range);
            }
          }
        }
      }
    }
  }, [block.id, block.type, blocks, index, onMoveUp, onMoveDown, deleteBlock, addBlock, updateBlock, convertBlockType]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    // Insert plain text only
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleInput();
  }, [handleInput]);

  // Focus handlers
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Final update on blur for non-checklist blocks
    if (block.type !== 'checklist' && contentRef.current) {
      const content = contentRef.current.textContent || '';
      updateBlock(block.id, content);
    }
  }, [block.id, block.type, updateBlock]);

  // Fixed drag handlers
  const handleDragStart = useCallback((e: React.DragEvent) => {
    // Only allow drag from the drag handle
    if (e.target !== dragHandleRef.current) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';

    // Better drag image
    if (blockRef.current) {
      e.dataTransfer.setDragImage(blockRef.current, 20, 20);
    }
  }, [block.id]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (!blockRef.current) return;

    // Don't show drop indicator on the dragged element itself
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId === block.id) {
      setDragOverIndex(null);
      return;
    }

    // Auto-scroll when near edges
    const viewportHeight = window.innerHeight;
    const scrollThreshold = 100;

    if (e.clientY < scrollThreshold) {
      window.scrollBy(0, -10);
    } else if (e.clientY > viewportHeight - scrollThreshold) {
      window.scrollBy(0, 10);
    }

    // More sensitive drop zone detection
    const rect = blockRef.current.getBoundingClientRect();
    const dropZoneHeight = Math.min(rect.height / 3, 30); // Max 30px drop zone

    if (e.clientY < rect.top + dropZoneHeight) {
      setDragOverIndex(index);
    } else if (e.clientY > rect.bottom - dropZoneHeight) {
      setDragOverIndex(index + 1);
    } else {
      setDragOverIndex(null);
    }
  }, [index, block.id]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    if (draggedId && draggedId !== block.id && dragOverIndex !== null) {
      const draggedIndex = blocks.findIndex((b: any) => b.id === draggedId);
      let targetIndex = dragOverIndex;

      // Adjust target index if dragging down
      if (draggedIndex < targetIndex) {
        targetIndex--;
      }

      if (targetIndex !== draggedIndex && targetIndex >= 0 && targetIndex <= blocks.length) {
        moveBlockToPosition(draggedId, targetIndex);
      }
    }

    setDragOverIndex(null);
  }, [block.id, blocks, dragOverIndex, moveBlockToPosition]);

  // Mouse handlers with tolerance
  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowToolbar(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Add delay before hiding toolbar
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isFocused) {
        setShowToolbar(false);
      }
    }, 300); // 300ms tolerance
  }, [isFocused]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Get block styling based on type
  const getBlockStyles = useCallback(() => {
    const baseStyles = "w-full outline-none resize-none border-none bg-transparent leading-relaxed";

    switch (block.type) {
      case 'heading':
        return `${baseStyles} text-4xl font-bold text-slate-900 py-2`;
      case 'heading2':
        return `${baseStyles} text-3xl font-semibold text-slate-900 py-2`;
      case 'heading3':
        return `${baseStyles} text-2xl font-medium text-slate-900 py-2`;
      case 'quote':
        return `${baseStyles} text-xl font-medium text-slate-700 italic`;
      case 'code':
        return `${baseStyles} font-mono text-sm text-slate-100 whitespace-pre`;
      default:
        return `${baseStyles} text-lg font-medium text-slate-800`;
    }
  }, [block.type]);

  // Get placeholder text
  const getPlaceholder = useCallback(() => {
    const placeholders = {
      heading: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      quote: 'Quote',
      code: '// Code',
      list: 'List item',
      checklist: 'Todo list',
      text: "Type '/' for commands"
    };
    return placeholders[block.type] || "Type something...";
  }, [block.type]);

  // Get block icon
  const getBlockIcon = useCallback((type: string) => {
    const icons = {
      text: Type, heading: Hash, heading2: Hash, heading3: Hash,
      code: Code2, quote: Quote, list: List, checklist: CheckCircle2, image: Image,
    };
    return icons[type] || Type;
  }, []);

  const BlockIcon = getBlockIcon(block.type);

  // Handle special rendering for different block types
  const renderBlockContent = () => {
    // Special handling for checklist blocks
    if (block.type === 'checklist') {
      return (
        <ChecklistBlock
          block={block}
          isFocused={isFocused}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
    }

    const sharedProps = {
      ref: contentRef,
      contentEditable: true,
      suppressContentEditableWarning: true,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onFocus: handleFocus,
      onBlur: handleBlur,
      className: getBlockStyles(),
      'data-placeholder': isEmpty ? getPlaceholder() : '',
      style: {
        minHeight: block.type === 'code' ? '3rem' : '1.5rem'
      }
    };

    if (block.type === 'code') {
      return (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
          <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>
          <div className="p-6">
            <div {...sharedProps} />
          </div>
        </div>
      );
    }

    if (block.type === 'quote') {
      return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>
          <div className="pl-8 pr-6 py-6">
            <div {...sharedProps} />
          </div>
          <div className="absolute top-4 right-6 text-amber-200 text-6xl font-serif leading-none opacity-30 pointer-events-none">"</div>
        </div>
      );
    }

    if (block.type === 'list') {
      return (
        <div className="py-2">
          <div
            {...sharedProps}
            style={{
              minHeight: '1.5rem',
              whiteSpace: 'pre-wrap'
            }}
            onKeyDown={(e) => {
              // Handle Enter key for new list items
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const selection = window.getSelection();
                const range = selection?.getRangeAt(0);
                if (range) {
                  const textNode = document.createTextNode('\n• ');
                  range.insertNode(textNode);
                  range.setStartAfter(textNode);
                  range.collapse(true);
                  selection?.removeAllRanges();
                  selection?.addRange(range);
                }
                handleInput();
                return;
              }

              // Call original keydown handler for other keys
              handleKeyDown(e);
            }}
            onInput={(e) => {
              const content = e.currentTarget.textContent || '';

              // If empty content and first time, add initial bullet
              if (content === '' && isEmpty) {
                e.currentTarget.textContent = '• ';
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(e.currentTarget.firstChild || e.currentTarget, 2);
                range.collapse(true);
                sel?.removeAllRanges();
                sel?.addRange(range);
              }

              handleInput();
            }}
          />
        </div>
      );
    }

    return <div {...sharedProps} />;
  };

  return (
    <>
      {/* Drop indicator above */}
      {dragOverIndex === index && (
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-6 my-1 animate-pulse shadow-sm" />
      )}

      <div
        ref={blockRef}
        data-block-id={block.id}
        className={`group relative transition-all duration-200 ${isDragging ? 'opacity-30 scale-95 rotate-1' : 'opacity-100'
          }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Horizontal toolbar at bottom right */}
        <div
          ref={toolbarRef}
          className={`absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/60 p-1 transition-all duration-200 z-10 ${showToolbar || isFocused ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
        >
          {/* Block type indicator */}
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium ${block.type === 'text' ? 'bg-slate-100 text-slate-500' :
            block.type.startsWith('heading') ? 'bg-indigo-100 text-indigo-600' :
              block.type === 'code' ? 'bg-slate-800 text-white' :
                block.type === 'quote' ? 'bg-amber-100 text-amber-600' :
                  block.type === 'checklist' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-emerald-100 text-emerald-600'
            }`}>
            <BlockIcon size={12} />
          </div>

          {/* Drag handle */}
          <button
            ref={dragHandleRef}
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center cursor-grab active:cursor-grabbing"
            title="Drag to reorder"
          >
            <GripVertical size={12} />
          </button>

          {/* Add block */}
          <button
            onClick={() => setShowTypeSelector(true)}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center"
            title="Add block"
          >
            <Plus size={12} />
          </button>

          {/* Move up */}
          <button
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>

          {/* Move down */}
          <button
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>

          {/* Delete */}
          {blocks.length > 1 && (
            <button
              onClick={() => deleteBlock(block.id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 flex items-center justify-center"
              title="Delete block"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Block content */}
        <div className={`rounded-2xl p-6 transition-all duration-200 ${isFocused ? 'bg-white shadow-sm' : 'hover:bg-slate-50/50'
          }`}>
          {renderBlockContent()}
        </div>
      </div>

      {/* Drop indicator below */}
      {dragOverIndex === index + 1 && (
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-6 my-1 animate-pulse shadow-sm" />
      )}

      {/* Block type selector */}
      {showTypeSelector && (
        <BlockTypeSelector
          onSelect={(type) => {
            addBlock(block.id, type);
            setShowTypeSelector(false);
          }}
          onClose={() => setShowTypeSelector(false)}
        />
      )}
    </>
  );
};
