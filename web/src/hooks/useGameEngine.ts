import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore, Question, PowerUp } from '../store/useGameStore';
import { validateAnswerHash } from '../utils/gameCrypto';
import { soundManager } from '../utils/audio';

export const useGameEngine = (currentQuestion: Question | undefined) => {
  const { status, answerQuestion, advanceQuestion, consumePowerUp } = useGameStore();

  const [timeLeft, setTimeLeft] = useState(10000);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);

  const questionStartTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickSecondRef = useRef<number>(-1);

  // Inicialización de cada nueva pregunta
  useEffect(() => {
    if (!currentQuestion || status !== 'playing') return;

    questionStartTimeRef.current = performance.now();
    setTimeLeft(10000);
    setSelectedOption(null);
    setIsCorrect(null);
    setHiddenOptions([]);
    lastTickSecondRef.current = -1;
  }, [currentQuestion, status]);

  const processAnswer = useCallback((option: string, timeSpent: number, isTimeout: boolean = false) => {
    if (!currentQuestion) return;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const correct = isTimeout ? false : validateAnswerHash(option, currentQuestion.id, currentQuestion.answerHash);

    setIsCorrect(correct);
    setSelectedOption(option);

    // Sonido de feedback inmediato
    if (correct) {
      soundManager.playCorrect();
    } else {
      soundManager.playIncorrect();
    }

    // Puntos oficiales: 10.000 base + milisegundos restantes exactos
    const timeRemainingMs = Math.max(0, 10000 - timeSpent);
    const pointsEarned = correct ? 10000 + timeRemainingMs : 0;

    answerQuestion({
      questionId: currentQuestion.id,
      selectedAnswer: option,
      timeSpentMs: timeSpent,
    }, pointsEarned);

    setTimeout(() => {
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(10000);
      setHiddenOptions([]);
      advanceQuestion();
    }, 1200);
  }, [currentQuestion, answerQuestion, advanceQuestion]);

  const handleTimeout = useCallback(() => {
    processAnswer('TIMEOUT', 10000, true);
  }, [processAnswer]);

  // Loop del temporizador en tiempo real con performance.now()
  useEffect(() => {
    if (status !== 'playing' || selectedOption !== null) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - questionStartTimeRef.current;
      const remaining = Math.max(0, 10000 - Math.round(elapsed));

      setTimeLeft(remaining);

      // Reproducir sonido de tick en los últimos 3 segundos
      const secondsLeft = Math.ceil(remaining / 1000);
      if (secondsLeft <= 3 && secondsLeft > 0 && secondsLeft !== lastTickSecondRef.current) {
        lastTickSecondRef.current = secondsLeft;
        soundManager.playTick(1000 + (3 - secondsLeft) * 200);
      }

      if (remaining <= 0) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        handleTimeout();
      }
    }, 25); // Actualización suave a 40fps

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status, selectedOption, handleTimeout]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null || timeLeft <= 0) return;
    const timeSpent = Math.max(0, Math.min(10000, Math.round(performance.now() - questionStartTimeRef.current)));
    processAnswer(option, timeSpent);
  };

  const activatePowerUp = useCallback((powerUp: PowerUp) => {
    if (!currentQuestion || selectedOption !== null) return;

    if (powerUp.action === 'REMOVE_OPTION') {
      const correctOpt = currentQuestion.options.find(opt =>
        validateAnswerHash(opt, currentQuestion.id, currentQuestion.answerHash),
      );

      const incorrectOpts = currentQuestion.options.filter(opt => opt !== correctOpt);
      const toHide = incorrectOpts
        .sort(() => 0.5 - Math.random())
        .slice(0, powerUp.value || 1);

      setHiddenOptions(toHide);
      consumePowerUp(powerUp.id);
    }
  }, [currentQuestion, selectedOption, consumePowerUp]);

  return { timeLeft, selectedOption, isCorrect, hiddenOptions, handleOptionClick, activatePowerUp };
};