// Fixed Block.tsx - Resolved Enter key and animation issues
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
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus management for contentEditable
  useEffect(() => {
    if (block.isEditing && contentRef.current && document.activeElement !== contentRef.current) {
      contentRef.current.focus();

      // Place cursor at end only when first entering edit mode
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(contentRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [block.isEditing]);

  // Handle content changes with proper cursor preservation
  const handleContentChange = () => {
    if (contentRef.current) {
      const selection = window.getSelection();
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

      if (!range) {
        updateBlock(block.id, contentRef.current.innerText || '');
        return;
      }

      // Calculate cursor position relative to text content
      const cursorOffset = getCursorOffset(contentRef.current, range);

      let newContent = contentRef.current.innerText || '';

      // Special handling for quotes (remove extra quotes)
      // if (block.type === 'quote') {
      //   newContent = newContent.replace(/^"/, '').replace(/"$/, '');
      // }
      //
      updateBlock(block.id, newContent);

      // Restore cursor position immediately
      setTimeout(() => {
        if (contentRef.current && document.activeElement === contentRef.current) {
          setCursorOffset(contentRef.current, cursorOffset);
        }
      }, 0);
    }
  };

  // Better cursor position calculation
  const getCursorOffset = (element: HTMLElement, range: Range): number => {
    let offset = 0;
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      if (node === range.startContainer) {
        return offset + range.startOffset;
      }
      offset += node.textContent?.length || 0;
    }
    return offset;
  };

  // Better cursor position setting
  const setCursorOffset = (element: HTMLElement, offset: number) => {
    const selection = window.getSelection();
    if (!selection) return;

    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentOffset = 0;
    let node;

    while (node = walker.nextNode()) {
      const nodeLength = node.textContent?.length || 0;
      if (currentOffset + nodeLength >= offset) {
        const range = document.createRange();
        range.setStart(node, Math.min(offset - currentOffset, nodeLength));
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }
      currentOffset += nodeLength;
    }

    // Fallback: place at end
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const findTextNode = (element: Node, targetOffset: number): Text | null => {
    let currentOffset = 0;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    let node;
    while (node = walker.nextNode()) {
      const nodeLength = node.textContent?.length || 0;
      if (currentOffset + nodeLength >= targetOffset) {
        return node as Text;
      }
      currentOffset += nodeLength;
    }

    // Return last text node if offset is beyond content
    walker.currentNode = element;
    let lastTextNode = null;
    while (node = walker.nextNode()) {
      lastTextNode = node;
    }
    return lastTextNode as Text;
  };

  // Fixed keyboard handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape always exits editing
    if (e.key === 'Escape') {
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
      return;
    }

    // Cmd/Ctrl+Enter exits editing
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
      return;
    }

    // Handle Enter key differently based on block type
    if (e.key === 'Enter' && !e.shiftKey) {
      // For text, list, and checklist blocks, allow newlines in contentEditable
      if (['text', 'list', 'checklist', 'quote'].includes(block.type)) {
        // Let the browser handle the newline insertion naturally
        return;
      }

      // For other block types (headings, quotes, etc.), create new block
      e.preventDefault();
      setEditingState(block.id, false);
      contentRef.current?.blur();
      return;
    }

    // Show type selector with /
    if (e.key === '/' && contentRef.current?.innerText === '') {
      e.preventDefault();
      setShowTypeSelector(true);
      return;
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

  // Handle paste to preserve plain text
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');

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

  // Drag and drop implementation
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
      dragImage.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
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

    if (e.clientY < midpoint) {
      setDragOverIndex(index);
    } else {
      setDragOverIndex(index + 1);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX > rect.right ||
      e.clientY < rect.top ||
      e.clientY > rect.bottom
    ) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');

    if (draggedId && draggedId !== block.id && dragOverIndex !== null) {
      const draggedBlockIndex = blocks.findIndex((b: any) => b.id === draggedId);

      if (draggedBlockIndex !== -1) {
        let targetIndex = dragOverIndex;

        if (draggedBlockIndex < dragOverIndex) {
          targetIndex = dragOverIndex - 1;
        }

        if (targetIndex !== draggedBlockIndex && targetIndex >= 0 && targetIndex <= blocks.length) {
          moveBlockToPosition(draggedId, targetIndex);
        }
      }
    }

    setDragOverIndex(null);
    setIsDragging(false);
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
        return `${baseClasses} py-2 text-slate-800 leading-relaxed font-medium text-lg whitespace-pre-wrap`;
      case 'checklist':
        return `${baseClasses} py-2 text-slate-800 leading-relaxed font-medium text-lg whitespace-pre-wrap`;
      default:
        return `${baseClasses} py-2 text-slate-800 leading-relaxed font-medium text-lg whitespace-pre-wrap`;
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

  // Render editable content
  const renderEditableContent = () => {
    const isEmpty = !block.content || block.content.trim() === '';

    if (block.type === 'code') {
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

            <div
              ref={contentRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => setEditingState(block.id, false)}
              className="p-6 font-mono text-sm leading-relaxed text-slate-100 outline-none focus:outline-none whitespace-pre-wrap min-h-[4rem]"
              data-placeholder={isEmpty ? getPlaceholder(block.type) : ''}
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
            "
            <div
              ref={contentRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleContentChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onBlur={() => setEditingState(block.id, false)}
              className="pl-8 pr-6 py-6 text-slate-700 italic font-medium text-xl leading-relaxed outline-none focus:outline-none"
              data-placeholder={isEmpty ? `"${getPlaceholder(block.type)}"` : ''}
            >
              {block.content && !isEmpty ? `${block.content}` : ''}
            </div>
            "
            <div className="absolute top-4 right-6 text-amber-200 text-6xl font-serif leading-none opacity-30 pointer-events-none">"</div>
          </div>
        </div>
      );
    }

    // Special list handling with proper bullet preservation
    if (block.type === 'list') {
      const listItems = block.content ? block.content.split('\n').filter(item => item.trim()) : [''];

      return (
        <div className="py-2">
          {listItems.map((item, i) => (
            <div key={i} className="flex items-start gap-3 py-1">
              <div className="flex-shrink-0 w-2 h-2 mt-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full"></div>
              <div
                ref={i === 0 ? contentRef : null}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onInput={(e) => {
                  if (contentRef.current) {
                    // Get all list item texts
                    const allItems = Array.from(contentRef.current.parentElement?.parentElement?.querySelectorAll('[contenteditable]') || [])
                      .map(el => (el as HTMLElement).innerText.trim())
                      .filter(text => text);

                    updateBlock(block.id, allItems.join('\n'));
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    // Add new list item
                    const currentText = (e.target as HTMLElement).innerText.trim();
                    const allItems = block.content ? block.content.split('\n').filter(item => item.trim()) : [];
                    allItems.splice(i + 1, 0, '');
                    updateBlock(block.id, allItems.join('\n'));

                    // Focus the new item after render
                    setTimeout(() => {
                      const nextItem = (e.target as HTMLElement).parentElement?.nextElementSibling?.querySelector('[contenteditable]') as HTMLElement;
                      if (nextItem) {
                        nextItem.focus();
                      }
                    }, 0);
                  } else {
                    handleKeyDown(e);
                  }
                }}
                onPaste={handlePaste}
                onBlur={() => {
                  if (i === listItems.length - 1) {
                    setEditingState(block.id, false);
                  }
                }}
                className="text-slate-800 leading-relaxed font-medium text-lg outline-none focus:outline-none flex-1"
                data-placeholder={!item && i === 0 ? getPlaceholder(block.type) : ''}
              >
                {item.replace(/^[-*+•]\s*/, '')}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div
        ref={contentRef}
        contentEditable={true}
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
  const shouldShowEditor = block.isEditing || (!block.content || block.content.trim() === '');

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
        className={`group relative transition-all duration-200 ease-out ${isDragging ? 'opacity-50 rotate-1 scale-[0.98] z-50' : 'opacity-100'
          }`}
        draggable={!block.isEditing && !shouldShowEditor}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="flex items-start gap-3">
          {/* Toolbar - no layout-shifting animations */}
          <div style={{ minHeight: 100, height: "auto", left: -24 }} className={`absolute top-0 flex flex-col gap-1 pt-3 transition-opacity duration-200 ${'opacity-0'
            }`}>

            <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors duration-200 ${block.type === 'text' ? 'bg-slate-100 text-slate-500' :
              block.type.startsWith('heading') ? 'bg-indigo-100 text-indigo-600' :
                block.type === 'code' ? 'bg-slate-800 text-white' :
                  block.type === 'quote' ? 'bg-amber-100 text-amber-600' :
                    block.type === 'list' ? 'bg-green-100 text-green-600' :
                      block.type === 'checklist' ? 'bg-emerald-100 text-emerald-600' :
                        'bg-rose-100 text-rose-600'
              }`}>
              <BlockIcon size={14} />
            </div>

            <button
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all duration-200 cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>

            <div className="w-full h-px bg-slate-200 my-1"></div>

            <div className="flex flex-col gap-0.5">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${canMoveUp
                  ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
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
                  ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
                  : 'text-slate-200 cursor-not-allowed'
                  }`}
                title="Move down (⌘↓)"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="w-full h-px bg-slate-200 my-1"></div>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTypeSelector(true);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-all duration-200"
                title="Add block below"
              >
                <Plus size={14} />
              </button>
            </div>

            {blocks.length > 1 && (
              <button
                onClick={() => deleteBlock(block.id)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50 hover:text-red-600 text-slate-400 transition-all duration-200"
                title="Delete block"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Block content - removed layout-shifting animations */}
          <div className="flex-1 min-w-0">
            <div
              className={`relative w-full rounded-2xl transition-all duration-200 ease-out ${shouldShowEditor
                ? 'bg-white shadow-lg ring-1 ring-indigo-200'
                : 'hover:bg-slate-50/50 cursor-text hover:shadow-sm'
                }`}
              onClick={() => !shouldShowEditor && !isDragging && setEditingState(block.id, true)}
            >
              {shouldShowEditor ? (
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

      {/* Block Type Selector */}
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
