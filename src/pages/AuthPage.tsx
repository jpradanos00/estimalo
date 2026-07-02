import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface Props {
  onBack: () => void;
}

export function AuthPage({ onBack }: Props) {
  const { t } = useI18n();
  const { signUp, signIn, signInWithGoogle } = useAuth();
  const isProduction = window.location.hostname === 'estimalo.pages.dev';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const emailValid = email.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailError = email.length > 0 && !emailValid ? 'Email no válido' : undefined;
  const passwordError = password.length > 0 && password.length < 6 ? 'Mínimo 6 caracteres' : undefined;

  useEffect(() => {
    setServerError(null);
  }, [mode, email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || password.length < 6) return;
    setLoading(true);
    setServerError(null);
    const result = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);
    setLoading(false);
    if (result.error) setServerError(result.error);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    if (result.error) setServerError(result.error);
    setGoogleLoading(false);
  };

  const canSubmit = emailValid && password.length >= 6 && !loading;

  return (
    <Card padding="lg" className="max-w-md w-full mx-auto motion-safe:animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring text-slate-500"
          aria-label="Volver"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}
        </h2>
      </div>

      <div className="space-y-4">
        {isProduction && (
          <>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              onClick={handleGoogle}
              loading={googleLoading}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t.auth.googleButton}
            </Button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              <span className="text-xs text-slate-400 dark:text-slate-500">{t.auth.orEmail}</span>
              <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            autoFocus
            autoComplete="email"
            error={emailError}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            error={passwordError}
          />
          {serverError && (
            <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl" role="alert">
              {serverError}
            </p>
          )}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            loading={loading}
            disabled={!canSubmit}
          >
            {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setServerError(null); }}
            className="text-sm text-indigo-500 dark:text-indigo-400 hover:underline focus-ring min-h-[44px] inline-flex items-center"
          >
            {mode === 'login'
              ? t.auth.noAccount
              : t.auth.hasAccount}
          </button>
        </div>
      </div>
    </Card>
  );
}
