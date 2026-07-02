import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession } from '../hooks/useSession';

interface NudgeData {
  targetParticipantId: string;
  emoji: string;
  from?: string;
}

function playSound(emoji: string) {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (emoji === '⏰') {
      for (let i = 0; i < 3; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 1000;
        osc.type = 'square';
        const start = now + i * 0.15;
        gain.gain.setValueAtTime(0.2, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.08);
        osc.start(start);
        osc.stop(start + 0.08);
      }
    } else if (emoji === '🐢') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
      osc.start(now);
      osc.stop(now + 1.0);
    } else {
      const freqs = emoji === '🔔' ? [800, 1200] : [600, 900];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        const start = now + i * 0.12;
        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.01, start + 0.3);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    }

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // AudioContext not available
  }
}

export function NudgeNotification() {
  const { myParticipant } = useSession();
  const [nudges, setNudges] = useState<Array<{ id: number; emoji: string; from?: string }>>([]);
  const idRef = useRef(0);

  const handleNudge = useCallback((event: Event) => {
    const data = (event as CustomEvent<NudgeData>).detail;
    if (!data || !myParticipant) return;
    if (data.targetParticipantId !== myParticipant.id) return;

    const id = ++idRef.current;
    setNudges((prev) => [...prev, { id, emoji: data.emoji, from: data.from }]);
    playSound(data.emoji);

    setTimeout(() => {
      setNudges((prev) => prev.filter((n) => n.id !== id));
    }, 2500);
  }, [myParticipant]);

  useEffect(() => {
    window.addEventListener('nudge', handleNudge as EventListener);
    return () => window.removeEventListener('nudge', handleNudge as EventListener);
  }, [handleNudge]);

  if (nudges.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center">
      {nudges.map((nudge) => (
        <div
          key={nudge.id}
          className="absolute flex flex-col items-center gap-2"
          style={{
            animation: 'nudge-float 2.5s ease-out forwards',
          }}
        >
          <span className="text-6xl sm:text-7xl drop-shadow-2xl">{nudge.emoji}</span>
          {nudge.from && (
            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-white/90 dark:bg-slate-800/90 px-3 py-1 rounded-full shadow-lg">
              {nudge.from}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
