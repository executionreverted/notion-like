import { useState } from "react";
import { useAutoResize, useBlockEditor } from "../contexts/BlockEditorContext";
import { ChevronDown, ChevronUp, Plus, X, GripVertical } from "lucide-react";
import { BlockTypeSelector } from "./BlockTypeSelector";
import { BlockContent } from "./BlockContent";

export const Block = ({ block, index, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: any) => {
  const { updateBlock, deleteBlock, addBlock, setEditingState, blocks, moveBlockToPosition } = useBlockEditor();
  const [isHovered, setIsHovered] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const textareaRef = useAutoResize(block.content, block.isEditing || false);

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
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', block.id);
    e.dataTransfer.effectAllowed = 'move';

    // Create a custom drag image
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.opacity = '0.8';
    dragImage.style.transform = 'rotate(2deg)';
    dragImage.style.width = `${e.currentTarget.offsetWidth}px`;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, e.currentTarget.offsetWidth / 2, 20);
    setTimeout(() => document.body.removeChild(dragImage), 0);
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

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drag over state if we're leaving the block entirely
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

    if (draggedId !== block.id && dragOverIndex !== null) {
      moveBlockToPosition(draggedId, dragOverIndex);
    }

    setDragOverIndex(null);
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
    // @ts-ignore
    return placeholders[type] || 'Type something...';
  };

  const getTextareaClass = (type: any) => {
    switch (type) {
      case 'heading':
        return 'text-4xl font-bold leading-tight';
      case 'heading2':
        return 'text-3xl font-semibold leading-tight';
      case 'heading3':
        return 'text-2xl font-medium leading-tight';
      case 'code':
        return 'font-mono text-sm bg-gray-50 leading-relaxed';
      default:
        return 'text-lg font-medium leading-relaxed';
    }
  };

  return (
    <>
      {/* Drop indicator above */}
      {dragOverIndex === index && (
        <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mx-4 my-2 shadow-lg animate-pulse" />
      )}

      <div
        className={`group relative transition-all duration-200 ${isDragging ? 'opacity-50 rotate-1 scale-105' : 'opacity-100'
          }`}
        draggable={!block.isEditing}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setShowTypeSelector(false);
        }}
      >
        <div className="flex items-start gap-4">
          {/* Drag handle and controls */}
          <div className={`flex flex-col gap-2 pt-3 transition-all duration-300 ease-out ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`}>
            {/* Drag handle */}
            <div
              className="p-2 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-all duration-200 cursor-grab active:cursor-grabbing hover:scale-110"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </div>

            <div className="flex flex-col gap-1">
              <button
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className={`p-2 rounded-lg transition-all duration-200 ${canMoveUp
                  ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 hover:scale-110'
                  : 'text-gray-200 cursor-not-allowed'
                  }`}
                title="Move up"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className={`p-2 rounded-lg transition-all duration-200 ${canMoveDown
                  ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600 hover:scale-110'
                  : 'text-gray-200 cursor-not-allowed'
                  }`}
                title="Move down"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="w-full h-px bg-gray-200 my-1"></div>

            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className="p-2 hover:bg-violet-50 hover:text-violet-600 rounded-lg transition-all duration-200 hover:scale-110"
                title="Add block"
              >
                <Plus size={14} className="text-gray-400" />
              </button>

              {showTypeSelector && (
                <BlockTypeSelector
                  position={""}
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
                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all duration-200 hover:scale-110"
                title="Delete block"
              >
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </div>

          {/* Block content */}
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
              {block.type === 'text' ? 'paragraph' : block.type.replace(/\d/, ' $&')}
            </div>

            <div
              className={`relative w-full rounded-2xl transition-all duration-200 ${block.isEditing
                ? 'bg-white shadow-xl ring-2 ring-violet-200 ring-offset-4'
                : 'hover:bg-gray-50 cursor-text'
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
                  className={`w-full p-6 border-none outline-none bg-transparent resize-none text-gray-900 placeholder-gray-400 ${getTextareaClass(block.type)}`}
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

      {/* Drop indicator below (for last item) */}
      {dragOverIndex === index + 1 && (
        <div className="h-1 bg-gradient-to-r from-violet-400 to-purple-400 rounded-full mx-4 my-2 shadow-lg animate-pulse" />
      )}
    </>
  );
};
