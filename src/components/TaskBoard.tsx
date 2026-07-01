import { useState, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export function TaskBoard() {
  const { t } = useI18n();
  const { tasks, isAdmin, addTask, deleteTask, startVoting, session } = useSession();
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const canAdd = isAdmin && session?.status !== 'voting' && session?.status !== 'revealed';

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addTask(title.trim());
    setTitle('');
    inputRef.current?.focus();
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {t.lobby.tasks}
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {completedTasks.length}/{tasks.length} {t.lobby.completed}
        </span>
      </div>

      {canAdd && (
        <form
          onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
          className="flex gap-2 mb-4"
        >
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.lobby.addTaskPlaceholder}
            maxLength={200}
            className="flex-1 px-4 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 border-slate-300 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors text-sm min-h-[44px]"
          />
          <Button type="submit" size="md" disabled={!title.trim()}>
            {t.lobby.add}
          </Button>
        </form>
      )}

      {tasks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-30">📋</div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.lobby.noTasks}</p>
          {!canAdd && !isAdmin && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.lobby.waitingForAdmin}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {pendingTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                  {task.title}
                </p>
              </div>
              <Badge variant="warning">{t.lobby.pending}</Badge>
              {isAdmin && session?.status === 'lobby' && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startVoting(task.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-ring min-h-[36px]"
                  >
                    {t.lobby.startVoting}
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring"
                    aria-label={t.lobby.deleteTask}
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))}

          {completedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 transition-colors"
            >
              <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate line-through">
                  {task.title}
                </p>
              </div>
              <Badge variant="success">
                {task.final_estimate ? `${task.final_estimate}h` : t.lobby.completed}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {!isAdmin && session?.status === 'lobby' && tasks.length > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-dashed border-slate-200 dark:border-slate-600 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.lobby.waitingForAdmin}</p>
        </div>
      )}
    </Card>
  );
}
