// Enhanced BlockEditor.tsx
import { BlockEditorContext, BlockEditorProvider } from '../contexts/BlockEditorContext';
import { EditorHeader } from './EditorHeader';
import { AddBlockButton } from './AddBlockButton';
import { Block } from './Block';
import { useState, useEffect } from 'react';

export default function BlockEditor() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app loading
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <BlockEditorProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <EditorHeader />

        <div className="max-w-4xl mx-auto px-6 py-8 relative">
          {/* Ambient background elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-violet-100/30 to-pink-100/30 rounded-full blur-3xl -z-10"></div>

          <div className="backdrop-blur-xl bg-white/90 rounded-3xl shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden relative">
            {/* Subtle top border gradient */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>

            <div className="p-8 lg:p-12">
              <BlockEditorContext.Consumer>
                {(context) => context && (
                  <div className="space-y-6">
                    {context.blocks.map((block, index) => (
                      <div
                        key={block.id}
                        className="animate-in slide-in-from-bottom-4 duration-500"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Block
                          block={block}
                          index={index}
                          onMoveUp={() => context.moveBlock(block.id, 'up')}
                          onMoveDown={() => context.moveBlock(block.id, 'down')}
                          canMoveUp={index > 0}
                          canMoveDown={index < context.blocks.length - 1}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </BlockEditorContext.Consumer>

              <AddBlockButton />
            </div>
          </div>

          {/* Floating action hints */}
          <div className="fixed bottom-6 right-6 space-y-3 z-30">
            <div className="bg-slate-800/90 backdrop-blur-xl text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg border border-slate-700/50">
              <span className="text-slate-300">Press</span> <kbd className="bg-slate-700 px-2 py-1 rounded font-mono text-xs">⌘ /</kbd> <span className="text-slate-300">for commands</span>
            </div>
          </div>
        </div>
      </div>
    </BlockEditorProvider>
  );
}
