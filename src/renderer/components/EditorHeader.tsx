import { useEffect, useRef } from "react";
import { useBlockEditor } from "../contexts/BlockEditorContext";
import { Calendar, Clock } from 'lucide-react';
export const EditorHeader = () => {
  const { title, isEditingTitle, setTitle, setIsEditingTitle, blocks } = useBlockEditor();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="space-y-5">
          {isEditingTitle ? (
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setIsEditingTitle(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
              className="text-5xl font-bold text-gray-900 bg-transparent border-none outline-none w-full placeholder-gray-400"
              placeholder="Untitled"
            />
          ) : (
            <h1
              className="text-5xl font-bold text-gray-900 cursor-text hover:bg-gray-50 p-3 -m-3 rounded-xl transition-all duration-200"
              onClick={() => setIsEditingTitle(true)}
            >
              {title}
            </h1>
          )}

          <div className="flex items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-xl">
                <Calendar size={16} className="text-violet-600" />
              </div>
              <span className="font-semibold">{today}</span>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-xl">
                <Clock size={16} className="text-purple-600" />
              </div>
              <span className="font-semibold">Edited just now</span>
            </div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
            <span className="font-semibold">{blocks.length} blocks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
