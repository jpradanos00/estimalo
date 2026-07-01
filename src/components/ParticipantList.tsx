import { useState, memo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import type { Participant } from '../types';

interface ParticipantRowProps {
  participant: Participant;
  isMe: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  onToggleEdit: (id: string | null) => void;
  onWeightChange: (participantId: string, weight: number) => void;
  onRemove: (participantId: string) => void;
}

const WEIGHTS = [0.5, 1, 1.5, 2, 2.5, 3];

const ParticipantRow = memo(function ParticipantRow({
  participant,
  isMe,
  isAdmin,
  isEditing,
  onToggleEdit,
  onWeightChange,
  onRemove,
}: ParticipantRowProps) {
  const { t } = useI18n();
  const hasWeight = participant.weight !== 1;

  return (
    <li>
      <div className={`flex items-center gap-3 py-2.5 px-2 rounded-xl transition-colors ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          aria-hidden="true"
        >
          {participant.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-900 dark:text-white break-words">
              {participant.name}
            </span>
            {isMe && (
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-semibold uppercase leading-none flex-shrink-0">
                {t.common.you}
              </span>
            )}
            {participant.is_admin && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold uppercase flex-shrink-0">
                {t.common.admin}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {isAdmin && !isMe && (
            <button
              onClick={() => onToggleEdit(isEditing ? null : participant.id)}
              className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg transition-colors focus-ring ${hasWeight ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              ×{participant.weight.toFixed(1)}
            </button>
          )}

          {!isAdmin || isMe ? (
            <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${hasWeight ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
              ×{participant.weight.toFixed(1)}
            </span>
          ) : (
            <button
              onClick={() => onRemove(participant.id)}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring flex-shrink-0"
              aria-label={`${t.common.delete} ${participant.name}`}
            >
              <svg className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="px-2 pb-2 motion-safe:animate-fade-in">
          <div className="flex items-center gap-1.5 justify-center py-1.5">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => onWeightChange(participant.id, w)}
                className={`w-9 h-9 rounded-lg text-xs font-bold font-mono transition-colors focus-ring ${participant.weight === w ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
              >
                {w.toFixed(1)}
              </button>
            ))}
          </div>
        </div>
      )}
    </li>
  );
});

export function ParticipantList() {
  const { t } = useI18n();
  const { participants, myParticipant, isAdmin, updateWeight, removeParticipant } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleToggleEdit = useCallback((id: string | null) => {
    setEditingId(id);
  }, []);

  useEffect(() => {
    if (!editingId) return;
    const handler = (e: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(e.target as Node)) {
        setEditingId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [editingId]);

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        {t.lobby.participants} ({participants.length})
      </h3>
      <ul ref={listRef} className="space-y-0.5" role="list">
        {participants.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            isMe={p.id === myParticipant?.id}
            isAdmin={isAdmin}
            isEditing={editingId === p.id}
            onToggleEdit={handleToggleEdit}
            onWeightChange={updateWeight}
            onRemove={removeParticipant}
          />
        ))}
      </ul>
    </Card>
  );
}
