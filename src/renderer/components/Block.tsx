// Inline editing Block.tsx - No HTML structure changes, like Notion
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
  const { updateBlock, deleteBlock, addBlock, blocks, moveBlockToPosition } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Cursor position utilities
  const getCaretPosition = (element: HTMLElement) => {
    let caretPos = 0;
    const sel = window.getSelection();
    if (sel && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretPos = preCaretRange.toString().length;
    }
    return caretPos;
  };

  const setCaretPosition = (element: HTMLElement, pos: number) => {
    const range = document.createRange();
    const sel = window.getSelection();
    let charIndex = 0;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      const nextCharIndex = charIndex + (node.textContent?.length || 0);
      if (pos <= nextCharIndex) {
        range.setStart(node, pos - charIndex);
        range.collapse(true);
        sel?.removeAllRanges();
        sel?.addRange(range);
        return;
      }
      charIndex = nextCharIndex;
    }
  };

  // Debounced cursor restoration
  const cursorTimeoutRef = useRef<number | null>(null);

  // Handle content changes with debounced cursor preservation
  const handleInput = (e: any) => {
    if (contentRef.current) {
      const newContent = contentRef.current.innerText || '';
      const isEnterKey = e.inputType === 'insertParagraph' || e.inputType === 'insertLineBreak';

      if (isEnterKey) {
        updateBlock(block.id, newContent);
        requestAnimationFrame(() => {
          if (contentRef.current && document.activeElement === contentRef.current) {
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(contentRef.current);
            range.collapse(false);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        });
      } else {
        const cursorPos = getCaretPosition(contentRef.current);
        updateBlock(block.id, newContent);

        // Clear previous timeout
        if (cursorTimeoutRef.current) {
          clearTimeout(cursorTimeoutRef.current);
        }

        // Debounce cursor restoration
        cursorTimeoutRef.current = window.setTimeout(() => {
          if (contentRef.current && document.activeElement === contentRef.current) {
            setCaretPosition(contentRef.current, cursorPos);
          }
        }, 10);
      }
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      contentRef.current?.blur();
      return;
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setIsEditing(false);
      contentRef.current?.blur();
      return;
    }

    // For headings, Enter creates new block
    if (e.key === 'Enter' && !e.shiftKey && ['heading', 'heading2', 'heading3'].includes(block.type)) {
      e.preventDefault();
      setIsEditing(false);
      addBlock(block.id, 'text');
      return;
    }

    // Show type selector with /
    if (e.key === '/' && contentRef.current?.innerText === '') {
      e.preventDefault();
      setShowTypeSelector(true);
      return;
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Start editing
  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(contentRef.current);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  // Stop editing
  const stopEditing = () => {
    setIsEditing(false);
  };

  // Drag handlers (simplified)
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    setDragOverIndex(e.clientY < midpoint ? index : index + 1);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId && draggedId !== block.id && dragOverIndex !== null) {
      const draggedIndex = blocks.findIndex((b: any) => b.id === draggedId);
      let targetIndex = dragOverIndex;
      if (draggedIndex < dragOverIndex) targetIndex--;
      if (targetIndex !== draggedIndex && targetIndex >= 0) {
        moveBlockToPosition(draggedId, targetIndex);
      }
    }
    setDragOverIndex(null);
    setIsDragging(false);
  };

  const getBlockIcon = (type: string) => {
    const icons = {
      text: Type, heading: Hash, heading2: Hash, heading3: Hash,
      code: Code2, quote: Quote, list: List, checklist: CheckCircle2, image: Image,
    };
    return icons[type] || Type;
  };

  // Render inline editable content
  const renderContent = () => {
    const isEmpty = !block.content || block.content.trim() === '';
    const placeholder = isEmpty ? getPlaceholder() : '';

    // Common props for all editable elements
    const commonProps = {
      ref: contentRef,
      contentEditable: isEditing,
      suppressContentEditableWarning: true,
      onInput: handleInput,
      onKeyDown: handleKeyDown,
      onPaste: handlePaste,
      onBlur: stopEditing,
      onClick: !isEditing ? startEditing : undefined,
      'data-placeholder': placeholder,
      style: { cursor: isEditing ? 'text' : 'pointer' }
    };

    switch (block.type) {
      case 'heading':
        return (
          <h1
            {...commonProps}
            className="text-4xl font-bold text-slate-900 leading-tight py-2 outline-none"
          >
            {block.content || ''}
          </h1>
        );

      case 'heading2':
        return (
          <h2
            {...commonProps}
            className="text-3xl font-semibold text-slate-900 leading-tight py-2 outline-none"
          >
            {block.content || ''}
          </h2>
        );

      case 'heading3':
        return (
          <h3
            {...commonProps}
            className="text-2xl font-medium text-slate-900 leading-tight py-2 outline-none"
          >
            {block.content || ''}
          </h3>
        );

      case 'code':
        return (
          <div className="relative group my-2">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-700/50">
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <pre
                {...commonProps}
                className="p-6 font-mono text-sm leading-relaxed text-slate-100 outline-none whitespace-pre-wrap min-h-[4rem]"
              >
                {block.content || ''}
              </pre>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="my-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>
              <blockquote
                {...commonProps}
                className="pl-8 pr-6 py-6 text-slate-700 italic font-medium text-xl leading-relaxed outline-none"
              >
                {block.content || ''}
              </blockquote>
              <div className="absolute top-4 right-6 text-amber-200 text-6xl font-serif leading-none opacity-30 pointer-events-none">"</div>
            </div>
          </div>
        );

      case 'list':
        if (isEditing) {
          return (
            <div
              {...commonProps}
              className="py-2 text-slate-800 leading-relaxed font-medium text-lg outline-none whitespace-pre-wrap"
            >
              {block.content || ''}
            </div>
          );
        } else {
          // Display mode with proper bullet formatting
          const items = block.content ? block.content.split('\n').filter(line => line.trim()) : [];
          return (
            <div
              className="py-2 cursor-pointer"
              onClick={startEditing}
            >
              {items.length === 0 ? (
                <div className="text-slate-400 font-medium py-2">
                  {placeholder}
                </div>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 py-1">
                    <div className="flex-shrink-0 w-2 h-2 mt-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full"></div>
                    <div className="text-slate-800 leading-relaxed font-medium text-lg">
                      {item.replace(/^[-*+•]\s*/, '')}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        }

      default:
        return (
          <div
            {...commonProps}
            className="py-2 text-slate-800 leading-relaxed font-medium text-lg outline-none whitespace-pre-wrap min-h-[2rem]"
          >
            {block.content || ''}
          </div>
        );
    }
  };



  const getPlaceholder = () => {
    const placeholders = {
      heading: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      list: 'List item',
      quote: 'Quote text',
      code: '// Code here',
      text: "Type '/' for commands"
    };
    return placeholders[block.type] || 'Type something...';
  };

  const BlockIcon = getBlockIcon(block.type);

  return (
    <>
      {/* Drop indicator */}
      {dragOverIndex === index && (
        <div className="relative h-1 mx-4 my-3">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      )}

      <div
        ref={blockRef}
        className={`group relative transition-all duration-200 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-start gap-3">
          {/* Toolbar */}
          <div className="absolute left-[-24px] top-0 flex flex-col gap-1 pt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${block.type === 'text' ? 'bg-slate-100 text-slate-500' :
              block.type.startsWith('heading') ? 'bg-indigo-100 text-indigo-600' :
                block.type === 'code' ? 'bg-slate-800 text-white' :
                  block.type === 'quote' ? 'bg-amber-100 text-amber-600' :
                    'bg-green-100 text-green-600'
              }`}>
              <BlockIcon size={14} />
            </div>

            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center">
              <GripVertical size={14} />
            </button>

            <div className="h-px bg-slate-200 my-1"></div>

            <button
              onClick={onMoveUp}
              disabled={!canMoveUp}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${canMoveUp ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'text-slate-200'
                }`}
            >
              <ChevronUp size={14} />
            </button>

            <button
              onClick={onMoveDown}
              disabled={!canMoveDown}
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${canMoveDown ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600' : 'text-slate-200'
                }`}
            >
              <ChevronDown size={14} />
            </button>

            <div className="h-px bg-slate-200 my-1"></div>

            <button
              onClick={() => setShowTypeSelector(true)}
              className="w-8 h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 flex items-center justify-center"
            >
              <Plus size={14} />
            </button>

            {blocks.length > 1 && (
              <button
                onClick={() => deleteBlock(block.id)}
                className="w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 flex items-center justify-center"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-2xl transition-all ${isEditing ? 'bg-white shadow-lg ring-1 ring-indigo-200' : 'hover:bg-slate-50/50'
              }`}>
              <div className="p-6">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {dragOverIndex === index + 1 && (
        <div className="relative h-1 mx-4 my-3">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
        </div>
      )}

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
