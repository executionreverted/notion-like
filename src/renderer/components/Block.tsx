// Enhanced Block.tsx with contentEditable
import { useState, useRef, useEffect } from "react";
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
import { BlockContent } from "./BlockContent";

export const Block = ({ block, index, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: any) => {
  const { updateBlock, deleteBlock, addBlock, setEditingState, blocks, moveBlockToPosition } = useBlockEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus and cursor management for contentEditable
  useEffect(() => {
    if (block.isEditing && contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.focus();

      // Place cursor at end of content only when first entering edit mode
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [block.isEditing]);

  // Handle content changes from contentEditable with cursor preservation
  const handleContentChange = () => {
    if (contentRef.current) {
      // Save cursor position before updating state
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const cursorOffset = range ? range.startOffset : 0;
      const focusNode = range ? range.startContainer : null;

      const newContent = contentRef.current.innerText || '';
      updateBlock(block.id, newContent);

      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        if (contentRef.current && focusNode && selection) {
          try {
            const newRange = document.createRange();
            // Find the same text node or closest equivalent
            const textNode = findTextNode(contentRef.current, cursorOffset);
            if (textNode) {
              const maxOffset = Math.min(cursorOffset, textNode.textContent?.length || 0);
              newRange.setStart(textNode, maxOffset);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          } catch (e) {
            // Fallback: place cursor at end if restoration fails
            const range = document.createRange();
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      });
    }
  };

  // Helper function to find the appropriate text node for cursor positioning
  const findTextNode = (element: Node, targetOffset: number): Text | null => {
    let currentOffset = 0;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent?.length || 0;
      if (currentOffset + nodeLength >= targetOffset) {
        return node as Text;
      }
      currentOffset += nodeLength;
    }

    // Return the last text node if offset is beyond content
    walker.currentNode = element;
    let lastTextNode = null;
    while (node = walker.nextNode()) {
      lastTextNode = node;
    }
    return lastTextNode as Text;
  };

  // Enhanced keyboard handling for contentEditable
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
    }

    if (e.key === 'Enter' && !e.shiftKey && !['code', 'list', 'checklist'].includes(block.type)) {
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
      addBlock(block.id);
    }

    if (e.key === '/' && contentRef.current?.innerText === '') {
      e.preventDefault();
      setShowTypeSelector(true);
    }

    // Arrow key navigation (only when not editing)
    if (!block.isEditing) {
      if (e.key === 'ArrowUp' && e.metaKey) {
        e.preventDefault();
        if (canMoveUp) onMoveUp();
      }
      if (e.key === 'ArrowDown' && e.metaKey) {
        e.preventDefault();
        if (canMoveDown) onMoveDown();
      }
    }
  };

  // Handle paste to preserve formatting appropriately
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

    // Insert plain text to avoid formatting issues
    const selection = window.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }

    handleContentChange();
  };

  // Enhanced drag and drop (same as before)
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';

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

  const getEditableClasses = (type: string) => {
    const baseClasses = "outline-none focus:outline-none w-full";

    switch (type) {
      case 'heading':
        return `${baseClasses} text-4xl font-bold text-slate-900 leading-tight py-2`;
      case 'heading2':
        return `${baseClasses} text-3xl font-semibold text-slate-900 leading-tight py-2`;
      case 'heading3':
        return `${baseClasses} text-2xl font-medium text-slate-900 leading-tight py-2`;
      case 'code':
        return `${baseClasses} bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-2xl p-6 font-mono text-sm leading-relaxed whitespace-pre`;
      case 'quote':
        return `${baseClasses} relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50 pl-8 pr-6 py-6 text-slate-700 italic font-medium text-xl leading-relaxed`;
      case 'list':
        return `${baseClasses} py-2 text-slate-800 leading-relaxed font-medium text-lg`;
      default:
        return `${baseClasses} py-2 text-slate-800 leading-relaxed font-medium text-lg`;
    }
  };

  const getPlaceholder = (type: string) => {
    const placeholders = {
      heading: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      list: 'List item',
      quote: 'Quote text',
      code: '// Code here',
      checklist: 'To-do item',
      image: 'Image description or URL',
      text: "Type '/' for commands"
    };
    return placeholders[type] || 'Type something...';
  };

  // Render editable content with proper styling
  const renderEditableContent = () => {
    const isEmpty = !block.content || block.content.trim() === '';

    if (block.type === 'code') {
      return (
        <div className="relative group my-2">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
            {/* Code block header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>

            <div
              ref={contentRef}
              contentEditable={block.isEditing}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => setEditingState(block.id, false)}
              className="p-6 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:outline-none whitespace-pre-wrap min-h-[4rem]"
              data-placeholder={isEmpty ? getPlaceholder(block.type) : ''}
              style={{
                ...(isEmpty && {
                  '::before': {
                    content: 'attr(data-placeholder)',
                    color: '#64748b',
                    pointerEvents: 'none'
                  }
                })
              }}
            >
              {block.content}
            </div>
          </div>
        </div>
      );
    }

    if (block.type === 'quote') {
      return (
        <div className="my-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>
            <div
              ref={contentRef}
              contentEditable={block.isEditing}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => setEditingState(block.id, false)}
              className="pl-8 pr-6 py-6 text-slate-700 italic font-medium text-xl leading-relaxed outline-none focus:outline-none"
              data-placeholder={isEmpty ? `"${getPlaceholder(block.type)}"` : ''}
            >
              {block.content && `"${block.content}"`}
            </div>
            {/* Quote decoration */}
            <div className="absolute top-4 right-6 text-amber-200 text-6xl font-serif leading-none opacity-30 pointer-events-none">"</div>
          </div>
        </div>
      );
    }

    // Default content rendering
    return (
      <div
        ref={contentRef}
        contentEditable={block.isEditing}
        suppressContentEditableWarning={true}
        onInput={handleContentChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={() => setEditingState(block.id, false)}
        className={getEditableClasses(block.type)}
        data-placeholder={isEmpty ? getPlaceholder(block.type) : ''}
      >
        {block.content}
      </div>
    );
  };

  const BlockIcon = getBlockIcon(block.type);

  return (
    <>
      {/* Drop indicator above */}
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
                <div className="p-6">
                  {renderEditableContent()}
                </div>
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
