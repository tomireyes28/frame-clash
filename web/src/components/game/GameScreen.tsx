// web/src/components/game/GameScreen.tsx
'use client';

import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import GameHeader from './GameHeader';
import QuestionBoard from './QuestionBoard';
import PlayerHand from './PlayerHand';
import GameResults from './GameResults';

export default function GameScreen() {
  const { questions, currentIndex, status, score, activePowerUps } = useGameStore();
  const currentQuestion = questions[currentIndex];

  const {
    timeLeft,
    selectedOption,
    isCorrect,
    hiddenOptions,
    handleOptionClick,
    activatePowerUp,
  } = useGameEngine(currentQuestion);

  if (status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-slate-400 font-mono text-xs">Preparando la Arena de Combate...</p>
      </div>
    );
  }

  if (status === 'finished') {
    return <GameResults score={score} />;
  }

  if (!currentQuestion) return null;

  return (
    <div className="w-full flex flex-col items-center p-2 pb-28 font-sans relative">
      <GameHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        timeLeft={timeLeft}
        score={score}
      />

      <QuestionBoard
        question={currentQuestion}
        hiddenOptions={hiddenOptions}
        selectedOption={selectedOption}
        isCorrect={isCorrect}
        onOptionClick={handleOptionClick}
      />

      <PlayerHand
        powerUps={activePowerUps}
        selectedOption={selectedOption}
        onActivate={activatePowerUp}
      />
    </div>
  );
}