// web/src/app/play/roguelite/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  rogueliteService,
  StartRunResponse,
  StartWaveResponse,
  SubmitWaveResponse,
  CategoryOption,
} from '@/services/roguelite.service';
import RogueliteLobby from '@/components/roguelite/RogueliteLobby';
import RogueliteCategoryPicker from '@/components/roguelite/RogueliteCategoryPicker';
import RogueliteHeader from '@/components/roguelite/RogueliteHeader';
import RogueliteWaveResult from '@/components/roguelite/RogueliteWaveResult';
import RogueliteGameOver from '@/components/roguelite/RogueliteGameOver';
import QuestionBoard from '@/components/game/QuestionBoard';
import PlayerHand from '@/components/game/PlayerHand';
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import { soundManager } from '@/utils/audio';

type RogueliteState = 'LOBBY' | 'PICKING_CATEGORY' | 'PLAYING_WAVE' | 'WAVE_RESULT' | 'GAME_OVER';

const TIMER_DURATION_MS = 10000;
const BASE_POINTS_CORRECT = 10000;

export default function RoguelitePage() {
  const [gameState, setGameState] = useState<RogueliteState>('LOBBY');
  const [runData, setRunData] = useState<StartRunResponse | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [categoryChoices, setCategoryChoices] = useState<CategoryOption[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Puntaje de la ronda en tiempo real
  const [waveScore, setWaveScore] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitWaveResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  // Timer de precisión
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_MS);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 1. Iniciar corrida desde el Lobby
  const handleStartRun = async (equippedCardIds: string[]) => {
    setIsLoading(true);
    try {
      const data = await rogueliteService.startRun(equippedCardIds);
      setRunData(data);
      setCategoryChoices(data.categoryChoices);
      setGameState('PICKING_CATEGORY');
    } catch (err) {
      console.error(err);
      alert('Error al iniciar la corrida de Roguelike.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Elegir categoría y arrancar la ronda
  const handleSelectCategory = async (categoryKey: string) => {
    if (!runData) return;
    setIsLoading(true);
    try {
      const waveData: StartWaveResponse = await rogueliteService.startWave(runData.runId, categoryKey);
      setQuestions(waveData.questions);
      setPowerUps(waveData.powerUps);
      setCurrentCategory(waveData.category);
      setCurrentQuestionIndex(0);
      setWaveScore(0);
      setAuditLog([]);
      setSelectedOption(null);
      setIsCorrect(null);
      setHiddenOptions([]);
      setGameState('PLAYING_WAVE');
      startQuestionTimer();
    } catch (err) {
      console.error(err);
      alert('Error al cargar las preguntas de la categoría.');
    } finally {
      setIsLoading(false);
    }
  };

  // Iniciar temporizador de la pregunta con performance.now()
  const startQuestionTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeft(TIMER_DURATION_MS);
    hasAnsweredRef.current = false;
    setSelectedOption(null);
    setIsCorrect(null);
    setHiddenOptions([]);
    startTimeRef.current = performance.now();

    timerIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startTimeRef.current;
      const remaining = Math.max(0, TIMER_DURATION_MS - elapsed);
      setTimeLeft(remaining);

      if (remaining <= 3000 && remaining > 500) {
        soundManager.playTick();
      }

      if (remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        handleOptionClick(''); // Tiempo agotado
      }
    }, 50);
  };

  // 3. Responder una pregunta
  const handleOptionClick = (option: string) => {
    if (hasAnsweredRef.current || !currentQuestion) return;
    hasAnsweredRef.current = true;
    setSelectedOption(option);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const elapsedMs = Math.round(performance.now() - startTimeRef.current);
    const remainingMs = Math.max(0, TIMER_DURATION_MS - elapsedMs);

    const isTimeout = option === '';
    const pointsEarned = !isTimeout ? BASE_POINTS_CORRECT + remainingMs : 0;
    const answeredRight = !isTimeout;
    setIsCorrect(answeredRight);

    if (answeredRight) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    const newWaveScore = waveScore + pointsEarned;
    setWaveScore(newWaveScore);

    const newLogEntry: AuditLogEntry = {
      questionId: currentQuestion.id,
      selectedAnswer: option,
      timeSpentMs: elapsedMs,
    };

    const nextAuditLog = [...auditLog, newLogEntry];
    setAuditLog(nextAuditLog);

    // Avanzar a la siguiente pregunta o enviar la ronda
    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        startQuestionTimer();
      } else {
        finishWave(newWaveScore, nextAuditLog);
      }
    }, 450);
  };

  // 4. Finalizar y enviar la ronda
  const finishWave = async (finalScore: number, finalLog: AuditLogEntry[]) => {
    if (!runData) return;
    setIsLoading(true);

    try {
      const result = await rogueliteService.submitWave(runData.runId, finalScore, finalLog);
      setSubmitResult(result);

      if (result.passed) {
        setGameState('WAVE_RESULT');
        if (result.nextCategoryChoices) {
          setCategoryChoices(result.nextCategoryChoices);
        }
      } else {
        setGameState('GAME_OVER');
      }
    } catch (err) {
      console.error(err);
      alert('Error al procesar el resultado de la ronda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Ir a la siguiente ronda
  const handleNextWave = () => {
    if (submitResult) {
      setRunData((prev) => (prev ? { ...prev, wave: submitResult.wave + 1, targetScore: submitResult.nextTargetScore || 70000 } : null));
    }
    setGameState('PICKING_CATEGORY');
  };

  // 6. Reintentar corrida
  const handleRetry = () => {
    setGameState('LOBBY');
  };

  const handleActivatePowerUp = (pu: PowerUp) => {
    soundManager.playCorrect();
    console.log('PowerUp activado:', pu);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center justify-center pb-24">
      {gameState === 'LOBBY' && (
        <RogueliteLobby onStartRun={handleStartRun} isLoading={isLoading} />
      )}

      {gameState === 'PICKING_CATEGORY' && runData && (
        <RogueliteCategoryPicker
          wave={runData.wave}
          targetScore={runData.targetScore}
          categories={categoryChoices}
          onSelectCategory={handleSelectCategory}
          isLoading={isLoading}
        />
      )}

      {gameState === 'PLAYING_WAVE' && runData && currentQuestion && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <RogueliteHeader
            wave={runData.wave}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
            score={waveScore}
            targetScore={runData.targetScore}
            categoryName={currentCategory}
          />

          <QuestionBoard
            question={currentQuestion}
            hiddenOptions={hiddenOptions}
            selectedOption={selectedOption}
            isCorrect={isCorrect}
            onOptionClick={handleOptionClick}
          />

          <PlayerHand
            powerUps={powerUps}
            selectedOption={selectedOption}
            onActivate={handleActivatePowerUp}
          />
        </div>
      )}

      {gameState === 'WAVE_RESULT' && submitResult && (
        <RogueliteWaveResult result={submitResult} onNextWave={handleNextWave} />
      )}

      {gameState === 'GAME_OVER' && submitResult && (
        <RogueliteGameOver result={submitResult} onRetry={handleRetry} />
      )}
    </main>
  );
}
