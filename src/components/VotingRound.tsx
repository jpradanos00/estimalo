import { useState, useEffect, useRef, useMemo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { CardSelector } from './CardSelector';
import { RevealView } from './RevealView';
import { CelebrationOverlay } from './CelebrationOverlay';
import { Card } from './ui/Card';
import { LeaveButton } from './LeaveButton';
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
    sendNudge,
  } = useSession();

  const [selected, setSelected] = useState<number | null>(null);
  const lastClickedRef = useRef<number | null>(null);

  useEffect(() => {
    lastClickedRef.current = null;
    setSelected(null);
  }, [session?.current_task_id, session?.status]);

  useEffect(() => {
    if (lastClickedRef.current !== null) return;
    if (!myParticipant) {
      setSelected(null);
      return;
    }
    const myVote = votes.find((v) => v.participant_id === myParticipant.id);
    setSelected(myVote ? myVote.value : null);
  }, [votes, myParticipant]);

  const isRevealed = session?.status === 'revealed';

  const numericVotes = useMemo(() => {
    if (!isRevealed) return [];
    return votes.filter((v) => v.value > 0).map((v) => v.value);
  }, [isRevealed, votes]);

  const isUnanimous = useMemo(() => {
    if (numericVotes.length < 2) return false;
    return numericVotes.every((v) => v === numericVotes[0]);
  }, [numericVotes]);

  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isRevealed && isUnanimous) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowCelebration(false);
    }
  }, [isRevealed, isUnanimous]);

  if (!currentTask || !session) return null;

  return (
    <div className="space-y-6 motion-safe:animate-fade-in">
      {showCelebration && <CelebrationOverlay />}
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div className="text-center flex-1">
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
          <LeaveButton variant="compact" />
        </div>
      </Card>

      {!isRevealed ? (
        <CardSelector
          selected={selected}
          onSelect={(val) => {
            lastClickedRef.current = val;
            setSelected(val);
            castVote(val);
          }}
          onDeselect={() => {
            lastClickedRef.current = null;
            setSelected(null);
            castVote(null);
          }}
          votes={votes}
          participants={participants}
          myParticipantId={myParticipant?.id}
          isAdmin={isAdmin}
          onReveal={revealVotes}
          onNudge={sendNudge}
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
