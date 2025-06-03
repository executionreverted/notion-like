// Enhanced BlockEditorContext.tsx
import { useState, useRef, useEffect, createContext, useContext, useCallback } from 'react';

// Context for managing editor state
export const BlockEditorContext = createContext(null);

export const BlockEditorProvider = ({ children }) => {
  const [blocks, setBlocks] = useState([
    { id: '1', type: 'heading', content: 'Welcome to Your Enhanced Editor' },
    {
      id: '2',
      type: 'text',
      content: 'Experience the next level of block-based editing with smooth animations, enhanced keyboard shortcuts, and professional design. This editor adapts to your workflow with intelligent auto-resize, smart formatting, and seamless interactions.'
    },
    {
      id: '3',
      type: 'quote',
      content: 'Great design is not just what it looks like and feels like. Design is how it works.'
    },
    {
      id: '4',
      type: 'list',
      content: '• Intelligent auto-resize textareas\n• Enhanced keyboard navigation (↑↓ to move blocks)\n• Smart markdown shortcuts (type # for headings)\n• Professional animations and micro-interactions\n• Auto-save functionality\n• Improved accessibility support\n• Enhanced drag & drop with visual feedback'
    },
    {
      id: '5',
      type: 'code',
      content: '// Enhanced editor features\nconst editor = new ProfessionalBlockEditor({\n  animations: true,\n  shortcuts: true,\n  autoSave: true,\n  accessibility: true\n});\n\n// Try these shortcuts:\n// ⌘ + ↑/↓ - Move blocks\n// / - Open block selector\n// ⌘ + Enter - Exit editing\n// Escape - Cancel editing\n\neditor.render(); // ✨ Pure editing bliss'
    },
  ]);

  const [title, setTitle] = useState('Professional Block Editor');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [lastSaved, setLastSaved] = useState(new Date());
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const autoSaveTimeoutRef = useRef(null);

  // Auto-save functionality
  const saveToStorage = useCallback(() => {
    const editorState = {
      blocks,
      title,
      lastSaved: new Date().toISOString()
    };
    // In a real app, this would save to backend/localStorage
    console.log('Auto-saved:', editorState);
    setLastSaved(new Date());
  }, [blocks, title]);

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveToStorage();
    }, 2000); // Save after 2 seconds of inactivity

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [blocks, title, saveToStorage]);

  // Enhanced undo/redo system
  const saveToUndoStack = useCallback(() => {
    setUndoStack(prev => [...prev.slice(-19), { blocks, title }]); // Keep last 20 states
    setRedoStack([]); // Clear redo stack on new action
  }, [blocks, title]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;

    const previousState = undoStack[undoStack.length - 1];
    setRedoStack(prev => [...prev, { blocks, title }]);
    setUndoStack(prev => prev.slice(0, -1));
    setBlocks(previousState.blocks);
    setTitle(previousState.title);
  }, [undoStack, blocks, title]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;

    const nextState = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, { blocks, title }]);
    setRedoStack(prev => prev.slice(0, -1));
    setBlocks(nextState.blocks);
    setTitle(nextState.title);
  }, [redoStack, blocks, title]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Global shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveToStorage();
      }

      // Quick block creation
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        // This would trigger the block selector
        console.log('Open block selector');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, saveToStorage]);

  const updateBlock = useCallback((id, content) => {
    setBlocks(blocks => blocks.map(block =>
      block.id === id ? { ...block, content } : block
    ));
  }, []);

  const setEditingState = useCallback((id, isEditing) => {
    setBlocks(blocks => blocks.map(block =>
      block.id === id ? { ...block, isEditing } : { ...block, isEditing: false }
    ));
  }, []);

  const deleteBlock = useCallback((id) => {
    if (blocks.length > 1) {
      saveToUndoStack();
      setBlocks(blocks => blocks.filter(block => block.id !== id));
    }
  }, [blocks.length, saveToUndoStack]);

  const addBlock = useCallback((afterId, type = 'text') => {
    saveToUndoStack();

    const newBlock = {
      id: Date.now().toString(),
      type,
      content: '',
      isEditing: true,
    };

    if (afterId) {
      setBlocks(blocks => {
        const index = blocks.findIndex(block => block.id === afterId);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      });
    } else {
      setBlocks(blocks => [...blocks, newBlock]);
    }
  }, [saveToUndoStack]);

  const moveBlock = useCallback((id, direction) => {
    setBlocks(blocks => {
      const currentIndex = blocks.findIndex(block => block.id === id);
      if (
        (direction === 'up' && currentIndex === 0) ||
        (direction === 'down' && currentIndex === blocks.length - 1)
      ) {
        return blocks;
      }

      const newBlocks = [...blocks];
      const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      [newBlocks[currentIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[currentIndex]];
      return newBlocks;
    });
  }, []);

  const moveBlockToPosition = useCallback((blockId, newIndex) => {
    setBlocks(blocks => {
      const currentIndex = blocks.findIndex(block => block.id === blockId);
      if (currentIndex === -1) return blocks;

      // Ensure newIndex is within bounds
      const clampedIndex = Math.max(0, Math.min(newIndex, blocks.length - 1));

      // Don't move if already in the right position
      if (currentIndex === clampedIndex) return blocks;

      const newBlocks = [...blocks];
      const [movedBlock] = newBlocks.splice(currentIndex, 1);

      // Insert at the correct position
      newBlocks.splice(clampedIndex, 0, movedBlock);

      return newBlocks;
    });
  }, []);

  // Enhanced block type conversion
  const convertBlockType = useCallback((id, newType) => {
    saveToUndoStack();
    setBlocks(blocks => blocks.map(block =>
      block.id === id ? { ...block, type: newType } : block
    ));
  }, [saveToUndoStack]);

  // Duplicate block
  const duplicateBlock = useCallback((id) => {
    saveToUndoStack();
    setBlocks(blocks => {
      const index = blocks.findIndex(block => block.id === id);
      const originalBlock = blocks[index];
      const duplicatedBlock = {
        ...originalBlock,
        id: Date.now().toString(),
        content: originalBlock.content,
      };

      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, duplicatedBlock);
      return newBlocks;
    });
  }, [saveToUndoStack]);

  // Smart paste handling
  const handleSmartPaste = useCallback((id, pastedContent) => {
    // Auto-detect content type and suggest block type
    let suggestedType = 'text';

    if (pastedContent.startsWith('http') && pastedContent.includes('://')) {
      // URL detected
      if (pastedContent.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) {
        suggestedType = 'image';
      }
    } else if (pastedContent.startsWith('#')) {
      suggestedType = 'heading';
    } else if (pastedContent.startsWith('```') || pastedContent.includes('\n') && pastedContent.includes('  ')) {
      suggestedType = 'code';
    } else if (pastedContent.startsWith('>') || pastedContent.startsWith('"')) {
      suggestedType = 'quote';
    } else if (pastedContent.includes('\n-') || pastedContent.includes('\n*') || pastedContent.includes('\n•')) {
      suggestedType = 'list';
    }

    if (suggestedType !== 'text') {
      convertBlockType(id, suggestedType);
    }

    updateBlock(id, pastedContent);
  }, [convertBlockType, updateBlock]);

  const value: any = {
    blocks,
    title,
    isEditingTitle,
    lastSaved,
    undoStack,
    redoStack,
    updateBlock,
    deleteBlock,
    addBlock,
    moveBlock,
    moveBlockToPosition,
    setEditingState,
    setTitle,
    setIsEditingTitle,
    convertBlockType,
    duplicateBlock,
    handleSmartPaste,
    undo,
    redo,
    saveToStorage,
    canUndo: undoStack.length > 0,
    canRedo: redoStack.length > 0,
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

// Enhanced auto-resize textarea hook
export const useAutoResize = (value, isEditing) => {
  const textareaRef = useRef(null);
  const hasSetInitialCursor = useRef(false);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !isEditing) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(60, textarea.scrollHeight)}px`;
    };

    // Initial setup
    adjustHeight();
    textarea.focus();

    // Enhanced cursor positioning
    if (!hasSetInitialCursor.current) {
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      hasSetInitialCursor.current = true;
    }

    const handleInput = () => {
      adjustHeight();
    };

    const handlePaste = (e) => {
      // Allow default paste, then adjust height
      setTimeout(() => {
        adjustHeight();
      }, 0);
    };

    textarea.addEventListener('input', handleInput);
    textarea.addEventListener('paste', handlePaste);

    return () => {
      textarea.removeEventListener('input', handleInput);
      textarea.removeEventListener('paste', handlePaste);
    };
  }, [value, isEditing]);

  // Reset cursor flag when exiting edit mode
  useEffect(() => {
    if (!isEditing) {
      hasSetInitialCursor.current = false;
    }
  }, [isEditing]);

  return textareaRef;
};

// Custom hook for keyboard shortcuts
export const useKeyboardShortcuts = (blockId, blockType) => {
  const { convertBlockType } = useBlockEditor();

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Block-specific shortcuts when editing
      if (e.target.tagName === 'TEXTAREA') {
        // Quick formatting shortcuts
        if ((e.metaKey || e.ctrlKey) && e.key === '1') {
          e.preventDefault();
          convertBlockType(blockId, 'heading');
        }
        if ((e.metaKey || e.ctrlKey) && e.key === '2') {
          e.preventDefault();
          convertBlockType(blockId, 'heading2');
        }
        if ((e.metaKey || e.ctrlKey) && e.key === '3') {
          e.preventDefault();
          convertBlockType(blockId, 'heading3');
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'C') {
          e.preventDefault();
          convertBlockType(blockId, 'code');
        }
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'Q') {
          e.preventDefault();
          convertBlockType(blockId, 'quote');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [blockId, convertBlockType]);
};
