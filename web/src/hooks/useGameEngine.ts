import { useState, useEffect, useRef, useCallback } from 'react';
import { useGameStore, Question, PowerUp } from '../store/useGameStore';
import { validateAnswerHash } from '../utils/gameCrypto';

export const useGameEngine = (currentQuestion: Question | undefined) => {
  const { status, answerQuestion, advanceQuestion, consumePowerUp } = useGameStore();
  
  const [timeLeft, setTimeLeft] = useState(10000);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const processAnswer = useCallback((option: string, timeSpent: number, isTimeout: boolean = false) => {
    if (!currentQuestion) return;

    const correct = isTimeout ? false : validateAnswerHash(option, currentQuestion.id, currentQuestion.answerHash);
    
    setIsCorrect(correct);
    setSelectedOption(option);

    const pointsEarned = correct ? 10000 + (10000 - timeSpent) : 0;

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
    }, 1500);
  }, [currentQuestion, answerQuestion, advanceQuestion]);

  const handleTimeout = useCallback(() => {
    processAnswer('TIMEOUT', 10000, true);
  }, [processAnswer]);

  useEffect(() => {
    if (status !== 'playing' || selectedOption !== null || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 100));
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, selectedOption, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0 && selectedOption === null && currentQuestion) {
      const timeoutId = setTimeout(() => {
        handleTimeout();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [timeLeft, selectedOption, currentQuestion, handleTimeout]);

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    if (timerRef.current) clearInterval(timerRef.current);
    processAnswer(option, 10000 - timeLeft);
  };

  const activatePowerUp = useCallback((powerUp: PowerUp) => {
    if (!currentQuestion || selectedOption !== null) return;

    if (powerUp.action === 'REMOVE_OPTION') {
      const correctOpt = currentQuestion.options.find(opt => 
        validateAnswerHash(opt, currentQuestion.id, currentQuestion.answerHash)
      );

      const incorrectOpts = currentQuestion.options.filter(opt => opt !== correctOpt);

      const toHide = incorrectOpts
        .sort(() => 0.5 - Math.random())
        .slice(0, powerUp.value);

      setHiddenOptions(toHide);
      consumePowerUp(powerUp.id); // Acá es donde la magia ocurre
    }
  }, [currentQuestion, selectedOption, consumePowerUp]);

  return { timeLeft, selectedOption, isCorrect, hiddenOptions, handleOptionClick, activatePowerUp };
};