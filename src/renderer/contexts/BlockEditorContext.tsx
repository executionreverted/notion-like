import { useState, useRef, useEffect, createContext, useContext } from 'react';

// Context for managing editor state
export const BlockEditorContext = createContext(null);


export const BlockEditorProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'heading', content: 'Transform Your Writing Experience' },
    { id: '2', type: 'text', content: 'This is what professional editing feels like. Click on any block and watch the smooth auto-resize textareas that adapt naturally to your content. No more jarring fixed-height boxes or clunky interfaces - just pure, seamless editing bliss.' },
    { id: '3', type: 'quote', content: 'Great design is invisible - it gets out of your way and lets you focus on what matters: creating amazing content.' },
    { id: '4', type: 'list', content: '• Seamless auto-resize textareas that feel natural\n• Professional design with modern gradients\n• Smooth animations and micro-interactions\n• Intuitive keyboard shortcuts (try Escape, Ctrl+Enter)\n• Clean, accessible interface with perfect spacing\n• Slash commands for quick block creation' },
    { id: '5', type: 'code', content: 'const editor = new ProfessionalBlockEditor();\neditor.enableSeamlessEditing();\neditor.render(); // ✨ Pure magic\n\n// Try editing this code block!\n// Notice how it grows smoothly as you type\n// This is how editing should feel in 2024' },
  ]);

  const [title, setTitle] = useState('Professional Block Editor');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const updateBlock = (id, content) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, content } : block
    ));
  };

  const setEditingState = (id, isEditing) => {
    setBlocks(blocks.map(block =>
      block.id === id ? { ...block, isEditing } : { ...block, isEditing: false }
    ));
  };

  const deleteBlock = (id) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const addBlock = (afterId, type = 'text') => {
    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      isEditing: true,
    };

    if (afterId) {
      const index = blocks.findIndex(block => block.id === afterId);
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
    } else {
      setBlocks([...blocks, newBlock]);
    }
  };

  const moveBlock = (id, direction) => {
    const currentIndex = blocks.findIndex(block => block.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === blocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]];
    setBlocks(newBlocks);
  };

  const value: any = {
    blocks,
    title,
    isEditingTitle,
    updateBlock,
    deleteBlock,
    addBlock,
    moveBlock,
    setEditingState,
    setTitle,
    setIsEditingTitle,
  };

  return (
    <BlockEditorContext.Provider value={value}>
      {children}
    </BlockEditorContext.Provider>
  );
};


export const useBlockEditor = () => {
  const context = useContext(BlockEditorContext);
  if (!context) throw new Error('useBlockEditor must be used within BlockEditorProvider');
  return context;
};

// Auto-resize textarea hook for seamless editing
export const useAutoResize = (value, isEditing) => {
  const textareaRef = useRef(null);
  const hasSetInitialCursor = useRef(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isEditing) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(40, textarea.scrollHeight)}px`;
    };

    adjustHeight();
    textarea.focus();

    // Only set cursor to end when first entering edit mode
    if (!hasSetInitialCursor.current) {
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      hasSetInitialCursor.current = true;
    }

    const handleInput = () => adjustHeight();
    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('input', handleInput);
    };
  }, [value, isEditing]);

  // Reset the cursor flag when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      hasSetInitialCursor.current = false;
    }
  }, [isEditing]);

  return textareaRef;
};
