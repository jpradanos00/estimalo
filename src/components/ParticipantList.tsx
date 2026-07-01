import { useState } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import { Slider } from './ui/Slider';

export function ParticipantList() {
  const { t } = useI18n();
  const { participants, myParticipant, isAdmin, updateWeight } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        {t.lobby.participants} ({participants.length})
      </h3>
      <div className="space-y-2">
        {participants.map((p) => {
          const isMe = p.id === myParticipant?.id;
          const isEditing = editingId === p.id;
          const weightText = p.weight === 1 ? t.lobby.defaultWeight : `×${p.weight}`;

          return (
            <div key={p.id}>
              <div className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {p.name}
                    </span>
                    {isMe && (
                      <span className="text-xs text-indigo-500 dark:text-indigo-400 font-medium">
                        ({t.common.you})
                      </span>
                    )}
                    {p.is_admin && (
                      <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-medium">
                        {t.common.admin}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && !isMe ? (
                    <button
                      onClick={() => setEditingId(isEditing ? null : p.id)}
                      className={`text-sm font-mono font-semibold px-2.5 py-1 rounded-lg transition-colors focus-ring ${
                        p.weight !== 1
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                      aria-label={`${t.lobby.weight}: ${weightText}`}
                    >
                      {weightText}
                    </button>
                  ) : (
                    <span
                      className={`text-sm font-mono font-semibold px-2.5 py-1 rounded-lg ${
                        p.weight !== 1
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {weightText}
                    </span>
                  )}
                </div>
              </div>
              {isEditing && (
                <div className="motion-safe:animate-fade-in pl-12 pr-2 pb-2">
                  <Slider
                    value={p.weight}
                    min={0.5}
                    max={3}
                    step={0.5}
                    onChange={(val) => {
                      updateWeight(p.id, val);
                    }}
                    formatValue={(v) => `×${v.toFixed(1)}`}
                  />
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    {t.weight.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
