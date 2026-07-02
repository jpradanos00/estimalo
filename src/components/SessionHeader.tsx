import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';
import { LangToggle } from './ui/LangToggle';

export function SessionHeader() {
  const { t } = useI18n();
  const { session, deleteSession, isAdmin } = useSession();
  const { user, signOut } = useAuth();
  const { leaveSession } = useSession();
  const [showDelete, setShowDelete] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    if (!session) return;
    const base = window.location.origin;
    navigator.clipboard.writeText(`${base}?join=${session.code}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-sm font-extrabold text-white">E</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">
              Estímalo
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session && (
            <>
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors focus-ring"
                aria-label={t.lobby.copyLink}
              >
                <span className="tracking-widest">{session.code}</span>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              </button>
              {copied && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium motion-safe:animate-fade-in">
                  {t.lobby.copied}
                </span>
              )}
            </>
          )}

          <LangToggle />
          <ThemeToggle />

          {session && (
            <>
              {isAdmin && (
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring"
                  aria-label={t.common.delete}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              )}
              {user && (
                <button
                  onClick={() => setShowSignOut(true)}
                  className="flex items-center gap-1 ml-1 px-2 py-1.5 rounded-xl text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-ring"
                  aria-label={t.auth.signOut}
                  title={t.auth.signOut}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
                    <line x1="12" y1="2" x2="12" y2="12" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showSignOut && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSignOut(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-900 dark:text-white font-medium mb-4">
              {t.auth.confirmSignOut}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignOut(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => { setShowSignOut(false); leaveSession(); signOut(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus-ring min-h-[44px]"
              >
                {t.auth.signOut}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowDelete(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-900 dark:text-white font-medium mb-2">
              {t.lobby.deleteRoom}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t.lobby.deleteRoomDesc}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => { setShowDelete(false); deleteSession(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
