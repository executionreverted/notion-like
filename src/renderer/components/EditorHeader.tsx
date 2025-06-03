// src/renderer/components/EditorHeader.tsx
import React, { useRef, useEffect } from 'react';
import { useBlockEditor } from '../contexts/BlockEditorContext';
import { Clock, Calendar } from 'lucide-react';

export const EditorHeader = () => {
  const { blocks, title, isEditingTitle, setIsEditingTitle, setTitle } = useBlockEditor();
  const inputRef = useRef<HTMLInputElement>(null);

  // Format current date
  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
      <div className="px-8 py-6">
        <div className="relative flex items-center">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none w-full px-3 py-1.5 rounded-lg focus:bg-gray-50/80 transition-colors"
              autoComplete="off"
            />
          ) : (
            <h1
              className="text-2xl font-bold text-gray-900 cursor-text hover:bg-gray-50/80 px-3 py-1.5 rounded-lg transition-colors w-full truncate"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-gray-100">
              <Calendar size={12} className="text-gray-500" />
            </div>
            <span>{formattedDate}</span>
          </div>
          <span className="text-gray-300">•</span>
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-gray-100">
              <Clock size={12} className="text-gray-500" />
            </div>
            <span>Last edited just now</span>
          </div>
          <span className="text-gray-300">•</span>
          <span>{blocks.length} blocks</span>
        </div>
      </div>
    </div>
  );
};
