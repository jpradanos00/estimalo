import { useI18n } from '../hooks/useI18n';
import { DEFAULT_CARD_SET, formatCardValue } from '../utils/cards';
import type { CardDefinition } from '../types';

interface Props {
  selected: number | null;
  onSelect: (value: number) => void;
  votes: number;
  total: number;
  isAdmin: boolean;
  onReveal: () => void;
}

export function CardSelector({ selected, onSelect, votes, total, isAdmin, onReveal }: Props) {
  const { t } = useI18n();

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
          {t.voting.title}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {t.voting.voted}: {votes}/{total}
        </p>
        <div className="mt-2 w-full max-w-xs mx-auto h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${total > 0 ? (votes / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 sm:gap-3 max-w-lg mx-auto">
        {DEFAULT_CARD_SET.filter((c) => c.value !== -1 && c.value !== null).map((card: CardDefinition) => {
          const isSelected = selected === card.value;
          return (
            <button
              key={card.label}
              onClick={() => card.value !== null && onSelect(card.value)}
              disabled={selected !== null || card.value === null}
              className={`relative aspect-[3/4] rounded-xl font-bold transition-all duration-200 focus-ring flex flex-col items-center justify-center ${
                isSelected
                  ? `${card.color} text-white ring-4 ring-offset-2 ring-indigo-300 dark:ring-offset-slate-900 scale-105 shadow-lg`
                  : selected !== null
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                    : `${card.color} text-white hover:scale-105 hover:shadow-lg cursor-pointer opacity-90 hover:opacity-100`
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
        {DEFAULT_CARD_SET.filter((c) => c.value === null || c.value === -1).map((card: CardDefinition) => {
          const isSelected = selected === card.value;
          const label = card.value === null ? t.voting.needInfo : t.voting.break;
          return (
            <button
              key={card.label}
              onClick={() => onSelect(card.value as number)}
              disabled={selected !== null}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 focus-ring min-h-[44px] ${
                isSelected
                  ? `${card.color} text-white ring-4 ring-offset-2 ring-indigo-300 dark:ring-offset-slate-900 scale-105 shadow-lg`
                  : selected !== null
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                    : `${card.color} text-white hover:scale-105 hover:shadow-lg cursor-pointer opacity-90 hover:opacity-100`
              }`}
              aria-pressed={isSelected}
              aria-label={label}
            >
              {card.label} {label}
            </button>
          );
        })}
      </div>

      {isAdmin && votes > 0 && (
        <div className="text-center mt-6">
          <button
            onClick={onReveal}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-500 active:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-500/25 focus-ring motion-safe:animate-bounce-in min-h-[44px]"
          >
            {t.voting.reveal}
          </button>
        </div>
      )}

      {!isAdmin && selected !== null && (
        <div className="text-center mt-4">
          <p className="text-sm text-slate-500 dark:text-slate-400 motion-safe:animate-fade-in">
            {t.voting.waitingForOthers}
          </p>
        </div>
      )}
    </div>
  );
}
