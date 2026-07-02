import type { Participant, Vote, WeightedResult } from '../types';

export function computeWeightedResult(
  votes: Vote[],
  participants: Participant[]
): WeightedResult {
  const participantMap = new Map(participants.map((p) => [p.id, p]));

  const voteEntries = votes
    .map((v) => {
      const participant = participantMap.get(v.participant_id);
      if (!participant) return null;
      return { participant, value: v.value, weight: v.weight };
    })
    .filter((e): e is NonNullable<typeof e> => e !== null);

  const numericVotes = voteEntries.filter((e) => e.value > 0);

  if (numericVotes.length === 0) {
    return {
      votes: voteEntries,
      simpleMean: 0,
      weightedMean: 0,
      totalWeight: 0,
      min: 0,
      max: 0,
    };
  }

  const values = numericVotes.map((e) => e.value);
  const simpleMean = values.reduce((a, b) => a + b, 0) / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);

  const totalWeight = numericVotes.reduce(
    (sum, e) => sum + e.weight,
    0
  );

  const weightedSum = numericVotes.reduce(
    (sum, e) => sum + e.value * e.weight,
    0
  );

  const weightedMean = totalWeight > 0 ? weightedSum / totalWeight : 0;

  return {
    votes: voteEntries,
    simpleMean,
    weightedMean,
    totalWeight,
    min,
    max,
  };
}
