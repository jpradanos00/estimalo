import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface Props {
  onJoined: () => void;
  onBack: () => void;
  prefillCode?: string;
}

export function JoinSession({ onJoined, onBack, prefillCode }: Props) {
  const { t } = useI18n();
  const { joinSession, error, loading } = useSession();
  const [name, setName] = useState('');
  const [code, setCode] = useState(prefillCode || '');
  const [joining, setJoining] = useState(false);

  const hasPrefilledCode = Boolean(prefillCode);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCode = hasPrefilledCode ? prefillCode! : code.trim();
    if (!name.trim() || finalCode.length < 3) return;
    setJoining(true);
    try {
      await joinSession(finalCode, name.trim());
      setJoining(false);
      onJoined();
    } catch {
      setJoining(false);
    }
  };

  const codeValid = hasPrefilledCode || code.trim().length >= 3;

  return (
    <Card padding="lg" className="max-w-md w-full mx-auto motion-safe:animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        {!hasPrefilledCode && (
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring text-slate-500"
            aria-label={t.common.back}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {hasPrefilledCode ? 'Unirse a la sala' : t.join.title}
        </h2>
      </div>

      {hasPrefilledCode && (
        <div className="mb-4 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 flex items-center gap-3">
          <span className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">
            {t.lobby.roomCode}
          </span>
          <span className="text-lg font-extrabold font-mono tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            {prefillCode}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={hasPrefilledCode ? '¿Cómo te llamas?' : t.join.yourName}
          placeholder={t.join.yourNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="name"
          maxLength={30}
        />
        {!hasPrefilledCode && (
          <Input
            label={t.join.sessionCode}
            placeholder={t.join.sessionCodePlaceholder}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={6}
            error={code.length > 0 && !codeValid ? t.join.invalidCode : undefined}
            style={{ textTransform: 'uppercase', letterSpacing: '0.15em' }}
          />
        )}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={joining}
          disabled={!name.trim() || !codeValid || loading}
        >
          {hasPrefilledCode ? 'Entrar' : t.join.join}
        </Button>
      </form>
    </Card>
  );
}
