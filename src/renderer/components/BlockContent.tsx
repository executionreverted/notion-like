// Enhanced BlockContent.tsx
import { Image, ExternalLink, Play } from 'lucide-react';

interface BlockContentProps {
  block: any;
}

export const BlockContent = ({ block }: BlockContentProps) => {
  if (!block.content.trim()) {
    return (
      <div className="text-slate-400 font-medium py-6 select-none flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 bg-slate-100 rounded-xl">
          <span className="text-slate-500 text-lg">✎</span>
        </div>
        <div>
          <div className="text-slate-600 font-medium">Click to edit</div>
          <div className="text-sm text-slate-400">Or type '/' for commands</div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <h1 className="text-4xl font-bold text-slate-900 leading-tight py-2">
            {block.content.replace(/^#\s*/, '')}
          </h1>
        );

      case 'heading2':
        return (
          <h2 className="text-3xl font-semibold text-slate-900 leading-tight py-2">
            {block.content.replace(/^##\s*/, '')}
          </h2>
        );

      case 'heading3':
        return (
          <h3 className="text-2xl font-medium text-slate-900 leading-tight py-2">
            {block.content.replace(/^###\s*/, '')}
          </h3>
        );

      case 'code':
        return (
          <div className="relative group my-2">
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 rounded-2xl p-6 overflow-x-auto shadow-xl border border-slate-700/50 relative">
              {/* Code block header */}
              <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
                <button className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors">
                  Copy
                </button>
              </div>
              <pre className="text-sm font-mono leading-relaxed">
                <code className="text-slate-100">{block.content}</code>
              </pre>

              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-slate-800/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>
          </div>
        );

      case 'quote':
        return (
          <div className="my-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400"></div>
              <div className="pl-8 pr-6 py-6">
                <div className="text-slate-700 italic font-medium text-xl leading-relaxed">
                  "{block.content}"
                </div>
              </div>

              {/* Quote decoration */}
              <div className="absolute top-4 right-6 text-amber-200 text-6xl font-serif leading-none opacity-30">"</div>
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="py-2">
            {block.content.split('\n').filter(line => line.trim()).map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-2 group hover:bg-slate-50/50 rounded-xl px-2 -mx-2 transition-colors">
                <div className="flex-shrink-0 w-2 h-2 mt-3 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full shadow-sm group-hover:scale-110 transition-transform"></div>
                <div className="text-slate-800 leading-relaxed font-medium text-lg">
                  {item.replace(/^[-*+]\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        );

      case 'checklist':
        return (
          <div className="py-2 space-y-2">
            {block.content.split('\n').filter(line => line.trim()).map((item, i) => {
              const isCompleted = item.startsWith('☑') || item.includes('[x]');
              const cleanItem = item.replace(/^[☐☑]\s*/, '').replace(/^\[[ x]\]\s*/, '');

              return (
                <div key={i} className="flex items-start gap-4 group hover:bg-slate-50/50 rounded-xl px-2 py-2 -mx-2 transition-colors">
                  <div className={`flex-shrink-0 w-5 h-5 mt-1 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm hover:scale-105 ${isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 bg-white hover:border-emerald-400'
                    }`}>
                    {isCompleted && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className={`leading-relaxed font-medium text-lg transition-all ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}>
                    {cleanItem}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 'image':
        const isUrl = block.content.startsWith('http');

        return (
          <div className="my-4">
            {isUrl ? (
              <div className="relative group overflow-hidden rounded-2xl bg-slate-100">
                <img
                  src={block.content}
                  alt="Block content"
                  className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'block';
                  }}
                />
                <div className="hidden">
                  <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl p-12 text-center border-2 border-dashed border-slate-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-2xl flex items-center justify-center">
                      <ExternalLink size={32} className="text-slate-500" />
                    </div>
                    <div className="text-slate-600 font-semibold text-lg">Invalid image URL</div>
                    <div className="text-sm text-slate-400 mt-2 font-mono bg-slate-100 px-3 py-1 rounded-lg inline-block">
                      {block.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-2xl p-12 text-center border-2 border-dashed border-indigo-200 hover:border-indigo-300 transition-all group cursor-pointer hover:shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                  <Image size={40} className="text-indigo-600" />
                </div>
                <div className="text-slate-700 font-semibold text-xl mb-2">
                  {block.content || 'Click to add image'}
                </div>
                <div className="text-sm text-slate-500 mb-4">
                  Drag & drop, paste URL, or click to upload
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span className="bg-slate-200 px-2 py-1 rounded font-mono">JPG</span>
                  <span className="bg-slate-200 px-2 py-1 rounded font-mono">PNG</span>
                  <span className="bg-slate-200 px-2 py-1 rounded font-mono">GIF</span>
                  <span className="bg-slate-200 px-2 py-1 rounded font-mono">SVG</span>
                </div>
              </div>
            )}
          </div>
        );

      default:
        // Enhanced text rendering with link detection
        const renderTextWithLinks = (text: string) => {
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          const parts = text.split(urlRegex);

          return parts.map((part, index) => {
            if (urlRegex.test(part)) {
              return (
                <a
                  key={index}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline decoration-indigo-300 hover:decoration-indigo-500 transition-colors inline-flex items-center gap-1"
                >
                  {part}
                  <ExternalLink size={14} className="opacity-60" />
                </a>
              );
            }
            return part;
          });
        };

        return (
          <div className="py-2">
            <div className="text-slate-800 leading-relaxed font-medium text-lg">
              {block.content.split('\n').map((line, i) => (
                <div key={i} className={i > 0 ? 'mt-4' : ''}>
                  {renderTextWithLinks(line)}
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return <div className="min-h-[3rem]">{renderContent()}</div>;
};
