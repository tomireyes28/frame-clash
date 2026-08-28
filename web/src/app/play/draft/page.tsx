// web/src/app/play/draft/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  draftService,
  DraftCardOption,
  StartDraftResponse,
  StartDraftRoundResponse,
  SubmitDraftRoundResponse,
} from '@/services/draft.service';
import DraftLobby from '@/components/draft/DraftLobby';
import DraftPhasePicker from '@/components/draft/DraftPhasePicker';
import DraftRoundIntro from '@/components/draft/DraftRoundIntro';
import DraftHeader from '@/components/draft/DraftHeader';
import DraftRoundResult from '@/components/draft/DraftRoundResult';
import DraftFinalResult from '@/components/draft/DraftFinalResult';
import QuestionBoard from '@/components/game/QuestionBoard';
import PlayerHand from '@/components/game/PlayerHand';
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import { soundManager } from '@/utils/audio';

type DraftState = 'LOBBY' | 'DRAFTING' | 'ROUND_INTRO' | 'PLAYING_ROUND' | 'ROUND_RESULT' | 'FINAL_RESULT';

const TIMER_DURATION_MS = 10000;
const BASE_POINTS_CORRECT = 10000;

export default function DraftPage() {
  const [gameState, setGameState] = useState<DraftState>('LOBBY');
  const [sessionId, setSessionId] = useState<string>('');
  const [draftStep, setDraftStep] = useState<number>(1);
  const [currentOptions, setCurrentOptions] = useState<DraftCardOption[]>([]);
  const [draftedCards, setDraftedCards] = useState<DraftCardOption[]>([]);
  const [roundCategories, setRoundCategories] = useState<{ key: string; name: string; icon: string }[]>([]);

  // Datos de la ronda activa
  const [currentRoundNumber, setCurrentRoundNumber] = useState<number>(1);
  const [roundTargetScore, setRoundTargetScore] = useState<number>(50000);
  const [currentCategory, setCurrentCategory] = useState<{ key: string; name: string; icon: string }>({
    key: 'ACTION',
    name: 'Acción',
    icon: '💥',
  });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [roundScore, setRoundScore] = useState<number>(0);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitDraftRoundResponse | null>(null);

  // Estados visuales de la pregunta
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Timer al milisegundo
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_MS);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // 1. Iniciar el Draft
  const handleStartDraft = async () => {
    setIsLoading(true);
    try {
      const data: StartDraftResponse = await draftService.startDraft();
      setSessionId(data.sessionId);
      setDraftStep(1);
      setCurrentOptions(data.options);
      setDraftedCards([]);
      setRoundCategories(data.roundCategories);
      setGameState('DRAFTING');
    } catch (err) {
      console.error(err);
      alert('Error al iniciar el modo Draft.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Elegir carta del draft
  const handlePickCard = async (cardId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    soundManager.playCorrect();

    try {
      const data = await draftService.pickCard(sessionId, cardId);
      setDraftedCards(data.draftedCards);

      if (data.isDraftComplete) {
        // Mano de 5 cartas completa -> Pasar a la intro de la Ronda 1
        setCurrentRoundNumber(1);
        setRoundTargetScore(50000);
        setCurrentCategory(data.roundCategories[0]);
        setGameState('ROUND_INTRO');
      } else {
        setDraftStep(data.draftStep);
        setCurrentOptions(data.options);
      }
    } catch (err) {
      console.error(err);
      alert('Error al seleccionar la carta.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Comenzar la ronda
  const handleStartRound = async () => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const roundData: StartDraftRoundResponse = await draftService.startRound(sessionId, currentRoundNumber);
      setQuestions(roundData.questions);
      setPowerUps(roundData.powerUps); // Los 5 power-ups reiniciados
      setCurrentRoundNumber(roundData.roundNumber);
      setRoundTargetScore(roundData.targetScore);
      setCurrentCategory(roundData.category);
      setCurrentQuestionIndex(0);
      setRoundScore(0);
      setAuditLog([]);
      setSelectedOption(null);
      setIsCorrect(null);
      setHiddenOptions([]);
      setGameState('PLAYING_ROUND');
      startQuestionTimer();
    } catch (err) {
      console.error(err);
      alert('Error al iniciar la ronda del draft.');
    } finally {
      setIsLoading(false);
    }
  };

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
        handleOptionClick(''); // Timeout
      }
    }, 50);
  };

  // 4. Responder una pregunta
  const handleOptionClick = (option: string) => {
    if (hasAnsweredRef.current || !currentQuestion) return;
    hasAnsweredRef.current = true;
    setSelectedOption(option);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    const elapsedMs = Math.round(performance.now() - startTimeRef.current);
    const remainingMs = Math.max(0, TIMER_DURATION_MS - elapsedMs);

    const isTimeout = option === '';
    const answeredRight = !isTimeout;
    const pointsEarned = answeredRight ? BASE_POINTS_CORRECT + remainingMs : 0;
    setIsCorrect(answeredRight);

    if (answeredRight) {
      soundManager.playCorrect();
    } else {
      soundManager.playWrong();
    }

    const newScore = roundScore + pointsEarned;
    setRoundScore(newScore);

    const newLogEntry: AuditLogEntry = {
      questionId: currentQuestion.id,
      selectedAnswer: option,
      timeSpentMs: elapsedMs,
    };

    const nextAuditLog = [...auditLog, newLogEntry];
    setAuditLog(nextAuditLog);

    setTimeout(() => {
      if (currentQuestionIndex + 1 < questions.length) {
        setCurrentQuestionIndex((prev) => prev + 1);
        startQuestionTimer();
      } else {
        finishRound(newScore, nextAuditLog);
      }
    }, 450);
  };

  // 5. Enviar la ronda de draft
  const finishRound = async (finalScore: number, finalLog: AuditLogEntry[]) => {
    if (!sessionId) return;
    setIsLoading(true);

    try {
      const result = await draftService.submitRound(sessionId, currentRoundNumber, finalScore, finalLog);
      setSubmitResult(result);

      if (result.isDraftCompleted) {
        setGameState('FINAL_RESULT');
      } else {
        setGameState('ROUND_RESULT');
      }
    } catch (err) {
      console.error(err);
      alert('Error al enviar los resultados de la ronda.');
    } finally {
      setIsLoading(false);
    }
  };

  // 6. Avanzar a la siguiente ronda (desde pantalla intermedia)
  const handleProceedToNextRound = () => {
    if (!submitResult) return;
    const nextRound = submitResult.roundNumber + 1;
    setCurrentRoundNumber(nextRound);
    if (submitResult.nextCategory) setCurrentCategory(submitResult.nextCategory);
    if (submitResult.nextTargetScore) setRoundTargetScore(submitResult.nextTargetScore);
    setGameState('ROUND_INTRO');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center justify-center pb-24">
      {/* 1. LOBBY */}
      {gameState === 'LOBBY' && (
        <DraftLobby onStartDraft={handleStartDraft} isLoading={isLoading} />
      )}

      {/* 2. FASE DE DRAFT */}
      {gameState === 'DRAFTING' && (
        <DraftPhasePicker
          draftStep={draftStep}
          options={currentOptions}
          draftedCards={draftedCards}
          onPickCard={handlePickCard}
          isLoading={isLoading}
        />
      )}

      {/* 3. INTRODUCCIÓN A LA RONDA */}
      {gameState === 'ROUND_INTRO' && (
        <DraftRoundIntro
          roundNumber={currentRoundNumber}
          totalRounds={3}
          category={currentCategory}
          targetScore={roundTargetScore}
          onStartRound={handleStartRound}
          isLoading={isLoading}
        />
      )}

      {/* 4. JUGANDO LA RONDA */}
      {gameState === 'PLAYING_ROUND' && currentQuestion && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <DraftHeader
            roundNumber={currentRoundNumber}
            totalRounds={3}
            categoryName={currentCategory.name}
            categoryIcon={currentCategory.icon}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
            score={roundScore}
            targetScore={roundTargetScore}
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
            onActivate={(pu) => {
              soundManager.playCorrect();
              console.log('PowerUp activado en Draft:', pu);
            }}
          />
        </div>
      )}

      {/* 5. RESULTADO DE RONDA INTERMEDIA */}
      {gameState === 'ROUND_RESULT' && submitResult && (
        <DraftRoundResult
          result={submitResult}
          onNextRound={handleProceedToNextRound}
        />
      )}

      {/* 6. RESULTADO FINAL Y PREMIOS */}
      {gameState === 'FINAL_RESULT' && submitResult && (
        <DraftFinalResult
          result={submitResult}
          onRetry={handleStartDraft}
        />
      )}
    </main>
  );
}
