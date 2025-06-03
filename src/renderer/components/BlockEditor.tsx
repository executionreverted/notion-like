import { BlockEditorContext, BlockEditorProvider } from '../contexts/BlockEditorContext';
import { EditorHeader } from './EditorHeader';
import { AddBlockButton } from './AddBlockButton';
import { Block } from './Block';


export default function BlockEditor() {
  return (
    <BlockEditorProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-violet-50">
        <EditorHeader />

        <div className="max-w-5xl mx-auto px-8 py-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-10">
              <BlockEditorContext.Consumer>
                {(context) => context && (
                  <div className="space-y-8">
                    {context.blocks.map((block, index) => (
                      <Block
                        key={block.id}
                        block={block}
                        index={index}
                        onMoveUp={() => context.moveBlock(block.id, 'up')}
                        onMoveDown={() => context.moveBlock(block.id, 'down')}
                        canMoveUp={index > 0}
                        canMoveDown={index < context.blocks.length - 1}
                      />
                    ))}
                  </div>
                )}
              </BlockEditorContext.Consumer>

              <AddBlockButton />
            </div>
          </div>
        </div>
      </div>
    </BlockEditorProvider>
  );
}
