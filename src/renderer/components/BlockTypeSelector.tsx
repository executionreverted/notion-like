// src/renderer/components/BlockTypeSelector.tsx
import React, { useEffect } from 'react';
import {
  Type,
  List,
  Code2,
  Image,
  Hash,
  Quote,
  CheckCircle2,
  Palette
} from 'lucide-react';

interface BlockTypeSelectorProps {
  onSelect: (type: any) => void;
  onClose: () => void;
  position: string | any;
}

export const BlockTypeSelector = ({ onSelect, onClose, position = 'bottom-left' }: BlockTypeSelectorProps) => {
  const blockTypes = [
    { type: 'text', icon: Type, label: 'Text', desc: 'Plain text paragraph', color: 'bg-blue-500' },
    { type: 'heading', icon: Hash, label: 'Heading 1', desc: 'Large section heading', color: 'bg-purple-600' },
    { type: 'heading2', icon: Hash, label: 'Heading 2', desc: 'Medium section heading', color: 'bg-purple-500' },
    { type: 'heading3', icon: Hash, label: 'Heading 3', desc: 'Small section heading', color: 'bg-purple-400' },
    { type: 'list', icon: List, label: 'Bulleted List', desc: 'Simple bulleted list', color: 'bg-green-500' },
    { type: 'quote', icon: Quote, label: 'Quote', desc: 'Capture a quote', color: 'bg-amber-500' },
    { type: 'code', icon: Code2, label: 'Code', desc: 'Code snippet', color: 'bg-gray-700' },
    { type: 'checklist', icon: CheckCircle2, label: 'To-do List', desc: 'Task list with checkboxes', color: 'bg-emerald-500' },
    { type: 'image', icon: Image, label: 'Image', desc: 'Upload or embed image', color: 'bg-rose-500' },
  ];

  const positionClasses = position === 'center'
    ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    : 'absolute top-full left-0 mt-2';

  useEffect(() => {
    const handleEscape = (e: any) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div style={{ zIndex: 999 }} className="fixed inset-0 z-50">
      {position === 'center' && (
        <div
          className="absolute inset-0 bg-black bg-opacity-20 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <div className={`${positionClasses} bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 z-50 w-80 overflow-hidden`}>
        <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-transparent">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Palette size={14} className="text-violet-500" />
            Choose block type
          </h3>
        </div>

        <div className="p-2 max-h-96 overflow-y-auto">
          <div className="grid gap-1">
            {blockTypes.map(({ type, icon: Icon, label, desc, color }) => (
              <button
                key={type}
                onClick={() => {
                  onSelect(type);
                  onClose();
                }}
                className="flex items-center gap-3 w-full p-3 text-left rounded-xl hover:bg-violet-50 border border-transparent hover:border-violet-200 transition-all duration-200 group"
              >
                <div className={`p-2.5 rounded-lg ${color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900">{label}</div>
                  <div className="text-xs text-gray-500 truncate">{desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
