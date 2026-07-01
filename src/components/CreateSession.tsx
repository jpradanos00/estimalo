import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card } from './ui/Card';

interface Props {
  onCreated: (code: string) => void;
}

export function CreateSession({ onCreated }: Props) {
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
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
        {t.create.title}
      </h2>
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
