// src/renderer/components/BlockEditor.tsx
import React, { useState, useRef, useEffect } from 'react';
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
import {
  GripVertical,
  Plus,
  Type,
  List,
  Code2,
  Image,
  Hash,
  Quote,
  CheckCircle2,
  X,
  MoreHorizontal
} from 'lucide-react';

export interface Block {
  id: string;
  type: 'text' | 'heading' | 'heading2' | 'heading3' | 'list' | 'code' | 'image' | 'quote' | 'checklist';
  content: string;
  isEditing?: boolean;
  metadata?: any;
}

const initialBlocks: Block[] = [
  { id: '1', type: 'heading', content: '# Welcome to Block Editor' },
  { id: '2', type: 'text', content: 'A **beautiful** and *intuitive* block-based editor with markdown support.' },
  { id: '3', type: 'quote', content: 'Design is not just what it looks like and feels like. Design is how it works.' },
  { id: '4', type: 'list', content: '- Drag blocks to reorder them\n- Click to edit inline\n- Supports rich markdown formatting\n- Clean macOS-inspired design' },
  { id: '5', type: 'code', content: 'const editor = new BlockEditor();\neditor.render();' },
];

const BlockTypeSelector = ({
  onSelect,
  onClose
}: {
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}) => {
  const blockTypes = [
    { type: 'text' as const, icon: Type, label: 'Text', description: 'Plain text paragraph' },
    { type: 'heading' as const, icon: Hash, label: 'Heading 1', description: 'Large section heading' },
    { type: 'heading2' as const, icon: Hash, label: 'Heading 2', description: 'Medium section heading' },
    { type: 'heading3' as const, icon: Hash, label: 'Heading 3', description: 'Small section heading' },
    { type: 'list' as const, icon: List, label: 'Bulleted List', description: 'Simple bulleted list' },
    { type: 'quote' as const, icon: Quote, label: 'Quote', description: 'Capture a quote' },
    { type: 'code' as const, icon: Code2, label: 'Code', description: 'Code snippet with syntax' },
    { type: 'checklist' as const, icon: CheckCircle2, label: 'To-do List', description: 'Track tasks with checkboxes' },
    { type: 'image' as const, icon: Image, label: 'Image', description: 'Upload or embed image' },
  ];

  return (
    <div className="absolute top-10 left-0 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/50 py-2 z-50 min-w-64">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
        Block Types
      </div>
      {blockTypes.map(({ type, icon: Icon, label, description }) => (
        <button
          key={type}
          onClick={() => {
            onSelect(type);
            onClose();
          }}
          className="flex items-start gap-3 w-full px-4 py-3 text-left hover:bg-gray-50/80 transition-all duration-150 group"
        >
          <div className="p-1.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
            <Icon size={14} className="text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900">{label}</div>
            <div className="text-xs text-gray-500 truncate">{description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

const SortableBlock = ({
  block,
  onUpdate,
  onDelete,
  onAddBlock,
  isFirst,
  isLast
}: {
  block: Block;
  onUpdate: (id: string, content: string, type?: Block['type']) => void;
  onDelete: (id: string) => void;
  onAddBlock: (afterId: string, type?: Block['type']) => void;
  isFirst: boolean;
  isLast: boolean;
}) => {
  const [isEditing, setIsEditing] = useState(block.isEditing || false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
    }
  }, [isEditing]);

  const getPlaceholder = (type: Block['type']) => {
    switch (type) {
      case 'heading': return 'Heading 1';
      case 'heading2': return 'Heading 2';
      case 'heading3': return 'Heading 3';
      case 'list': return 'List item';
      case 'quote': return 'Quote';
      case 'code': return 'Code block';
      case 'checklist': return '☐ To-do item';
      case 'image': return 'Image URL or description';
      default: return 'Type \'/\' for commands';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      setIsEditing(false);
    }
    if (e.key === 'Enter' && !e.shiftKey && block.type !== 'code' && block.type !== 'list') {
      e.preventDefault();
      setIsEditing(false);
      onAddBlock(block.id);
    }
  };

  const renderContent = () => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => onUpdate(block.id, e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={handleKeyDown}
          placeholder={getPlaceholder(block.type)}
          className="w-full resize-none border-none outline-none bg-transparent text-gray-900 placeholder-gray-400 font-medium"
          style={{ minHeight: '1.5rem' }}
          rows={block.type === 'code' ? 4 : 1}
        />
      );
    }

    if (!block.content) {
      return (
        <div className="text-gray-400 font-medium">
          {getPlaceholder(block.type)}
        </div>
      );
    }

    switch (block.type) {
      case 'heading':
        return <h1 className="text-2xl font-bold text-gray-900 leading-tight">{block.content.replace(/^#\s*/, '')}</h1>;
      case 'heading2':
        return <h2 className="text-xl font-semibold text-gray-900 leading-tight">{block.content.replace(/^##\s*/, '')}</h2>;
      case 'heading3':
        return <h3 className="text-lg font-medium text-gray-900 leading-tight">{block.content.replace(/^###\s*/, '')}</h3>;
      case 'code':
        return (
          <pre className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-4 overflow-x-auto border border-gray-200/50">
            <code className="text-sm font-mono text-gray-800 leading-relaxed">{block.content}</code>
          </pre>
        );
      case 'quote':
        return (
          <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/30 rounded-r-lg">
            <div className="text-gray-700 italic font-medium leading-relaxed">{block.content}</div>
          </blockquote>
        );
      case 'image':
        return (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
            <Image size={32} className="mx-auto text-gray-400 mb-2" />
            <div className="text-gray-500 font-medium">{block.content || 'Click to add image'}</div>
          </div>
        );
      default:
        return (
          <div className="prose prose-gray max-w-none">
            <div className="text-gray-800 leading-relaxed font-medium">
              <ReactMarkdown>
                {block.content}
              </ReactMarkdown>
            </div>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative transition-all duration-200 ${isDragging ? 'z-50 rotate-1 scale-105' : ''
        } ${isFirst ? 'mt-0' : 'mt-1'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false);
        setShowTypeSelector(false);
      }}
    >
      <div className="flex items-start gap-2">
        {/* Drag Handle & Actions */}
        <div className={`flex flex-col gap-1 transition-all duration-200 ${showActions ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
          }`}>
          <button
            {...attributes}
            {...listeners}
            className="p-1.5 hover:bg-gray-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
          >
            <GripVertical size={14} className="text-gray-400" />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowTypeSelector(!showTypeSelector)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Plus size={14} className="text-gray-400" />
            </button>
            {showTypeSelector && (
              <BlockTypeSelector
                onSelect={(type) => onAddBlock(block.id, type)}
                onClose={() => setShowTypeSelector(false)}
              />
            )}
          </div>
          <button
            onClick={() => onDelete(block.id)}
            className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
          >
            <X size={14} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div
          className="flex-1 cursor-text py-2 px-3 rounded-lg hover:bg-gray-50/50 transition-all duration-150"
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
  const [title, setTitle] = useState('Untitled Document');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
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

  const updateBlock = (id: string, content: string, type?: Block['type']) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content, type: type || block.type, isEditing: false } : block
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
          <div className="px-8 py-6">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full"
                autoFocus
              />
            ) : (
              <h1
                className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50 px-2 py-1 -mx-2 rounded-lg transition-colors"
                onClick={() => setIsEditingTitle(true)}
              >
                {title}
              </h1>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{blocks.length} blocks</span>
              <span>•</span>
              <span>Last edited just now</span>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="px-8 py-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div className="p-8">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
                  {blocks.map((block, index) => (
                    <SortableBlock
                      key={block.id}
                      block={block}
                      onUpdate={updateBlock}
                      onDelete={deleteBlock}
                      onAddBlock={addBlock}
                      isFirst={index === 0}
                      isLast={index === blocks.length - 1}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add Block Button */}
              <button
                onClick={() => addBlock()}
                className="flex items-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150 mt-6 p-3 rounded-lg w-full justify-center border-2 border-dashed border-gray-200 hover:border-gray-300"
              >
                <Plus size={18} />
                <span className="font-medium">Add a block</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
