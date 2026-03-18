// src/components/game/GameScreen.tsx
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
    activatePowerUp 
  } = useGameEngine(currentQuestion);

  if (status === 'idle') {
    return <div className="text-white text-center mt-20 font-bold text-2xl">Esperando iniciar partida...</div>;
  }

  if (status === 'finished') {
    return <GameResults score={score} />;
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white flex flex-col items-center pt-10 px-4 font-sans pb-32">
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