import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface Props {
  onCreated: (code: string) => void;
  onBack: () => void;
}

export function CreateSession({ onCreated, onBack }: Props) {
  const { t } = useI18n();
  const { createSession, error, loading } = useSession();
  const [name, setName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    const code = await createSession(name.trim(), sessionName.trim() || undefined);
    setCreating(false);
    if (code) onCreated(code);
  };

  return (
    <Card padding="lg" className="max-w-md w-full mx-auto motion-safe:animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring text-slate-500"
          aria-label={t.common.back}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t.create.title}
        </h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.create.yourName}
          placeholder={t.create.yourNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          autoComplete="name"
          maxLength={30}
        />
        <Input
          label={t.create.sessionName}
          placeholder={t.create.sessionNamePlaceholder}
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          maxLength={50}
        />
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          loading={creating}
          disabled={!name.trim() || loading}
        >
          {t.create.create}
        </Button>
      </form>
    </Card>
  );
}
