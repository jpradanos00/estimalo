import { useState, memo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Badge } from './ui/Badge';
import { StoryForm } from './StoryForm';
import type { UserStory, Task } from '../types';

interface Props {
  story: UserStory;
  tasks: Task[];
  defaultExpanded?: boolean;
  onViewResult?: (taskId: string, taskTitle: string) => void;
}

export const StoryAccordion = memo(function StoryAccordion({ story, tasks, defaultExpanded = false, onViewResult }: Props) {
  const { t } = useI18n();
  const { isAdmin, addTask, deleteTask, startVoting, session } = useSession();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [adding, setAdding] = useState(false);

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const canAdd = isAdmin && session?.status === 'lobby';

  const handleAddTask = async (title: string) => {
    await addTask(title, story.id);
    setAdding(false);
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-3.5 text-left bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
        aria-expanded={expanded}
      >
        <svg
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-words">
            {story.title}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {completedTasks.length}/{tasks.length}
          </span>
          {tasks.length > 0 && completedTasks.length === tasks.length ? (
            <Badge variant="success">{t.lobby.completed}</Badge>
          ) : (
            <Badge variant="warning">{t.lobby.pending}</Badge>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-200 dark:border-slate-700 motion-safe:animate-fade-in">
          {tasks.length === 0 && !canAdd && (
            <p className="p-4 text-xs text-slate-400 dark:text-slate-500 text-center">
              {t.lobby.noTasksInStory}
            </p>
          )}

          <div className="border-t border-slate-100 dark:border-slate-700/50">
            {tasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div
                  key={task.id}
                  className={`p-3 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-50/30 dark:bg-emerald-900/5'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    {isCompleted ? (
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <div className="w-4 h-4 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${isCompleted ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                        {task.title}
                      </p>
                    </div>
                    {task.final_estimate && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        {task.final_estimate}h
                      </span>
                    )}
                    {isCompleted && onViewResult && (
                      <button
                        onClick={() => onViewResult(task.id, task.title)}
                        className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 hover:underline focus-ring flex-shrink-0"
                      >
                        {t.result.viewBreakdown}
                      </button>
                    )}
                    {!isCompleted && isAdmin && session?.status === 'lobby' && (
                      <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => startVoting(task.id)}
                          className="flex-1 sm:flex-none px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-ring min-h-[36px]"
                        >
                          {t.lobby.startVoting}
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring flex-shrink-0"
                          aria-label={t.lobby.deleteTask}
                        >
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {adding && (
            <div className="px-4 py-2">
              <StoryForm
                onSubmit={handleAddTask}
                placeholder={t.lobby.addTaskPlaceholder}
                autoFocus
                onCancel={() => setAdding(false)}
                compact
              />
            </div>
          )}

          {canAdd && !adding && (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus-ring"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {t.lobby.addTask}
            </button>
          )}
        </div>
      )}
    </div>
  );
});
