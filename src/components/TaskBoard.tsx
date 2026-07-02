import { useState, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { StoryForm } from './StoryForm';
import { StoryAccordion } from './StoryAccordion';
import { TaskResultModal } from './TaskResultModal';
import type { Task } from '../types';

export function TaskBoard() {
  const { t } = useI18n();
  const {
    tasks,
    userStories,
    isAdmin,
    addTask,
    addUserStory,
    deleteTask,
    startVoting,
    session,
  } = useSession();
  const [addingStory, setAddingStory] = useState(false);
  const [addingOrphan, setAddingOrphan] = useState(false);
  const [resultTaskId, setResultTaskId] = useState<string | null>(null);
  const [resultTaskTitle, setResultTaskTitle] = useState<string>('');

  const orphanTasks = useMemo(() => tasks.filter((t) => !t.user_story_id), [tasks]);
  const pendingOrphans = useMemo(() => orphanTasks.filter((t) => t.status === 'pending'), [orphanTasks]);
  const completedOrphans = useMemo(() => orphanTasks.filter((t) => t.status === 'completed'), [orphanTasks]);

  const storiesWithTasks = useMemo(
    () => userStories.map((story) => ({
      story,
      tasks: tasks.filter((t) => t.user_story_id === story.id),
    })),
    [userStories, tasks]
  );

  const canAdd = isAdmin && session?.status !== 'voting' && session?.status !== 'revealed';
  const hasAnyTasks = tasks.length > 0 || userStories.length > 0;

  const handleAddOrphan = async (title: string) => {
    await addTask(title, null);
    setAddingOrphan(false);
  };

  const handleAddStory = async (title: string) => {
    await addUserStory(title);
    setAddingStory(false);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            {t.lobby.stories}
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {tasks.filter((t) => t.status === 'completed').length}/{tasks.length} {t.lobby.completed}
          </span>
        </div>

        {!hasAnyTasks ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3 opacity-30">📋</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.lobby.noTasks}</p>
            {canAdd && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.lobby.noTasksCTA}</p>
            )}
            {!canAdd && !isAdmin && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t.lobby.waitingForAdmin}</p>
            )}
          </div>
        ) : (
          <>
            {storiesWithTasks.map(({ story, tasks: storyTasks }) => (
              <div key={story.id} className="mb-2">
                <StoryAccordion story={story} tasks={storyTasks} onViewResult={(id, title) => { setResultTaskId(id); setResultTaskTitle(title); }} />
              </div>
            ))}

            {orphanTasks.length > 0 && (
              <div className="space-y-2 mt-4">
                {userStories.length > 0 && (
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
                    {t.lobby.orphanTasks}
                  </p>
                )}
                {[...pendingOrphans, ...completedOrphans].map((task: Task) => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-xl border transition-colors ${
                        isCompleted
                          ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
                          : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
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
                        {isCompleted ? (
                          <Badge variant="success">{t.lobby.completed}</Badge>
                        ) : (
                          <Badge variant="warning">{t.lobby.pending}</Badge>
                        )}
                        {isCompleted && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setResultTaskId(task.id); setResultTaskTitle(task.title); }}
                            className="text-[11px] font-medium text-indigo-500 dark:text-indigo-400 hover:underline focus-ring min-h-[44px] flex items-center"
                          >
                            {t.result.viewBreakdown}
                          </button>
                        )}
                        {!isCompleted && isAdmin && session?.status === 'lobby' && (
                          <div className="flex items-center gap-1 flex-shrink-0 w-full sm:w-auto sm:flex-shrink">
                            <button
                              onClick={() => startVoting(task.id)}
                              className="flex-1 sm:flex-none px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors focus-ring min-h-[44px]"
                            >
                              {t.lobby.startVoting}
                            </button>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="w-11 h-11 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring flex-shrink-0"
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
            )}
          </>
        )}

        {canAdd && (
          <div className="mt-4 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
            {addingOrphan && (
              <StoryForm
                onSubmit={handleAddOrphan}
                placeholder={t.lobby.addTaskPlaceholder}
                autoFocus
                onCancel={() => setAddingOrphan(false)}
                compact
              />
            )}
            {addingStory && (
              <StoryForm
                onSubmit={handleAddStory}
                placeholder="Título de la historia de usuario..."
                autoFocus
                onCancel={() => setAddingStory(false)}
              />
            )}
            <div className="flex gap-2">
              {!addingStory && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setAddingStory(true); setAddingOrphan(false); }}
                  className="flex-1"
                >
                  {t.lobby.newStory}
                </Button>
              )}
              {!addingOrphan && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => { setAddingOrphan(true); setAddingStory(false); }}
                  className="flex-1"
                >
                  {t.lobby.newTask}
                </Button>
              )}
            </div>
          </div>
        )}

        {!isAdmin && hasAnyTasks && session?.status === 'lobby' && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-dashed border-slate-200 dark:border-slate-600 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.lobby.waitingForAdmin}</p>
          </div>
        )}
      </Card>

      {resultTaskId && (
        <TaskResultModal
          taskId={resultTaskId}
          taskTitle={resultTaskTitle}
          open={true}
          onClose={() => { setResultTaskId(null); setResultTaskTitle(''); }}
        />
      )}
    </div>
  );
}
