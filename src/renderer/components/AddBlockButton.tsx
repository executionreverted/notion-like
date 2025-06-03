// Enhanced AddBlockButton.tsx
import { useState } from "react";
import { useBlockEditor } from "../contexts/BlockEditorContext";
import { BlockTypeSelector } from "./BlockTypeSelector";
import { Plus, Sparkles } from "lucide-react";

export const AddBlockButton = () => {
  const { addBlock } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative mt-12">
      <button
        onClick={() => setShowTypeSelector(!showTypeSelector)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-4 text-slate-500 hover:text-indigo-600 transition-all duration-300 py-8 px-10 rounded-3xl w-full justify-center border-2 border-dashed border-slate-200 hover:border-indigo-300 group relative overflow-hidden bg-gradient-to-br from-white to-slate-50/50 hover:from-indigo-50/50 hover:to-purple-50/30 hover:shadow-xl hover:shadow-indigo-500/10 hover:scale-[1.02]"
      >
        {/* Background animation */}
        <div className={`absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>

        {/* Floating sparkles */}
        {isHovered && (
          <>
            <div className="absolute top-4 left-8 animate-bounce" style={{ animationDelay: '0ms' }}>
              <Sparkles size={12} className="text-indigo-400" />
            </div>
            <div className="absolute top-6 right-12 animate-bounce" style={{ animationDelay: '200ms' }}>
              <Sparkles size={8} className="text-purple-400" />
            </div>
            <div className="absolute bottom-8 left-16 animate-bounce" style={{ animationDelay: '400ms' }}>
              <Sparkles size={10} className="text-pink-400" />
            </div>
          </>
        )}

        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 shadow-lg relative z-10 ${isHovered
          ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-indigo-500/30'
          : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100'
          }`}>
          <Plus size={24} className={`transition-transform duration-300 ${isHovered ? 'rotate-90' : ''}`} />
        </div>

        <div className="relative z-10">
          <div className="font-bold text-xl mb-1">Add a new block</div>
          <div className="text-sm text-slate-400 font-medium">
            Start writing or press <kbd className="bg-slate-200 px-2 py-1 rounded font-mono text-xs mx-1">/</kbd> for options
          </div>
        </div>

        {/* Gradient orb */}
        <div className={`absolute right-8 w-20 h-20 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'
          }`}></div>
      </button>

      {showTypeSelector && (
        <BlockTypeSelector
          position="center"
          onSelect={(type) => {
            addBlock(undefined, type);
            setShowTypeSelector(false);
          }}
          onClose={() => setShowTypeSelector(false)}
        />
      )}
    </div>
  );
};
