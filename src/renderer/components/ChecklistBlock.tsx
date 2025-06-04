// ChecklistBlock.tsx - Interactive todo list with JSON storage
import { useState, useCallback, useRef, useEffect } from 'react';
import { useBlockEditor } from '../contexts/BlockEditorContext';
import { Plus, X, Edit3, Check, GripVertical } from 'lucide-react';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

interface ChecklistData {
  todos: Todo[];
}

interface ChecklistBlockProps {
  block: any;
  isFocused: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const generateTodoId = () => `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const ChecklistBlock = ({ block, isFocused, onFocus, onBlur }: ChecklistBlockProps) => {
  const { updateBlock } = useBlockEditor();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Parse block data - handle both old format and new JSON format
  const getChecklistData = useCallback((): ChecklistData => {
    if (!block.content) {
      return { todos: [] };
    }

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(block.content);
      if (parsed.todos && Array.isArray(parsed.todos)) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, try to parse old text format
      if (typeof block.content === 'string') {
        const lines = block.content.split('\n').filter(line => line.trim());
        const todos = lines.map((line, index) => {
          const isCompleted = line.startsWith('☑') || line.includes('[x]');
          const text = line.replace(/^[☐☑]\s*/, '').replace(/^\[[ x]\]\s*/, '').trim();
          return {
            id: `migrated_${index}`,
            text,
            completed: isCompleted
          };
        });
        return { todos };
      }
    }

    return { todos: [] };
  }, [block.content]);

  const [checklistData, setChecklistData] = useState<ChecklistData>(getChecklistData);

  // Update block content when checklist data changes
  const updateChecklistData = useCallback((newData: ChecklistData) => {
    setChecklistData(newData);
    updateBlock(block.id, JSON.stringify(newData));
  }, [block.id, updateBlock]);

  // Re-parse data when block content changes externally
  useEffect(() => {
    const newData = getChecklistData();
    if (JSON.stringify(newData) !== JSON.stringify(checklistData)) {
      setChecklistData(newData);
    }
  }, [block.content, getChecklistData]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  const addTodo = useCallback(() => {
    const newTodo: Todo = {
      id: generateTodoId(),
      text: '',
      completed: false
    };

    const newData = {
      ...checklistData,
      todos: [...checklistData.todos, newTodo]
    };

    updateChecklistData(newData);
    setEditingId(newTodo.id);
    setEditText('');
    onFocus();
  }, [checklistData, updateChecklistData, onFocus]);

  const toggleTodo = useCallback((todoId: string) => {
    const newData = {
      ...checklistData,
      todos: checklistData.todos.map(todo =>
        todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
      )
    };
    updateChecklistData(newData);
  }, [checklistData, updateChecklistData]);

  const startEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    onFocus();
  }, [onFocus]);

  const saveEdit = useCallback(() => {
    if (!editingId) return;

    const trimmedText = editText.trim();

    if (trimmedText) {
      const newData = {
        ...checklistData,
        todos: checklistData.todos.map(todo =>
          todo.id === editingId ? { ...todo, text: trimmedText } : todo
        )
      };
      updateChecklistData(newData);
    } else {
      // Delete if empty
      deleteTodo(editingId);
    }

    setEditingId(null);
    setEditText('');
  }, [editingId, editText, checklistData, updateChecklistData]);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
    onBlur();
  }, [onBlur]);

  const deleteTodo = useCallback((todoId: string) => {
    const newData = {
      ...checklistData,
      todos: checklistData.todos.filter(todo => todo.id !== todoId)
    };
    updateChecklistData(newData);

    if (editingId === todoId) {
      setEditingId(null);
      setEditText('');
    }
  }, [checklistData, updateChecklistData, editingId]);

  const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  }, [saveEdit, cancelEdit]);

  const handleEditBlur = useCallback(() => {
    // Small delay to allow clicking save button
    setTimeout(() => {
      if (editingId) {
        saveEdit();
      }
    }, 150);
  }, [editingId, saveEdit]);

  const moveTodo = useCallback((todoId: string, direction: 'up' | 'down') => {
    const currentIndex = checklistData.todos.findIndex(todo => todo.id === todoId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= checklistData.todos.length) return;

    const newTodos = [...checklistData.todos];
    [newTodos[currentIndex], newTodos[newIndex]] = [newTodos[newIndex], newTodos[currentIndex]];

    updateChecklistData({ todos: newTodos });
  }, [checklistData, updateChecklistData]);

  const completedCount = checklistData.todos.filter(todo => todo.completed).length;
  const totalCount = checklistData.todos.length;

  return (
    <div className="space-y-4">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-xl">
            <Check size={16} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">
              Todo List
            </div>
            {totalCount > 0 && (
              <div className="text-sm text-slate-500">
                {completedCount} of {totalCount} completed
              </div>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="flex items-center gap-3">
            <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-slate-600 min-w-[3rem]">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Todo items */}
      <div className="space-y-2">
        {checklistData.todos.map((todo, index) => (
          <div
            key={todo.id}
            className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50/80 transition-all duration-200"
            onMouseEnter={() => setHoveredId(todo.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Drag handle */}
            <button
              className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical size={14} />
            </button>

            {/* Checkbox */}
            <button
              onClick={() => toggleTodo(todo.id)}
              className={`flex-shrink-0 w-5 h-5 rounded-lg border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm hover:scale-105 ${todo.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-slate-300 bg-white hover:border-emerald-400'
                }`}
            >
              {todo.completed && (
                <Check size={12} className="text-white" />
              )}
            </button>

            {/* Todo text / edit input */}
            <div className="flex-1 min-w-0">
              {editingId === todo.id ? (
                <input
                  ref={editInputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={handleEditBlur}
                  className="w-full px-2 py-1 text-lg font-medium text-slate-800 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                  placeholder="Enter todo text..."
                />
              ) : (
                <div
                  onClick={() => startEdit(todo)}
                  className={`text-lg font-medium cursor-text px-2 py-1 rounded transition-all ${todo.completed
                    ? 'text-slate-500 line-through'
                    : 'text-slate-800 hover:bg-white hover:shadow-sm'
                    }`}
                >
                  {todo.text || 'Click to edit...'}
                </div>
              )}
            </div>

            {/* Controls */}
            <div className={`flex items-center gap-1 transition-all duration-200 ${hoveredId === todo.id || editingId === todo.id ? 'opacity-100' : 'opacity-0'
              }`}>
              {editingId === todo.id ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="w-7 h-7 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center"
                    title="Save"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center"
                    title="Cancel"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(todo)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center"
                    title="Edit"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center"
                    title="Delete"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add todo button */}
      <button
        onClick={addTodo}
        className="flex items-center gap-3 w-full p-3 text-slate-500 hover:text-emerald-600 transition-all duration-200 rounded-xl border-2 border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 group"
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-100 transition-colors">
          <Plus size={16} className="group-hover:text-emerald-600" />
        </div>
        <span className="font-medium">Add todo item</span>
      </button>

      {/* Empty state */}
      {checklistData.todos.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-2xl flex items-center justify-center">
            <Check size={32} className="text-slate-400" />
          </div>
          <p className="font-medium mb-2">No todos yet</p>
          <p className="text-sm">Click "Add todo item" to get started</p>
        </div>
      )}
    </div>
  );
};
