// src/renderer/components/BlockContent.tsx
import React from 'react';
// @ts-ignore
import ReactMarkdown from 'react-markdown';
import { Image } from 'lucide-react';
import { Block } from '../contexts/BlockEditorContext';

interface BlockContentProps {
  block: Block;
}

export const BlockContent: React.FC<BlockContentProps> = ({ block }) => {
  if (!block.content.trim()) {
    return (
      <div className="text-gray-400 font-medium">
        Click to edit...
      </div>
    );
  }

  return (
    <div className="prose prose-gray max-w-none">
      <ReactMarkdown>
        {block.content}
      </ReactMarkdown>
    </div>
  )

  switch (block.type) {
    case 'heading':
      return (
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
          {block.content.replace(/^#\s*/, '')}
        </h1>
      );
    case 'heading2':
      return (
        <h2 className="text-xl font-semibold text-gray-900 leading-tight">
          {block.content.replace(/^##\s*/, '')}
        </h2>
      );
    case 'heading3':
      return (
        <h3 className="text-lg font-medium text-gray-900 leading-tight">
          {block.content.replace(/^###\s*/, '')}
        </h3>
      );
    case 'code':
      return (
        <div className="overflow-hidden rounded-lg">
          <pre className="bg-gray-50/80 backdrop-blur-sm p-4 overflow-x-auto border border-gray-200/50 text-sm font-mono text-gray-800 leading-relaxed">
            <code>{block.content}</code>
          </pre>
        </div>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-blue-400 pl-4 py-2 bg-blue-50/30 rounded-r-lg">
          <div className="text-gray-700 italic font-medium leading-relaxed">
            {block.content}
          </div>
        </blockquote>
      );
    case 'image':
      return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <Image size={32} className="mx-auto text-gray-400 mb-2" />
          <div className="text-gray-500 font-medium">
            {block.content || 'Click to add image'}
          </div>
        </div>
      );
    case 'checklist':
      return (
        <div className="space-y-1">
          {block.content.split('\n').map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded border border-gray-300 bg-white"></div>
              <div className="text-gray-800">{item}</div>
            </div>
          ))}
        </div>
      );
    case 'list':
      return (
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown>
            {block.content}
          </ReactMarkdown>
        </div>
      );
    default:
      return (
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown>
            {block.content}
          </ReactMarkdown>
        </div>
      );
  }
};
