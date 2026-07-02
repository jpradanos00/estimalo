import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LangToggle } from '../components/ui/LangToggle';
import type { Session } from '../types';

interface SessionSummary {
  session: Session;
  taskCount: number;
  completedCount: number;
  lastEstimate: number | null;
}

interface Props {
  onBack: () => void;
}

export function MySessions({ onBack }: Props) {
  const { t } = useI18n();
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    supabase
      .from('sessions')
      .select('*')
      .eq('admin_id', user.id)
      .order('created_at', { ascending: false })
      .then(async ({ data: sessionList }) => {
        if (!sessionList) { setLoading(false); return; }

        const summaries = await Promise.all(
          sessionList.map(async (s: Session) => {
            const { data: tasks } = await supabase
              .from('tasks')
              .select('*')
              .eq('session_id', s.id);

            const taskList = tasks ?? [];
            const completed = taskList.filter((t) => t.status === 'completed');
            const lastEstimate = completed.length > 0
              ? completed[completed.length - 1].final_estimate
              : null;

            return {
              session: s,
              taskCount: taskList.length,
              completedCount: completed.length,
              lastEstimate,
            };
          })
        );

        setSessions(summaries);
        setLoading(false);
      });
  }, [user]);

  if (!user) return null;

  return (
    <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white truncate">
            {t.auth.mySessions}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
            {user.email}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-ring min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            {t.common.back}
          </button>
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={signOut}
            className="px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-ring min-h-[44px]"
          >
            {t.auth.signOut}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-4xl mb-3 opacity-30">📊</div>
          <p className="text-slate-500 dark:text-slate-400">
            {t.auth.noSessions}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            {t.auth.noSessionsHint}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map(({ session: s, taskCount, completedCount, lastEstimate }) => (
            <Card key={s.id} hover>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-widest">
                      {s.code}
                    </span>
                    {s.name && (
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {s.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 flex-wrap">
                    <span>{taskCount} {t.auth.tasksCount}</span>
                    <span>{completedCount} {t.auth.estimatedCount}</span>
                    {lastEstimate && <span>{t.auth.lastEstimate}: {lastEstimate}h</span>}
                    <span>{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}?join=${s.code}`;
                    navigator.clipboard.writeText(url).catch(() => {});
                    window.open(url, '_blank');
                  }}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors focus-ring flex-shrink-0 min-h-[44px] self-start sm:self-center"
                >
                  {t.auth.openRoom}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
