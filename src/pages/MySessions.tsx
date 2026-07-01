import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
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

export function MySessions() {
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Mis sesiones
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {user.email}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle />
          <ThemeToggle />
          <button
            onClick={signOut}
            className="px-3 py-1.5 text-sm rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-ring"
          >
            Salir
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
            Aún no has creado ninguna sesión
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Crea una sala desde la página principal para empezar
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
                    <span>{taskCount} tareas</span>
                    <span>{completedCount} estimadas</span>
                    {lastEstimate && <span>Última: {lastEstimate}h</span>}
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
                  Abrir sala
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
