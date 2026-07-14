import { useState, memo, useCallback, useEffect, useRef } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import { LeaveButton } from './LeaveButton';
import type { Participant } from '../types';

interface ParticipantRowProps {
  participant: Participant;
  isMe: boolean;
  isAdmin: boolean;
  isEditing: boolean;
  onToggleEdit: (id: string | null) => void;
  onWeightChange: (participantId: string, weight: number) => void;
  onRemove: (participantId: string) => void;
  onTransferAdmin: (participantId: string) => void;
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
  onTransferAdmin,
}: ParticipantRowProps) {
  const { t } = useI18n();
  const hasWeight = participant.weight !== 1;

  return (
    <li>
      <div className={`flex items-start gap-3 py-2.5 px-2 rounded-xl transition-colors ${isMe ? 'bg-indigo-50/50 dark:bg-indigo-900/10 ring-1 ring-indigo-200 dark:ring-indigo-800' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
        <div
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          aria-hidden="true"
        >
          {participant.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0 flex-wrap">
            <span className="text-sm font-medium text-slate-900 dark:text-white break-words min-w-0">
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
          {isAdmin && !participant.is_admin && participant.user_id && (
            <button
              onClick={() => onTransferAdmin(participant.id)}
              className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors focus-ring flex-shrink-0"
              aria-label={`${t.lobby.transferAdmin} ${participant.name}`}
              title={t.lobby.transferAdmin}
            >
              <svg className="w-4 h-4 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
              </svg>
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => onToggleEdit(isEditing ? null : participant.id)}
              className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg transition-colors focus-ring min-h-[44px] flex items-center ${hasWeight ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              ×{participant.weight.toFixed(1)}
            </button>
          )}

          {isAdmin && !isMe ? (
            <button
              onClick={() => onRemove(participant.id)}
              className="w-11 h-11 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring flex-shrink-0"
              aria-label={`${t.common.delete} ${participant.name}`}
            >
              <svg className="w-3.5 h-3.5 text-slate-400 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          ) : !isAdmin ? (
            <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${hasWeight ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
              ×{participant.weight.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>

      {isEditing && (
        <div className="px-2 pb-2 motion-safe:animate-fade-in">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 py-1.5 max-w-xs mx-auto">
            {WEIGHTS.map((w) => (
              <button
                key={w}
                onClick={() => onWeightChange(participant.id, w)}
                className={`rounded-lg text-xs font-bold font-mono transition-colors focus-ring min-h-[40px] ${participant.weight === w ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
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
  const { participants, myParticipant, isAdmin, updateWeight, removeParticipant, transferAdmin } = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transferId, setTransferId] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const handleToggleEdit = useCallback((id: string | null) => {
    setEditingId(id);
  }, []);

  const handleTransferAdmin = useCallback((id: string) => {
    setTransferId(id);
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

  const confirmTransfer = useCallback(() => {
    if (transferId) {
      transferAdmin(transferId);
      setTransferId(null);
    }
  }, [transferId, transferAdmin]);

  const targetName = transferId ? participants.find((p) => p.id === transferId)?.name : '';

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
            onTransferAdmin={handleTransferAdmin}
          />
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
        <LeaveButton />
      </div>

      {transferId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setTransferId(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-xl motion-safe:animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <p className="text-slate-900 dark:text-white font-medium mb-4">
              {t.lobby.confirmTransferAdmin} <strong>{targetName}</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTransferId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={confirmTransfer}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors focus-ring min-h-[44px]"
              >
                {t.common.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
