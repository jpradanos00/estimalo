import { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from '../hooks/useI18n';
import { useSession } from '../hooks/useSession';
import { supabase } from '../lib/supabase';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { computeWeightedResult } from '../utils/weightedAverage';
import { formatCardValue } from '../utils/cards';
import type { Vote } from '../types';

interface Props {
  taskId: string;
  taskTitle: string;
  open: boolean;
  onClose: () => void;
}

const WEIGHTS = [0.5, 1, 1.5, 2, 2.5, 3];

export function TaskResultModal({ taskId, taskTitle, open, onClose }: Props) {
  const { t } = useI18n();
  const { participants, isAdmin, updateVoteWeight } = useSession();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingVoteId, setEditingVoteId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    supabase
      .from('votes')
      .select('*')
      .eq('task_id', taskId)
      .then(({ data }) => {
        if (data) setVotes(data as Vote[]);
        setLoading(false);
      });
  }, [open, taskId]);

  useEffect(() => {
    if (!open) {
      setEditingVoteId(null);
    }
  }, [open]);

  const result = useMemo(
    () => computeWeightedResult(votes, participants),
    [votes, participants]
  );

  const handleWeightChange = useCallback(
    (voteId: string, newWeight: number) => {
      setVotes((prev) =>
        prev.map((v) => (v.id === voteId ? { ...v, weight: newWeight } : v))
      );
      setEditingVoteId(null);
      updateVoteWeight(voteId, newWeight);
    },
    [updateVoteWeight]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-xl motion-safe:animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t.result.title}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {taskTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus-ring"
            aria-label={t.common.close}
          >
            <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : votes.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
            {t.result.noVotes}
          </p>
        ) : (
          <>
            <div className="space-y-2 mb-6">
              {result.votes.map(({ participant, value, weight }) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700/30"
                >
                  <div
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    aria-hidden="true"
                  >
                    {participant.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-slate-900 dark:text-white block truncate">
                      {participant.name}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums min-w-[3rem] text-right">
                    {formatCardValue(value)}
                  </span>
                  <div className="flex-shrink-0 min-w-[4rem] text-right">
                    {isAdmin ? (
                      editingVoteId === participant.id ? (
                        <div className="flex items-center gap-1 justify-end motion-safe:animate-fade-in">
                          {WEIGHTS.map((w) => (
                            <button
                              key={w}
                              onClick={() => {
                                const voteEntry = votes.find((v) => v.participant_id === participant.id);
                                if (voteEntry) handleWeightChange(voteEntry.id, w);
                              }}
                              className={`w-7 h-7 rounded text-xs font-bold font-mono transition-colors focus-ring ${weight === w ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-500'}`}
                            >
                              {w.toFixed(1)}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingVoteId(participant.id)}
                          className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg transition-colors focus-ring ${weight !== 1 ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                          ×{weight.toFixed(1)}
                        </button>
                      )
                    ) : (
                      <span className={`text-xs font-mono font-semibold px-2 py-1 rounded-lg ${weight !== 1 ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-600'}`}>
                        ×{weight.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <Card className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                  {t.reveal.simpleMean}
                </p>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white tabular-nums">
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
                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {result.weightedMean > 0 ? result.weightedMean.toFixed(1) : '—'}
                </p>
                {result.weightedMean > 0 && (
                  <p className="text-xs text-indigo-400 dark:text-indigo-500 mt-0.5">{t.reveal.hours}</p>
                )}
              </Card>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-2">
              <span>{t.reveal.min}: <strong className="text-slate-900 dark:text-white">{result.totalWeight > 0 ? `${result.min}h` : '—'}</strong></span>
              <span>{t.reveal.max}: <strong className="text-slate-900 dark:text-white">{result.totalWeight > 0 ? `${result.max}h` : '—'}</strong></span>
            </div>
          </>
        )}

        <div className="mt-6">
          <Button variant="secondary" onClick={onClose} className="w-full min-h-[44px]" size="lg">
            {t.common.close}
          </Button>
        </div>
      </div>
    </div>
  );
}
