// web/src/app/play/domination/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  dominationService,
  CategoryOverview,
  CategoryDominationMap,
  DominationNodeInfo,
  StartNodeResponse,
  SubmitNodeResponse,
} from '@/services/domination.service';
import { gameService, InventoryCard } from '@/services/game.service';
import DominationCategorySelect from '@/components/domination/DominationCategorySelect';
import DominationMap from '@/components/domination/DominationMap';
import DominationNodeModal from '@/components/domination/DominationNodeModal';
import DominationHeader from '@/components/domination/DominationHeader';
import DominationResultModal from '@/components/domination/DominationResultModal';
import QuestionBoard from '@/components/game/QuestionBoard';
import PlayerHand from '@/components/game/PlayerHand';
import { Question, AuditLogEntry, PowerUp } from '@/store/useGameStore';
import { soundManager } from '@/utils/audio';

type DominationState = 'CATEGORY_SELECT' | 'MAP_VIEW' | 'PLAYING_NODE' | 'NODE_RESULT';

const TIMER_DURATION_MS = 10000;
const BASE_POINTS_CORRECT = 10000;

export default function DominationPage() {
  const [gameState, setGameState] = useState<DominationState>('CATEGORY_SELECT');
  const [categories, setCategories] = useState<CategoryOverview[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CategoryOverview | null>(null);
  const [categoryMap, setCategoryMap] = useState<CategoryDominationMap | null>(null);
  const [selectedNode, setSelectedNode] = useState<DominationNodeInfo | null>(null);
  const [isNodeModalOpen, setIsNodeModalOpen] = useState(false);
  const [inventory, setInventory] = useState<InventoryCard[]>([]);

  // Partida activa del nodo
  const [nodeData, setNodeData] = useState<StartNodeResponse | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [submitResult, setSubmitResult] = useState<SubmitNodeResponse | null>(null);

  // Estados visuales de la pregunta
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Timer al milisegundo
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION_MS);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasAnsweredRef = useRef<boolean>(false);

  const currentQuestion = questions[currentQuestionIndex];

  // 1. Cargar visión general de categorías e inventario
  useEffect(() => {
    loadCategories();
    gameService.getInventory().then((inv) => setInventory(inv)).catch(() => {});
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const data = await dominationService.getCategoriesOverview();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Elegir categoría y abrir su mapa de 10 nodos
  const handleSelectCategory = async (category: CategoryOverview) => {
    setSelectedCategory(category);
    setIsLoading(true);
    try {
      const map = await dominationService.getCategoryMap(category.categoryId);
      setCategoryMap(map);
      setGameState('MAP_VIEW');
    } catch (err) {
      console.error(err);
      alert('Error al cargar el mapa de la categoría.');
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Abrir modal de preparación de nodo
  const handleOpenNodeModal = (node: DominationNodeInfo) => {
    setSelectedNode(node);
    setIsNodeModalOpen(true);
  };

  // 4. Iniciar el juego de un nodo específico
  const handleStartNode = async (nodeNumber: number, equippedCardIds: string[]) => {
    if (!selectedCategory) return;
    setIsLoading(true);
    setIsNodeModalOpen(false);

    try {
      const data = await dominationService.startNode(selectedCategory.categoryId, nodeNumber, equippedCardIds);
      setNodeData(data);
      setQuestions(data.questions);
      setPowerUps(data.powerUps);
      setCurrentQuestionIndex(0);
      setRoundScore(0);
      setAuditLog([]);
      setSelectedOption(null);
      setIsCorrect(null);
      setHiddenOptions([]);
      setGameState('PLAYING_NODE');
      startQuestionTimer();
    } catch (err) {
      console.error(err);
      alert('Error al iniciar el desafío del nodo.');
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

  // 5. Responder una pregunta
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
        finishNode(newScore, nextAuditLog);
      }
    }, 450);
  };

  // 6. Enviar resultados del nodo
  const finishNode = async (finalScore: number, finalLog: AuditLogEntry[]) => {
    if (!selectedCategory || !nodeData) return;
    setIsLoading(true);

    try {
      const result = await dominationService.submitNode(
        selectedCategory.categoryId,
        nodeData.nodeNumber,
        finalScore,
        finalLog,
      );
      setSubmitResult(result);
      setGameState('NODE_RESULT');

      // Actualizar el mapa en segundo plano para reflejar el nuevo estado
      dominationService.getCategoryMap(selectedCategory.categoryId).then((updatedMap) => {
        setCategoryMap(updatedMap);
      });
    } catch (err) {
      console.error(err);
      alert('Error al enviar los resultados de la fase.');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Navegación tras resultado
  const handleNextNode = () => {
    if (!submitResult || !selectedCategory) return;
    const nextNodeNumber = submitResult.nodeNumber + 1;
    handleStartNode(nextNodeNumber, []);
  };

  const handleRetryNode = () => {
    if (!nodeData) return;
    handleStartNode(nodeData.nodeNumber, []);
  };

  const handleBackToMap = () => {
    setGameState('MAP_VIEW');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 md:p-8 flex flex-col items-center justify-center pb-24">
      {/* 1. SELECCIÓN DE CATEGORÍA */}
      {gameState === 'CATEGORY_SELECT' && (
        <DominationCategorySelect
          categories={categories}
          onSelectCategory={handleSelectCategory}
          isLoading={isLoading}
        />
      )}

      {/* 2. MAPA DE LOS 10 NODOS */}
      {gameState === 'MAP_VIEW' && categoryMap && (
        <>
          <DominationMap
            categoryMap={categoryMap}
            onSelectNode={handleOpenNodeModal}
            onBack={() => {
              loadCategories();
              setGameState('CATEGORY_SELECT');
            }}
          />

          {isNodeModalOpen && selectedNode && (
            <DominationNodeModal
              node={selectedNode}
              categoryName={categoryMap.categoryName}
              inventory={inventory}
              onStartNode={handleStartNode}
              onClose={() => setIsNodeModalOpen(false)}
              isLoading={isLoading}
            />
          )}
        </>
      )}

      {/* 3. JUGANDO UN NODO */}
      {gameState === 'PLAYING_NODE' && nodeData && currentQuestion && (
        <div className="w-full max-w-2xl flex flex-col items-center">
          <DominationHeader
            categoryName={nodeData.categoryName}
            nodeNumber={nodeData.nodeNumber}
            currentIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
            score={roundScore}
            thresholds={nodeData.thresholds}
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
              console.log('PowerUp activado en Dominio:', pu);
            }}
          />
        </div>
      )}

      {/* 4. RESULTADOS DEL NODO */}
      {gameState === 'NODE_RESULT' && submitResult && selectedCategory && (
        <DominationResultModal
          result={submitResult}
          categoryName={selectedCategory.name}
          onNextNode={submitResult.unlockedNextNode ? handleNextNode : undefined}
          onRetry={handleRetryNode}
          onBackToMap={handleBackToMap}
        />
      )}
    </main>
  );
}
