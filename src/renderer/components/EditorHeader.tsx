// Enhanced EditorHeader.tsx
import { useEffect, useRef, useState } from "react";
import { useBlockEditor } from "../contexts/BlockEditorContext";
import {
  Calendar,
  Clock,
  FileText,
  Share,
  MoreHorizontal,
  Save,
  Download,
  Settings
} from 'lucide-react';

export const EditorHeader = () => {
  const { title, isEditingTitle, setTitle, setIsEditingTitle, blocks } = useBlockEditor();
  const [lastSaved, setLastSaved] = useState(new Date());
  const [showMenu, setShowMenu] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditingTitle && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingTitle]);

  // Simulate auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      setLastSaved(new Date());
    }, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const timeAgo = () => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const wordCount = blocks.reduce((count, block) => {
    return count + (block.content ? block.content.split(/\s+/).length : 0);
  }, 0);

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/60">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Title section */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {isEditingTitle ? (
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  className="text-5xl font-bold text-slate-900 bg-transparent border-none outline-none w-full placeholder-slate-400 leading-tight"
                  placeholder="Untitled Document"
                />
              ) : (
                <h1
                  className="text-5xl font-bold text-slate-900 cursor-text hover:bg-slate-50 p-3 -m-3 rounded-2xl transition-all duration-200 leading-tight"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title || "Untitled Document"}
                </h1>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 ml-6">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-all duration-200 hover:scale-105">
                <Share size={16} />
                <span>Share</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center justify-center w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <MoreHorizontal size={18} />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50">
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Save size={16} />
                      <span>Save</span>
                    </button>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Download size={16} />
                      <span>Export</span>
                    </button>
                    <div className="h-px bg-slate-200 my-2"></div>
                    <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-700 hover:bg-slate-50 transition-colors">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata section */}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-xl">
                <Calendar size={14} className="text-indigo-600" />
              </div>
              <span className="font-medium">{today}</span>
            </div>

            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-xl">
                <Clock size={14} className="text-emerald-600" />
              </div>
              <span className="font-medium">Saved {timeAgo()}</span>
            </div>

            <div className="w-1 h-1 bg-slate-300 rounded-full"></div>

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-xl">
                <FileText size={14} className="text-purple-600" />
              </div>
              <span className="font-medium">{blocks.length} blocks • {wordCount} words</span>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.min(100, (wordCount / 500) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Click away to close menu */}
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};
