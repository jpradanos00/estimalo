import { useMemo, memo } from 'react';
import { useI18n } from '../hooks/useI18n';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { computeWeightedResult } from '../utils/weightedAverage';
import { formatCardValue } from '../utils/cards';
import type { Participant, Vote } from '../types';

interface Props {
  votes: Vote[];
  participants: Participant[];
  isAdmin: boolean;
  onRevote: () => void;
  onConfirm: (estimate: number) => void;
}

interface VoteRowProps {
  participant: Participant;
  value: number;
  min: number;
  max: number;
  t: Record<string, any>;
}

const VoteRow = memo(function VoteRow({ participant, value, min, max, t }: VoteRowProps) {
  const pct = max > 0 ? ((value - min) / (max - min || 1)) * 60 : 0;
  const isSpecialCard = value <= 0;

  return (
    <div
      key={participant.id}
      className="flex items-center gap-3 p-2 rounded-xl"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {participant.name.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
            {participant.name}
          </span>
          {participant.weight !== 1 && (
            <Badge variant="info">×{participant.weight}</Badge>
          )}
          {participant.is_admin && (
            <Badge variant="warning">{t.common.admin}</Badge>
          )}
        </div>
        <div className="mt-1 bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${isSpecialCard ? 100 : 15 + pct}%` }}
          />
        </div>
      </div>
      <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums min-w-[4rem] text-right">
        {formatCardValue(value)}
      </span>
    </div>
  );
});

export function RevealView({ votes, participants, isAdmin, onRevote, onConfirm }: Props) {
  const { t } = useI18n();

  const result = useMemo(
    () => computeWeightedResult(votes, participants),
    [votes, participants]
  );

  const maxDeviation = result.max - result.min;

  return (
    <div className="space-y-4 motion-safe:animate-fade-in">
      <Card>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-4">
          {t.reveal.title}
        </h3>

        <div className="space-y-2">
          {result.votes.map(({ participant, value }) => (
            <VoteRow
              key={participant.id}
              participant={participant}
              value={value}
              min={result.min}
              max={result.max}
              t={t}
            />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
            {t.reveal.simpleMean}
          </p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
            {result.simpleMean > 0 ? result.simpleMean.toFixed(1) : '—'}
          </p>
          {result.simpleMean > 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t.reveal.hours}</p>
          )}
        </Card>
        <Card className="text-center ring-2 ring-indigo-500/30 dark:ring-indigo-400/30 bg-indigo-50/50 dark:bg-indigo-900/10">
          <p className="text-xs text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">
            {t.reveal.weightedMean}
          </p>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
            {result.weightedMean > 0 ? result.weightedMean.toFixed(1) : '—'}
          </p>
          {result.weightedMean > 0 && (
            <p className="text-xs text-indigo-400 dark:text-indigo-500 mt-0.5">{t.reveal.hours}</p>
          )}
        </Card>
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-2">
        <span>{t.reveal.min}: <strong className="text-slate-900 dark:text-white">{result.min}h</strong></span>
        <span>{t.reveal.max}: <strong className="text-slate-900 dark:text-white">{result.max}h</strong></span>
      </div>

      {maxDeviation > 20 && (
        <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800 text-center">
          <p className="text-sm text-amber-700 dark:text-amber-400">{t.reveal.noConsensus}</p>
        </Card>
      )}

      {isAdmin && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="secondary" size="lg" className="flex-1" onClick={onRevote}>
            {t.reveal.revote}
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            onClick={() => onConfirm(
              result.weightedMean > 0
                ? Math.round(result.weightedMean * 2) / 2
                : Math.round(result.simpleMean * 2) / 2
            )}
          >
            {t.reveal.confirm}
          </Button>
        </div>
      )}

      {!isAdmin && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          {t.reveal.discussion}
        </p>
      )}
    </div>
  );
}
