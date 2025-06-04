// Fixed Block.tsx - Uncontrolled contentEditable during editing
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

export const Block = ({ block, index, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: any) => {
  const { updateBlock, deleteBlock, addBlock, blocks, moveBlockToPosition } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);

  // Sync editing state
  useEffect(() => {
    isEditingRef.current = isEditing;
  }, [isEditing]);

  // Only update DOM when not editing to prevent cursor jumps
  useEffect(() => {
    if (!isEditingRef.current && contentRef.current) {
      if (contentRef.current.textContent !== block.content) {
        contentRef.current.textContent = block.content || '';
      }
    }
  }, [block.content]);

  // Handle content changes - no React state updates during editing
  const handleInput = () => {
    // Don't trigger any React updates during editing
    // Content will be saved on blur
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      stopEditing();
      return;
    }

    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      stopEditing();
      return;
    }

    // For headings, Enter creates new block
    if (e.key === 'Enter' && !e.shiftKey && ['heading', 'heading2', 'heading3'].includes(block.type)) {
      e.preventDefault();
      const content = contentRef.current?.textContent || '';
      updateBlock(block.id, content);
      setIsEditing(false);
      setTimeout(() => addBlock(block.id, 'text'), 0);
      return;
    }


    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEditing();
      return;
    }

    // Show type selector with /
    if (e.key === '/' && contentRef.current?.textContent === '') {
      e.preventDefault();
      setShowTypeSelector(true);
      return;
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const startEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.focus();
        // Set cursor to end
        const range = document.createRange();
        const selection = window.getSelection();
        if (contentRef.current.childNodes.length > 0) {
          const lastNode = contentRef.current.childNodes[contentRef.current.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.textContent?.length || 0);
          } else {
            range.setStart(contentRef.current, contentRef.current.childNodes.length);
          }
        } else {
          range.setStart(contentRef.current, 0);
        }
        range.collapse(true);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, 0);
  };

  const stopEditing = () => {
    if (contentRef.current) {
      const content = contentRef.current.textContent || '';
      updateBlock(block.id, content);
    }
    setIsEditing(false);
    contentRef.current?.blur();
  };

  // Drag handlers
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

  const renderContent = () => {
    const isEmpty = !block.content || block.content.trim() === '';
    const placeholder = isEmpty ? getPlaceholder() : '';

    // Common props - key difference: no value prop, let DOM manage content
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
            dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
          >
            {isEditing ? undefined : null}
          </h1>
        );

      case 'heading2':
        return (
          <h2
            {...commonProps}
            className="text-3xl font-semibold text-slate-900 leading-tight py-2 outline-none"
            dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
          >
            {isEditing ? undefined : null}
          </h2>
        );

      case 'heading3':
        return (
          <h3
            {...commonProps}
            className="text-2xl font-medium text-slate-900 leading-tight py-2 outline-none"
            dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
          >
            {isEditing ? undefined : null}
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
                dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
              >
                {isEditing ? undefined : null}
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
                dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
              >
                {isEditing ? undefined : null}
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
            />
          );
        } else {
          const items = block.content ? block.content.split('\n').filter(line => line.trim()) : [];
          return (
            <div className="py-2 cursor-pointer" onClick={startEditing}>
              {items.length === 0 ? (
                <div className="text-slate-400 font-medium py-2"></div>
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
            dangerouslySetInnerHTML={!isEditing ? { __html: block.content || '' } : undefined}
          >
            {isEditing ? undefined : null}
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
