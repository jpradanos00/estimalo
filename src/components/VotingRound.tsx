import { useState, useEffect } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { CardSelector } from './CardSelector';
import { RevealView } from './RevealView';
import { Card } from './ui/Card';
import { formatCardValue } from '../utils/cards';

export function VotingRound() {
  const { t } = useI18n();
  const {
    currentTask,
    session,
    participants,
    votes,
    myParticipant,
    isAdmin,
    castVote,
    revealVotes,
    confirmEstimate,
    resetRound,
  } = useSession();

  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [session?.current_task_id]);

  useEffect(() => {
    if (myParticipant && votes.length > 0) {
      const myVote = votes.find((v) => v.participant_id === myParticipant.id);
      if (myVote) setSelected(myVote.value);
    }
  }, [votes, myParticipant]);

  if (!currentTask || !session) return null;

  const isRevealed = session.status === 'revealed';

  return (
    <div className="space-y-6 motion-safe:animate-fade-in">
      <Card>
        <div className="text-center">
          <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
            {t.voting.estimating}
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentTask.title}
          </h2>
          {currentTask.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {currentTask.description}
            </p>
          )}
        </div>
      </Card>

      {!isRevealed ? (
        <CardSelector
          selected={selected}
          onSelect={(val) => {
            setSelected(val);
            castVote(val);
          }}
          votes={votes.length}
          total={participants.length}
          isAdmin={isAdmin}
          onReveal={revealVotes}
        />
      ) : (
        <RevealView
          votes={votes}
          participants={participants}
          isAdmin={isAdmin}
          onRevote={resetRound}
          onConfirm={confirmEstimate}
        />
      )}

      {isRevealed && myParticipant && (
        <Card className="text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.voting.yourVote}: <span className="font-bold text-slate-900 dark:text-white">
              {selected !== null ? formatCardValue(selected) : t.voting.noVote}
            </span>
          </p>
        </Card>
      )}
    </div>
  );
}
