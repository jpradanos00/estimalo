import { useI18n } from '../hooks/useI18n';
import { DEFAULT_CARD_SET, formatCardValue } from '../utils/cards';
import { VotingProgress } from './VotingProgress';
import type { CardDefinition, Participant, Vote } from '../types';

interface Props {
  selected: number | null;
  onSelect: (value: number) => void;
  onDeselect: () => void;
  votes: Vote[];
  participants: Participant[];
  myParticipantId: string | undefined;
  isAdmin: boolean;
  onReveal: () => void;
  onNudge: (targetId: string, emoji: string) => void;
}

const SPECIAL_CARDS = DEFAULT_CARD_SET.filter((c) => c.value === -1 || c.value === -2);
const NUMERIC_CARDS = DEFAULT_CARD_SET.filter((c) => c.value !== -1 && c.value !== -2 && c.value !== null);

export function CardSelector({ selected, onSelect, onDeselect, votes, participants, myParticipantId, isAdmin, onReveal, onNudge }: Props) {
  const { t } = useI18n();

  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-4">
        {t.voting.title}
      </h2>
      <VotingProgress
        participants={participants}
        votes={votes}
        myParticipantId={myParticipantId}
        onNudge={onNudge}
      />

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-3 max-w-lg mx-auto">
        {NUMERIC_CARDS.map((card: CardDefinition) => {
          const isSelected = selected === card.value;
          return (
            <button
              key={card.label}
              onClick={() => {
                if (isSelected) {
                  onDeselect();
                } else {
                  onSelect(card.value!);
                }
              }}
              className={`relative aspect-[3/4] rounded-xl font-bold transition-all duration-200 focus-ring flex flex-col items-center justify-center ${
                isSelected
                  ? `${card.color} text-white ring-4 ring-offset-2 ring-indigo-300 dark:ring-offset-slate-900 scale-105 shadow-lg`
                  : `${card.color} text-white hover:scale-105 hover:shadow-lg cursor-pointer opacity-85 hover:opacity-100`
              }`}
              aria-pressed={isSelected}
              aria-label={`${formatCardValue(card.value)} ${t.voting.hours}`}
            >
              <span className="text-lg sm:text-xl">{card.label}</span>
              <span className="text-[10px] opacity-80">{t.voting.hours}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-center gap-3 mt-4 max-w-lg mx-auto">
        {SPECIAL_CARDS.map((card: CardDefinition) => {
          const isSelected = selected === card.value;
          const label = card.value === -2 ? t.voting.needInfo : t.voting.break;
          return (
            <button
              key={card.label}
              onClick={() => {
                if (isSelected) {
                  onDeselect();
                } else {
                  onSelect(card.value!);
                }
              }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 focus-ring min-h-[44px] ${
                isSelected
                  ? `${card.color} text-white ring-4 ring-offset-2 ring-indigo-300 dark:ring-offset-slate-900 scale-105 shadow-lg`
                  : `${card.color} text-white hover:scale-105 hover:shadow-lg cursor-pointer opacity-85 hover:opacity-100`
              }`}
              aria-pressed={isSelected}
              aria-label={label}
            >
              {card.label} {label}
            </button>
          );
        })}
      </div>

      {isAdmin && votes.length > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={onReveal}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 active:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 focus-ring motion-safe:animate-bounce-in min-h-[44px]"
          >
            {t.voting.reveal}
          </button>
        </div>
      )}

      {!isAdmin && (
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 motion-safe:animate-fade-in">
            {selected !== null ? t.voting.waitingForOthers : t.voting.noVote}
          </p>
        </div>
      )}
    </div>
  );
}
