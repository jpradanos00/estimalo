import { useState, useRef, useEffect } from 'react';

interface Props {
  onSubmit: (title: string) => void;
  placeholder: string;
  initialValue?: string;
  autoFocus?: boolean;
  onCancel?: () => void;
  compact?: boolean;
}

export function StoryForm({ onSubmit, placeholder, initialValue = '', autoFocus, onCancel, compact }: Props) {
  const [title, setTitle] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit(title.trim());
    setTitle('');
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${compact ? 'py-1' : 'py-2'}`}>
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        maxLength={200}
        className="flex-1 px-3 py-2 rounded-xl border bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors min-h-[44px]"
      />
      <button
        type="submit"
        disabled={!title.trim()}
        className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-50 transition-colors focus-ring min-h-[44px] flex-shrink-0"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
        >
          ✕
        </button>
      )}
    </form>
  );
}
