import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';

interface Props {
  variant?: 'full' | 'compact';
}

export function LeaveButton({ variant = 'full' }: Props) {
  const { t } = useI18n();
  const { leaveSession } = useSession();
  const [showConfirm, setShowConfirm] = useState(false);

  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          {t.lobby.leave}
        </button>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowConfirm(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
              <p className="text-slate-900 dark:text-white font-medium mb-4">
                {t.lobby.confirmLeave}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
                >
                  {t.common.cancel}
                </button>
                <button
                  onClick={() => { setShowConfirm(false); leaveSession(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus-ring min-h-[44px]"
                >
                  {t.lobby.leave}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-colors focus-ring min-h-[44px]"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        {t.lobby.leave}
      </button>
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-900 dark:text-white font-medium mb-4">
              {t.lobby.confirmLeave}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => { setShowConfirm(false); leaveSession(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus-ring min-h-[44px]"
              >
                {t.lobby.leave}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
