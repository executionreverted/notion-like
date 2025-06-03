import { Image } from 'lucide-react';

interface BlockContentProps {
  block: any;
}

export const BlockContent = ({ block }: BlockContentProps) => {
  if (!block.content.trim()) {
    return (
      <div className="text-gray-400 font-medium py-4 select-none flex items-center gap-2">
        <span className="text-gray-300 text-lg">✎</span>
        <span>Click to edit or type '/' for commands</span>
      </div>
    );
  }

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <h1 className="text-4xl font-bold text-gray-900 leading-tight py-3">
            {block.content.replace(/^#\s*/, '')}
          </h1>
        );
      case 'heading2':
        return (
          <h2 className="text-3xl font-semibold text-gray-900 leading-tight py-2">
            {block.content.replace(/^##\s*/, '')}
          </h2>
        );
      case 'heading3':
        return (
          <h3 className="text-2xl font-medium text-gray-900 leading-tight py-2">
            {block.content.replace(/^###\s*/, '')}
          </h3>
        );
      case 'code':
        return (
          <div className="relative group my-3">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 rounded-xl p-5 overflow-x-auto shadow-lg border border-gray-700">
              <pre className="text-sm font-mono leading-relaxed">
                <code>{block.content}</code>
              </pre>
            </div>
          </div>
        );
      case 'quote':
        return (
          <div className="my-4">
            <div className="border-l-4 border-violet-400 bg-gradient-to-r from-violet-50 to-purple-50 rounded-r-xl relative overflow-hidden">
              <div className="pl-8 pr-6 py-5">
                <div className="text-gray-700 italic font-medium text-xl leading-relaxed">
                  {block.content}
                </div>
              </div>
              <div className="absolute top-4 left-3 text-violet-300 text-4xl font-serif leading-none opacity-60">"</div>
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="py-3">
            {block.content.split('\n').filter(line => line.trim()).map((item, i) => (
              <div key={i} className="flex items-start gap-4 py-2">
                <div className="flex-shrink-0 w-2.5 h-2.5 mt-3 bg-gradient-to-br from-violet-400 to-purple-400 rounded-full shadow-sm"></div>
                <div className="text-gray-800 leading-relaxed font-medium text-lg">
                  {item.replace(/^[-*+]\s*/, '')}
                </div>
              </div>
            ))}
          </div>
        );
      case 'checklist':
        return (
          <div className="py-3 space-y-3">
            {block.content.split('\n').filter(line => line.trim()).map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-6 h-6 mt-1 rounded-lg border-2 border-gray-300 bg-white hover:border-violet-400 transition-colors cursor-pointer flex items-center justify-center shadow-sm">
                  <div className="w-3 h-3 bg-transparent rounded-sm"></div>
                </div>
                <div className="text-gray-800 leading-relaxed font-medium text-lg">{item}</div>
              </div>
            ))}
          </div>
        );
      case 'image':
        return (
          <div className="my-4">
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-10 text-center border-2 border-dashed border-violet-200 hover:border-violet-300 transition-colors group cursor-pointer">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <Image size={32} className="text-violet-600" />
              </div>
              <div className="text-gray-600 font-semibold text-lg">{block.content || 'Click to add image'}</div>
              <div className="text-sm text-gray-400 mt-2">Drag & drop or click to upload</div>
            </div>
          </div>
        );
      default:
        return (
          <div className="py-3">
            <div className="text-gray-800 leading-relaxed font-medium text-lg">
              {block.content.split('\n').map((line, i) => (
                <div key={i} className={i > 0 ? 'mt-4' : ''}>{line}</div>
              ))}
            </div>
          </div>
        );
    }
  };

  return <div className="min-h-[3rem]">{renderContent()}</div>;
};
