import { useEffect, useState, useMemo } from 'react';

const CELEBRATION_EMOJIS = ['🎉', '✨', '🎊', '🚀', '🔥', '💫', '🥳', '🌟'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface FallingEmoji {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export function CelebrationOverlay() {
  const [emojis, setEmojis] = useState<FallingEmoji[]>([]);

  useEffect(() => {
    const items: FallingEmoji[] = [];
    for (let i = 0; i < 30; i++) {
      items.push({
        id: i,
        emoji: CELEBRATION_EMOJIS[Math.floor(Math.random() * CELEBRATION_EMOJIS.length)],
        left: randomBetween(5, 90),
        delay: randomBetween(0, 1.5),
        duration: randomBetween(2.5, 4.5),
        size: randomBetween(1.5, 3.5),
      });
    }
    setEmojis(items);

    const timer = setTimeout(() => setEmojis([]), 5000);
    return () => clearTimeout(timer);
  }, []);

  const emojiElements = useMemo(() => emojis.map((e) => (
    <span
      key={e.id}
      className="absolute text-4xl pointer-events-none select-none motion-safe:animate-emoji-fall"
      style={{
        left: `${e.left}%`,
        top: '-5vh',
        fontSize: `${e.size}rem`,
        animationDelay: `${e.delay}s`,
        animationDuration: `${e.duration}s`,
        ['--fall-duration' as string]: `${e.duration}s`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      {e.emoji}
    </span>
  )), [emojis]);

  if (emojis.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {emojiElements}
    </div>
  );
}
