import { useState, memo } from 'react';
import { useI18n } from '../hooks/useI18n';
import type { Participant, Vote } from '../types';

interface Props {
  participants: Participant[];
  votes: Vote[];
  myParticipantId: string | undefined;
  onNudge: (targetId: string, emoji: string) => void;
}

const NUDGE_EMOJIS = ['👉', '🔔', '⏰', '🐢'];

function Avatar({
  name,
}: {
  name: string;
}) {
  return (
    <div
      className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function ParticipantAvatar({
  participant,
  hasVoted,
  isMe,
  onNudge,
}: {
  participant: Participant;
  hasVoted: boolean;
  isMe: boolean;
  onNudge: (targetId: string, emoji: string) => void;
}) {
  const { t } = useI18n();
  const [showNudgePicker, setShowNudgePicker] = useState(false);

  return (
    <div className="relative flex flex-col items-center gap-1 flex-shrink-0">
      <button
        onClick={() => {
          if (!hasVoted && !isMe) {
            setShowNudgePicker(!showNudgePicker);
          }
        }}
        disabled={hasVoted || isMe}
        className={`relative rounded-full transition-all duration-200 min-w-[44px] min-h-[44px] flex items-center justify-center ${
          hasVoted
            ? 'ring-2 ring-emerald-400 dark:ring-emerald-500'
            : isMe
              ? 'ring-2 ring-slate-300 dark:ring-slate-600 opacity-50'
              : 'ring-2 ring-slate-200 dark:ring-slate-600 hover:ring-indigo-400 dark:hover:ring-indigo-500 cursor-pointer hover:scale-110'
        } focus-ring`}
        title={
          hasVoted
            ? `${participant.name} — ${t.voting.voted.toLowerCase()}`
            : isMe
              ? participant.name
              : `${participant.name} — ${t.voting.nudge}`
        }
        aria-label={participant.name}
      >
        <Avatar name={participant.name} />
        {hasVoted && (
          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[8px] font-bold leading-none border-2 border-white dark:border-slate-800">
            <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        )}
      </button>

      <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[4rem] text-center leading-tight">
        {participant.name}
      </span>

      {showNudgePicker && !hasVoted && !isMe && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 motion-safe:animate-fade-in">
          <div className="flex gap-1">
            {NUDGE_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onNudge(participant.id, emoji);
                  setShowNudgePicker(false);
                }}
                className="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-lg transition-colors focus-ring min-w-[44px] min-h-[44px]"
                aria-label={`${t.voting.nudge} ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export const VotingProgress = memo(function VotingProgress({
  participants,
  votes,
  myParticipantId,
  onNudge,
}: Props) {
  const { t } = useI18n();
  const votedIds = new Set(votes.map((v) => v.participant_id));
  const votedCount = participants.filter((p) => votedIds.has(p.id)).length;

  return (
    <div className="text-center mb-6">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
        {t.voting.voted}: <strong className="text-slate-900 dark:text-white">{votedCount}/{participants.length}</strong>
      </p>
      <div className="flex flex-wrap justify-center gap-3" role="list" aria-label={t.voting.participants}>
        {participants.map((p) => (
          <ParticipantAvatar
            key={p.id}
            participant={p}
            hasVoted={votedIds.has(p.id)}
            isMe={p.id === myParticipantId}
            onNudge={onNudge}
          />
        ))}
      </div>
    </div>
  );
});
