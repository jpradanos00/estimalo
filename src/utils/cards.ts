import type { CardDefinition } from '../types';

export const DEFAULT_CARD_SET: CardDefinition[] = [
  { label: '½', value: 0.5, color: 'bg-emerald-500' },
  { label: '1', value: 1, color: 'bg-emerald-400' },
  { label: '2', value: 2, color: 'bg-green-500' },
  { label: '3', value: 3, color: 'bg-lime-500' },
  { label: '4', value: 4, color: 'bg-yellow-500' },
  { label: '6', value: 6, color: 'bg-amber-500' },
  { label: '8', value: 8, color: 'bg-orange-500' },
  { label: '12', value: 12, color: 'bg-orange-600' },
  { label: '16', value: 16, color: 'bg-red-500' },
  { label: '24', value: 24, color: 'bg-red-600' },
  { label: '40', value: 40, color: 'bg-rose-500' },
  { label: '80', value: 80, color: 'bg-rose-700' },
  { label: '?', value: null, color: 'bg-slate-400 dark:bg-slate-600' },
  { label: '☕', value: -1, color: 'bg-amber-700' },
];

export const CARD_HOUR_LABELS: Record<string, string> = {
  '0.5': '½h',
  '1': '1h',
  '2': '2h',
  '3': '3h',
  '4': '4h',
  '6': '6h',
  '8': '8h',
  '12': '12h',
  '16': '16h',
  '24': '24h',
  '40': '40h',
  '80': '80h',
};

export function formatCardValue(value: number | null): string {
  if (value === null) return '?';
  if (value === -1) return '☕';
  if (value === 0.5) return '½h';
  if (value === 1) return '1h';
  return `${value}h`;
}
