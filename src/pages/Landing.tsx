import { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { CreateSession } from '../components/CreateSession';
import { JoinSession } from '../components/JoinSession';
import { AuthPage } from './AuthPage';
import { MySessions } from './MySessions';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { LangToggle } from '../components/ui/LangToggle';

type LandingScreen = 'main' | 'create' | 'join' | 'auth' | 'mysessions';

export function Landing() {
  const { t } = useI18n();
  const { session, joinSession } = useSession();
  const { user, signOut } = useAuth();
  const [screen, setScreen] = useState<LandingScreen>('main');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [urlJoinCode, setUrlJoinCode] = useState<string | null>(null);
  const [autoJoining, setAutoJoining] = useState(false);
  const [showSignOut, setShowSignOut] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get('join');
    if (joinCode && joinCode.trim()) {
      setUrlJoinCode(joinCode.trim().toUpperCase());
      setScreen('join');
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      if (!urlJoinCode || !user || autoJoining || session) return;
      setAutoJoining(true);
      try {
        const { data: s } = await supabase
          .from('sessions')
          .select('*')
          .eq('code', urlJoinCode)
          .maybeSingle();
        if (s?.admin_id === user.id) {
          await joinSession(urlJoinCode, '');
        }
      } catch {}
      setAutoJoining(false);
    };
    check();
  }, [urlJoinCode, user, session, joinSession, autoJoining]);

  useEffect(() => {
    if (screen === 'auth' && user) {
      setScreen('main');
    }
  }, [user, screen]);

  if (session) return null;

  const navigate = (s: LandingScreen) => {
    setScreen(s);
    const hash = s === 'main' ? '' : `#${s}`;
    window.history.pushState({ screen: s }, '', hash ? hash : window.location.pathname);
  };

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash.replace('#', '') as LandingScreen;
      if (hash && ['create', 'join', 'auth', 'mysessions'].includes(hash)) {
        setScreen(hash);
      } else {
        setScreen('main');
      }
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const goToCreate = () => {
    if (!user) {
      navigate('auth');
      return;
    }
    navigate('create');
  };

  const goToMySessions = () => {
    if (!user) {
      navigate('auth');
      return;
    }
    navigate('mysessions');
  };

  if (screen === 'mysessions') {
    return <MySessions onBack={() => navigate('main')} />;
  }

  if (screen === 'auth') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <AuthPage onBack={() => setScreen('main')} />
        </div>
      </div>
    );
  }

  if (screen === 'create') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {createdCode ? (
            <div className="text-center motion-safe:animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
                {t.create.created}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                {t.create.share}
              </p>
              <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl p-6 mb-6">
                <p className="text-4xl font-extrabold font-mono tracking-[0.3em] text-indigo-600 dark:text-indigo-400">
                  {createdCode}
                </p>
              </div>
              <button
                onClick={() => {
                  const base = window.location.origin;
                  navigator.clipboard.writeText(`${base}?join=${createdCode}`).catch(() => {});
                }}
                className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 transition-colors focus-ring min-h-[44px]"
              >
                {t.create.copyInvite}
              </button>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-4">
                {t.create.ready}
              </p>
            </div>
          ) : (
            <CreateSession onCreated={(code) => setCreatedCode(code)} onBack={() => navigate('main')} />
          )}
        </div>
      </div>
    );
  }

  if (screen === 'join') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <JoinSession
            onJoined={() => {}}
            onBack={() => navigate('main')}
            prefillCode={urlJoinCode || undefined}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {user && (
        <div className="w-full bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
          <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {user.email}
            </span>
            <button
              onClick={() => setShowSignOut(true)}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors focus-ring px-2 py-1 rounded-lg"
            >
              {t.auth.signOut}
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md text-center motion-safe:animate-fade-in">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/25">
            <span className="text-3xl font-extrabold text-white">E</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-1">
            Estímalo
          </h1>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 tracking-wide">
            {t.app.subtitle}
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            {t.app.tagline}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <button
            onClick={goToCreate}
            className="w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-2xl hover:bg-indigo-500 active:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 focus-ring text-lg min-h-[56px]"
          >
            {t.landing.createSession}
          </button>
          <button
            onClick={() => navigate('join')}
            className="w-full px-6 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 focus-ring text-lg min-h-[56px]"
          >
            {t.landing.joinSession}
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {user ? (
            <button
              onClick={goToMySessions}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus-ring min-h-[44px]"
            >
              {t.auth.mySessions}
            </button>
          ) : (
            <button
              onClick={() => navigate('auth')}
              className="px-4 py-2 rounded-xl text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors focus-ring min-h-[44px]"
            >
              {t.auth.login}
            </button>
          )}
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-4">
            {t.landing.howItWorks}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { step: '1', text: t.landing.step1 },
              { step: '2', text: t.landing.step2 },
              { step: '3', text: t.landing.step3 },
              { step: '4', text: t.landing.step4 },
            ].map(({ step, text }) => (
              <div
                key={step}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-left"
              >
                <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {step}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          <LangToggle />
          <ThemeToggle />
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-col items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <p className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              {t.landing.freeHosting}
            </p>
            <p>{t.landing.noAds}</p>
          </div>
        </div>
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
                onClick={() => { setShowSignOut(false); signOut(); }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-500 transition-colors focus-ring min-h-[44px]"
              >
                {t.auth.signOut}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
