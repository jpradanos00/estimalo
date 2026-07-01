import { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { Card } from './ui/Card';
import { Slider } from './ui/Slider';
import type { Participant } from '../types';

interface ParticipantRowProps {
  participant: Participant;
  isMe: boolean;
  isAdmin: boolean;
  isOpen: boolean;
  onTogglePopover: (id: string | null) => void;
  onWeightChange: (participantId: string, weight: number) => void;
  onRemove: (participantId: string) => void;
  emptyWeight: string;
  t: Record<string, any>;
}

const ParticipantRow = memo(function ParticipantRow({
  participant,
  isMe,
  isAdmin,
  isOpen,
  onTogglePopover,
  onWeightChange,
  onRemove,
  emptyWeight,
  t,
}: ParticipantRowProps) {
  const hasWeight = participant.weight !== 1;
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onTogglePopover(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onTogglePopover]);

  return (
    <li className="relative">
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
              <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.5 rounded-full font-semibold uppercase leading-none">
                {t.common.you}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {participant.is_admin && (
              <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded font-semibold uppercase">
                {t.common.admin}
              </span>
            )}
            {hasWeight && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-semibold uppercase">
                ×{participant.weight}
              </span>
            )}
          </div>
        </div>

        {isAdmin && !isMe ? (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => onTogglePopover(isOpen ? null : participant.id)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus-ring"
              aria-label={`${t.lobby.weight}: ×${participant.weight}`}
              aria-expanded={isOpen}
            >
              <svg className="w-4 h-4 text-slate-400 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <button
              onClick={() => onRemove(participant.id)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-ring"
              aria-label={`${t.common.delete} ${participant.name}`}
            >
              <svg className="w-4 h-4 text-slate-400 hover:text-red-500 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <span
            className={`flex-shrink-0 text-xs font-mono font-semibold px-2 py-1 rounded-lg ${
              hasWeight
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-slate-300 dark:text-slate-600'
            }`}
            aria-label={`${t.lobby.weight}: ×${participant.weight}`}
          >
            {hasWeight ? `×${participant.weight}` : emptyWeight}
          </span>
        )}
      </div>

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full z-20 mt-1 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 motion-safe:animate-fade-in"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {participant.name}
            </span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              ×{participant.weight.toFixed(1)}
            </span>
          </div>
          <Slider
            value={participant.weight}
            min={0.5}
            max={3}
            step={0.5}
            onChange={(val) => onWeightChange(participant.id, val)}
            formatValue={(v) => `×${v.toFixed(1)}`}
            showValue={false}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            {t.weight.description}
          </p>
          <div className="flex justify-between mt-2 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <span>×0.5</span>
            <span>×01.0</span>
            <span>×01.5</span>
            <span>×02.0</span>
            <span>×02.5</span>
            <span>×03.0</span>
          </div>
        </div>
      )}
    </li>
  );
});

export function ParticipantList() {
  const { t } = useI18n();
  const { participants, myParticipant, isAdmin, updateWeight, removeParticipant } = useSession();
  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const handleTogglePopover = useCallback((id: string | null) => {
    setOpenPopover(id);
  }, []);

  const emptyWeight = '×1.0';

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">
        {t.lobby.participants} ({participants.length})
      </h3>
      <ul className="space-y-1" role="list">
        {participants.map((p) => (
          <ParticipantRow
            key={p.id}
            participant={p}
            isMe={p.id === myParticipant?.id}
            isAdmin={isAdmin}
            isOpen={openPopover === p.id}
            onTogglePopover={handleTogglePopover}
            onWeightChange={updateWeight}
            onRemove={removeParticipant}
            emptyWeight={emptyWeight}
            t={t}
          />
        ))}
      </ul>
    </Card>
  );
}
