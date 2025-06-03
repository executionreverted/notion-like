import { useState } from "react";
import { useBlockEditor } from "../contexts/BlockEditorContext";
import { BlockTypeSelector } from "./BlockTypeSelector";
import { Plus } from "lucide-react";

export const AddBlockButton = () => {
  const { addBlock } = useBlockEditor();
  const [showTypeSelector, setShowTypeSelector] = useState(false);

  return (
    <div className="relative mt-10">
      <button
        onClick={() => setShowTypeSelector(!showTypeSelector)}
        className="flex items-center gap-4 text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition-all duration-200 py-6 px-8 rounded-2xl w-full justify-center border-2 border-dashed border-gray-200 hover:border-violet-300 group"
      >
        <div className="p-3 rounded-xl bg-gray-100 group-hover:bg-violet-100 transition-colors shadow-sm">
          <Plus size={20} className="text-gray-500 group-hover:text-violet-600" />
        </div>
        <span className="font-bold text-lg">Add a block</span>
        <div className="text-sm text-gray-400 bg-gray-100 px-3 py-2 rounded-lg group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors font-mono">
          /
        </div>
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
