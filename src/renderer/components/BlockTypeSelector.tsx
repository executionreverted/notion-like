// Enhanced BlockTypeSelector.tsx
import React, { useEffect, useState } from 'react';
import {
  Type,
  List,
  Code2,
  Image,
  Hash,
  Quote,
  CheckCircle2,
  Palette,
  Search,
  Zap
} from 'lucide-react';

interface BlockTypeSelectorProps {
  onSelect: (type: any) => void;
  onClose: () => void;
  position: string | any;
}

export const BlockTypeSelector = ({ onSelect, onClose, position = 'bottom-left' }: BlockTypeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const blockTypes = [
    {
      type: 'text',
      icon: Type,
      label: 'Text',
      desc: 'Plain text paragraph',
      color: 'bg-slate-500',
      keywords: ['text', 'paragraph', 'writing']
    },
    {
      type: 'heading',
      icon: Hash,
      label: 'Heading 1',
      desc: 'Large section heading',
      color: 'bg-indigo-600',
      keywords: ['heading', 'h1', 'title', 'large']
    },
    {
      type: 'heading2',
      icon: Hash,
      label: 'Heading 2',
      desc: 'Medium section heading',
      color: 'bg-indigo-500',
      keywords: ['heading', 'h2', 'subtitle', 'medium']
    },
    {
      type: 'heading3',
      icon: Hash,
      label: 'Heading 3',
      desc: 'Small section heading',
      color: 'bg-indigo-400',
      keywords: ['heading', 'h3', 'small']
    },
    {
      type: 'list',
      icon: List,
      label: 'Bulleted List',
      desc: 'Simple bulleted list',
      color: 'bg-emerald-500',
      keywords: ['list', 'bullet', 'ul', 'items']
    },
    {
      type: 'quote',
      icon: Quote,
      label: 'Quote',
      desc: 'Capture a quote or callout',
      color: 'bg-amber-500',
      keywords: ['quote', 'blockquote', 'citation']
    },
    {
      type: 'code',
      icon: Code2,
      label: 'Code Block',
      desc: 'Code snippet with syntax highlighting',
      color: 'bg-slate-700',
      keywords: ['code', 'snippet', 'programming', 'syntax']
    },
    {
      type: 'checklist',
      icon: CheckCircle2,
      label: 'To-do List',
      desc: 'Task list with checkboxes',
      color: 'bg-emerald-600',
      keywords: ['todo', 'checklist', 'tasks', 'checkbox']
    },
    {
      type: 'image',
      icon: Image,
      label: 'Image',
      desc: 'Upload or embed an image',
      color: 'bg-rose-500',
      keywords: ['image', 'photo', 'picture', 'upload']
    },
  ];

  const filteredTypes = blockTypes.filter(blockType => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      blockType.label.toLowerCase().includes(query) ||
      blockType.desc.toLowerCase().includes(query) ||
      blockType.keywords.some(keyword => keyword.toLowerCase().includes(query))
    );
  });

  const positionClasses = position === 'center'
    ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    : 'absolute top-full left-0 mt-2';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, filteredTypes.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredTypes[selectedIndex]) {
            onSelect(filteredTypes[selectedIndex].type);
            onClose();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onSelect, filteredTypes, selectedIndex]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  return (
    <div style={{ zIndex: 999 }} className="fixed inset-0 z-50">
      {position === 'center' && (
        <div
          className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`${positionClasses} bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 z-50 w-96 overflow-hidden animate-in slide-in-from-bottom-4 duration-300`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-transparent">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-xl">
              <Zap size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800">Add Block</h3>
          </div>

          {/* Search input */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search block types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/80 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Block types list */}
        <div className="p-3 max-h-80 overflow-y-auto">
          {filteredTypes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <Search size={24} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No blocks found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid gap-1">
              {filteredTypes.map(({ type, icon: Icon, label, desc, color }, index) => (
                <button
                  key={type}
                  onClick={() => {
                    onSelect(type);
                    onClose();
                  }}
                  className={`flex items-center gap-4 w-full p-4 text-left rounded-2xl transition-all duration-200 group ${index === selectedIndex
                    ? 'bg-indigo-50 border-2 border-indigo-200 scale-[1.02]'
                    : 'border-2 border-transparent hover:bg-slate-50 hover:border-slate-200'
                    }`}
                >
                  <div className={`flex items-center justify-center w-12 h-12 rounded-2xl ${color} text-white shadow-lg group-hover:scale-105 transition-transform ${index === selectedIndex ? 'scale-105' : ''
                    }`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-slate-900 mb-1">{label}</div>
                    <div className="text-sm text-slate-500 leading-relaxed">{desc}</div>
                  </div>
                  {index === selectedIndex && (
                    <div className="flex items-center justify-center w-6 h-6 bg-indigo-500 text-white rounded-lg text-xs font-bold">
                      ↵
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer with shortcuts */}
        <div className="px-6 py-4 border-t border-slate-200/60 bg-gradient-to-r from-slate-50/80 to-transparent">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="bg-slate-200 px-2 py-1 rounded font-mono">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="bg-slate-200 px-2 py-1 rounded font-mono">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="bg-slate-200 px-2 py-1 rounded font-mono">Esc</kbd>
              <span>Cancel</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
