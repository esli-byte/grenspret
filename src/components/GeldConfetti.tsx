"use client";

import { useEffect, useRef, useState } from "react";

const GELD_EMOJIS = ["💰", "🪙", "💵", "🤑", "💶", "🪙", "💰", "💵"];

type Particle = {
  id: number;
  emoji: string;
  left: number;       // % van scherm
  delay: number;      // s
  duration: number;    // s
  size: number;        // rem
  wobble: number;      // px amplitude
  rotation: number;    // graden start
  rotationSpeed: number;
};

function maakParticles(aantal: number): Particle[] {
  return Array.from({ length: aantal }, (_, i) => ({
    id: i,
    emoji: GELD_EMOJIS[Math.floor(Math.random() * GELD_EMOJIS.length)],
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2 + Math.random() * 1.5,
    size: 1.2 + Math.random() * 1,
    wobble: 20 + Math.random() * 40,
    rotation: Math.random() * 360,
    rotationSpeed: 180 + Math.random() * 360,
  }));
}

export function GeldConfetti({ actief }: { actief: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [zichtbaar, setZichtbaar] = useState(false);
  const alGetriggerd = useRef(false);

  useEffect(() => {
    // Trigger maar één keer per mount — niet bij elke re-render
    if (!actief || alGetriggerd.current) return;
    alGetriggerd.current = true;

    // Kleine vertraging zodat de pagina eerst rendert
    const startTimer = setTimeout(() => {
      setParticles(maakParticles(24));
      setZichtbaar(true);
    }, 300);

    // Verwijder na animatie klaar
    const endTimer = setTimeout(() => {
      setZichtbaar(false);
    }, 4500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [actief]);

  if (!zichtbaar || particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <span
          key={p.id}
          className="geld-particle absolute"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}rem`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--wobble": `${p.wobble}px`,
            "--rotation-start": `${p.rotation}deg`,
            "--rotation-end": `${p.rotation + p.rotationSpeed}deg`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
