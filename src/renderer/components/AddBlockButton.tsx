// src/renderer/components/AddBlockButton.tsx
import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useBlockEditor } from '../contexts/BlockEditorContext';
import { BlockTypeSelector } from './BlockTypeSelector';

export const AddBlockButton = () => {
  const { addBlock } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative mt-6">
      <button
        ref={buttonRef}
        onClick={() => setShowTypeSelector(!showTypeSelector)}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all duration-150 py-3 px-4 rounded-lg w-full justify-center border-2 border-dashed border-gray-200 hover:border-gray-300 group"
      >
        <div className="p-1 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <Plus size={14} className="text-gray-500 group-hover:text-gray-600" />
        </div>
        <span className="font-medium">Add a block</span>
      </button>

      {showTypeSelector && (
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50">
          <BlockTypeSelector
            onSelect={(type) => {
              addBlock(undefined, type);
              setShowTypeSelector(false);
            }}
            onClose={() => setShowTypeSelector(false)}
          />
        </div>
      )}
    </div>
  );
};
