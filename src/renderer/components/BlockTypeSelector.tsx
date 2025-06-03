// src/renderer/components/BlockTypeSelector.tsx
import React from 'react';
import {
  Type,
  List,
  Code2,
  Image,
  Hash,
  Quote,
  CheckCircle2,
} from 'lucide-react';
import { Block } from '../contexts/BlockEditorContext';

interface BlockTypeSelectorProps {
  onSelect: (type: Block['type']) => void;
  onClose: () => void;
}

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  onSelect,
  onClose
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
    <div className="absolute top-0 left-9 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-200/60 py-2 z-50 min-w-64 transform -translate-y-6">
      <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100/80">
        Block Types
      </div>
      <div className="py-1 max-h-[60vh] overflow-y-auto">
        {blockTypes.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => {
              onSelect(type);
              onClose();
            }}
            className="flex items-start gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50/80 transition-all duration-150 group"
          >
            <div className="p-1.5 rounded-lg bg-gray-100/70 group-hover:bg-gray-200/80 transition-colors">
              <Icon size={14} className="text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{label}</div>
              <div className="text-xs text-gray-500 truncate">{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
