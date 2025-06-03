// src/renderer/components/CommandMenu.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Type,
  List,
  Code2,
  Image,
  Hash,
  Quote,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { Block } from '../contexts/BlockEditorContext';

interface CommandMenuProps {
  position: { top: number; left: number };
  onSelect: (command: { type: Block['type']; action: string }) => void;
  onClose: () => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({
  position,
  onSelect,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const commands = [
    {
      type: 'text' as const,
      icon: Type,
      label: 'Text',
      description: 'Add a text paragraph',
      action: 'add'
    },
    {
      type: 'heading' as const,
      icon: Hash,
      label: 'Heading 1',
      description: 'Large section heading',
      action: 'add'
    },
    {
      type: 'heading2' as const,
      icon: Hash,
      label: 'Heading 2',
      description: 'Medium section heading',
      action: 'add'
    },
    {
      type: 'heading3' as const,
      icon: Hash,
      label: 'Heading 3',
      description: 'Small section heading',
      action: 'add'
    },
    {
      type: 'list' as const,
      icon: List,
      label: 'Bulleted List',
      description: 'Simple bulleted list',
      action: 'add'
    },
    {
      type: 'quote' as const,
      icon: Quote,
      label: 'Quote',
      description: 'Capture a quote',
      action: 'add'
    },
    {
      type: 'code' as const,
      icon: Code2,
      label: 'Code',
      description: 'Code snippet with syntax',
      action: 'add'
    },
    {
      type: 'checklist' as const,
      icon: CheckCircle2,
      label: 'To-do List',
      description: 'Track tasks with checkboxes',
      action: 'add'
    },
    {
      type: 'image' as const,
      icon: Image,
      label: 'Image',
      description: 'Upload or embed image',
      action: 'add'
    },
  ];

  const filteredCommands = commands.filter(
    (command) =>
      command.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    // Focus the search input when the menu opens
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Add event listener for clicks outside the menu
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    // Reset active index when search term changes
    setActiveIndex(0);
  }, [searchTerm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filteredCommands.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands.length > 0) {
          onSelect(filteredCommands[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 z-50 w-80 overflow-hidden"
      style={{
        bottom: "-100%",
        right: position.left + 'px',
      }}
    >
      <div className="px-3 py-2 border-b border-gray-100/80">
        <div className="flex items-center gap-2 bg-gray-50/70 rounded-lg px-3 py-2">
          <Search size={14} className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900"
          />
        </div>
      </div>
      <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((command, index) => (
            <button
              key={command.label}
              onClick={() => onSelect(command)}
              className={`flex items-start gap-3 w-full px-4 py-2.5 text-left transition-colors ${index === activeIndex
                ? 'bg-blue-50/50 text-blue-600'
                : 'hover:bg-gray-50/70'
                }`}
            >
              <div
                className={`p-1.5 rounded-lg ${index === activeIndex
                  ? 'bg-blue-100/70 text-blue-600'
                  : 'bg-gray-100/70 text-gray-600'
                  }`}
              >
                <command.icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{command.label}</div>
                <div className="text-xs text-gray-500">{command.description}</div>
              </div>
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center text-gray-500">
            <div className="mx-auto w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
              <Search size={16} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium">No commands found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-gray-100/80 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">↑↓</span>
          <span>to navigate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Enter</span>
          <span>to select</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">Esc</span>
          <span>to close</span>
        </div>
      </div>
    </div>
  );
};
