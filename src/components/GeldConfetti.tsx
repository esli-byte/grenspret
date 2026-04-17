"use client";

import { useEffect, useRef, useState } from "react";

const GELD_EMOJIS = ["💰", "🪙", "💵", "🤑", "💶", "🪙", "💰", "💵"];

type Particle = {
  id: number;
  emoji: string;
  // Startpositie (centrum-explosie)
  startX: number;     // % horizontaal vanuit het midden
  startY: number;     // % verticaal
  // Lanceerrichting
  shootX: number;     // px horizontale kracht (links/rechts)
  shootY: number;     // px omhoog-kracht
  // Eindpositie (vallen)
  endX: number;       // px drift tijdens vallen
  // Timing
  delay: number;      // s
  // Stijl
  size: number;       // rem
  rotation: number;
  rotationEnd: number;
  wobbleFreq: number; // hoe snel het heen-en-weer zwaait
};

function maakParticles(aantal: number): Particle[] {
  return Array.from({ length: aantal }, (_, i) => {
    // Hoek vanuit centrum: willekeurig rondom, maar meer naar boven gericht
    const hoek = -20 - Math.random() * 140; // -20 tot -160 graden (boog omhoog)
    const kracht = 200 + Math.random() * 350; // hoe ver ze vliegen
    const rad = (hoek * Math.PI) / 180;

    return {
      id: i,
      emoji: GELD_EMOJIS[Math.floor(Math.random() * GELD_EMOJIS.length)],
      startX: 40 + Math.random() * 20, // 40-60% = rond het midden
      startY: 45 + Math.random() * 15, // iets onder midden scherm
      shootX: Math.cos(rad) * kracht,
      shootY: Math.sin(rad) * kracht,
      endX: (Math.random() - 0.5) * 120, // zijwaartse drift bij vallen
      delay: Math.random() * 0.3, // snelle burst, kort na elkaar
      size: 1.1 + Math.random() * 1.2,
      rotation: Math.random() * 360,
      rotationEnd: 360 + Math.random() * 720,
      wobbleFreq: 2 + Math.random() * 3,
    };
  });
}

export function GeldConfetti({ actief }: { actief: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [zichtbaar, setZichtbaar] = useState(false);
  const alGetriggerd = useRef(false);

  useEffect(() => {
    if (!actief || alGetriggerd.current) return;
    alGetriggerd.current = true;

    const startTimer = setTimeout(() => {
      setParticles(maakParticles(30));
      setZichtbaar(true);
    }, 400);

    const endTimer = setTimeout(() => {
      setZichtbaar(false);
    }, 5000);

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
          className="geld-burst absolute"
          style={{
            left: `${p.startX}%`,
            top: `${p.startY}%`,
            fontSize: `${p.size}rem`,
            animationDelay: `${p.delay}s`,
            "--shoot-x": `${p.shootX}px`,
            "--shoot-y": `${p.shootY}px`,
            "--end-x": `${p.endX}px`,
            "--rot-start": `${p.rotation}deg`,
            "--rot-end": `${p.rotationEnd}deg`,
            "--wobble-freq": `${p.wobbleFreq}`,
          } as React.CSSProperties}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
