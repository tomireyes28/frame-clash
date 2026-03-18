// src/components/game/GameHeader.tsx
import React from 'react';

interface GameHeaderProps {
  currentIndex: number;
  totalQuestions: number;
  timeLeft: number;
  score: number;
}

export default function GameHeader({ currentIndex, totalQuestions, timeLeft, score }: GameHeaderProps) {
  return (
    <div className="w-full max-w-md flex justify-between items-center mb-8">
      <div className="bg-black/40 px-4 py-2 rounded-lg font-bold">
        Pregunta {currentIndex + 1}/{totalQuestions}
      </div>
      <div className="text-[#E50914] text-2xl font-bold">
        {(timeLeft / 1000).toFixed(1)}s
      </div>
      <div className="bg-black/40 px-4 py-2 rounded-lg font-bold text-green-400">
        Pts: {score}
      </div>
    </div>
  );
}