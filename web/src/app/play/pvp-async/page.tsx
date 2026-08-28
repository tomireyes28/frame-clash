// web/src/app/play/pvp-async/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  pvpService,
  PvpMatchesResponse,
  PvpMatchSummary,
  PvpStartResponse,
  PvpSubmitResponse,
} from '@/services/pvp.service';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';
import { soundManager } from '@/utils/audio';

const TIER_CONFIG: Record<string, { label: string; icon: string; color: string; border: string; bg: string }> = {
  Bronze: { label: 'Bronce', icon: '🥉', color: 'text-amber-700', border: 'border-amber-700', bg: 'bg-amber-950/30' },
  Silver: { label: 'Plata', icon: '🥈', color: 'text-slate-300', border: 'border-slate-400', bg: 'bg-slate-800/40' },
  Gold: { label: 'Oro', icon: '🥇', color: 'text-amber-400', border: 'border-amber-400', bg: 'bg-amber-950/40' },
  Platinum: { label: 'Platino', icon: '💎', color: 'text-sky-400', border: 'border-sky-400', bg: 'bg-sky-950/40' },
  Diamond: { label: 'Diamante', icon: '👑', color: 'text-purple-400', border: 'border-purple-400', bg: 'bg-purple-950/40' },
};

export default function PvpAsyncPage() {
  const [view, setView] = useState<'LOBBY' | 'PLAYING' | 'RESULT'>('LOBBY');
  const [lobbyData, setLobbyData] = useState<PvpMatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');

  // Configuración de Desafío
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [myCards, setMyCards] = useState<InventoryCard[]>([]);
  const [equippedCards, setEquippedCards] = useState<string[]>([]);
  const [isStarting, setIsStarting] = useState(false);

  // Estado de Partida Activa
  const [matchData, setMatchData] = useState<PvpStartResponse | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const [totalScore, setTotalScore] = useState(0);
  const [auditLog, setAuditLog] = useState<{ questionId: string; selectedAnswer: string; timeSpentMs: number }[]>([]);
  const [usedPowerUps, setUsedPowerUps] = useState<string[]>([]);

  // Estado de Resultado
  const [submitResult, setSubmitResult] = useState<PvpSubmitResponse | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qStartTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchLobbyData();
    fetchInventory();
  }, []);

  const fetchLobbyData = async () => {
    setLoading(true);
    try {
      const data = await pvpService.getMyMatches();
      setLobbyData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const inventory = await inventoryService.getInventory();
      const withPowerUps = (inventory || []).filter((c) => Boolean(c.powerUpAction));
      setMyCards(withPowerUps);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEquipCard = (cardId: string) => {
    setEquippedCards((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return [prev[1], cardId]; // Máximo 2 power-ups
      return [...prev, cardId];
    });
  };

  const handleStartChallenge = async () => {
    setIsStarting(true);
    try {
      const response = await pvpService.createOrFindMatch(
        selectedCategory || undefined,
        equippedCards,
      );
      setMatchData(response);
      setShowConfigModal(false);
      setCurrentQIndex(0);
      setTotalScore(0);
      setAuditLog([]);
      setUsedPowerUps([]);
      setView('PLAYING');
      startQuestionTimer();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al iniciar duelo');
    } finally {
      setIsStarting(false);
    }
  };

  const startQuestionTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeRemaining(10);
    qStartTimeRef.current = performance.now();
    setEliminatedOptions([]);
    setSelectedOption(null);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeExpired();
          return 0;
        }
        if (prev <= 4) soundManager.playTick();
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeExpired = () => {
    handleSelectAnswer('__TIMEOUT__');
  };

  const handleSelectAnswer = (option: string) => {
    if (selectedOption !== null || !matchData) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeSpentMs = Math.round(performance.now() - qStartTimeRef.current);
    setSelectedOption(option);

    const currentQ = matchData.questions[currentQIndex];
    const newLogEntry = {
      questionId: currentQ.id,
      selectedAnswer: option,
      timeSpentMs,
    };
    const updatedLog = [...auditLog, newLogEntry];
    setAuditLog(updatedLog);

    // Calcular puntos estimados para feedback en vivo
    const qScore = option !== '__TIMEOUT__' ? Math.max(1000, 10000 - timeSpentMs) : 0;
    const newTotal = totalScore + qScore;
    setTotalScore(newTotal);

    if (option !== '__TIMEOUT__') {
      soundManager.playCorrect();
    } else {
      soundManager.playIncorrect();
    }

    setTimeout(() => {
      if (currentQIndex + 1 < matchData.questions.length) {
        setCurrentQIndex((prev) => prev + 1);
        startQuestionTimer();
      } else {
        finishMatch(updatedLog, newTotal);
      }
    }, 1200);
  };

  const handleUsePowerUp = (powerUp: { id: string; action: string | null; value?: number | null }) => {
    if (usedPowerUps.includes(powerUp.id) || !matchData) return;
    setUsedPowerUps((prev) => [...prev, powerUp.id]);

    const currentQ = matchData.questions[currentQIndex];
    if (powerUp.action === 'REMOVE_OPTION') {
      // Eliminar hasta 2 opciones incorrectas visualmente
      const incorrects = currentQ.options.slice(0, 2);
      setEliminatedOptions(incorrects);
    } else if (powerUp.action === 'MULTIPLY_TIME') {
      setTimeRemaining((prev) => prev + 3);
    }
  };

  const finishMatch = async (
    finalLog: { questionId: string; selectedAnswer: string; timeSpentMs: number }[],
    finalScore: number,
  ) => {
    if (!matchData) return;
    setLoading(true);
    try {
      const res = await pvpService.submitMatch({
        matchId: matchData.matchId,
        claimedScore: finalScore,
        auditLog: finalLog,
        usedPowerUps,
      });
      setSubmitResult(res);
      setView('RESULT');
      if (res.result === 'VICTORY') soundManager.playVictory();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al procesar el resultado.');
      setView('LOBBY');
      fetchLobbyData();
    } finally {
      setLoading(false);
    }
  };

  const tier = TIER_CONFIG[lobbyData?.rankTier || 'Bronze'] || TIER_CONFIG.Bronze;

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      <div className="w-full flex flex-col gap-3.5">

        {/* ========================================================= */}
        {/* VISTA 1: LOBBY DE DUELOS 1V1                              */}
        {/* ========================================================= */}
        {view === 'LOBBY' && (
          <>
            {/* HERO ELO CARD */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col justify-between items-center gap-3 relative overflow-hidden">
              <div className="flex items-center gap-3 w-full">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 ${tier.border} ${tier.bg} shadow-md shrink-0`}>
                  {tier.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                    Modo Competitivo 1v1
                  </span>
                  <h1 className="text-base font-black text-white uppercase tracking-wide flex items-center gap-1.5 truncate">
                    <span>Liga de Duelistas</span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full border ${tier.border} ${tier.color} ${tier.bg}`}>
                      {tier.label}
                    </span>
                  </h1>
                  <p className="text-slate-400 text-xs font-mono">
                    ELO: <strong className="text-amber-400">{lobbyData?.userElo || 1000} pts</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowConfigModal(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
              >
                ⚔️ ¡BUSCAR NUEVO DUELO 1V1!
              </button>
            </div>

            {/* PESTAÑAS: DUELOS ACTIVOS VS HISTORIAL */}
            <div className="flex gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'ACTIVE'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ⏳ Duelos Activos / En Espera ({lobbyData?.activeMatches.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('HISTORY')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  activeTab === 'HISTORY'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📜 Historial de Duelos ({lobbyData?.historyMatches.length || 0})
              </button>
            </div>

            {/* LISTA DE DUELOS */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeTab === 'ACTIVE' ? (
              lobbyData?.activeMatches.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  <span className="text-4xl block mb-2">⚔️</span>
                  <h3 className="text-sm font-bold text-slate-300">No tenés duelos activos pendientes.</h3>
                  <p className="text-xs text-slate-500 mt-1">¡Iniciá un nuevo desafío para batirte a duelo!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lobbyData?.activeMatches.map((m) => (
                    <div
                      key={m.id}
                      className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{m.categoryIcon}</span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{m.categoryName}</h4>
                          <span className="text-[10px] text-amber-400 font-mono">
                            {m.status === 'WAITING_OPPONENT' ? '⏳ Esperando que un rival acepte tu desafío' : '⚔️ Duelo en curso'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-black text-slate-300 block">
                          Tu Score: {m.currentUserScore?.toLocaleString('es-AR') || 0} pts
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Publicado el {new Date(m.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              lobbyData?.historyMatches.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                  <span className="text-4xl block mb-2">📜</span>
                  <h3 className="text-sm font-bold text-slate-300">Aún no hay partidas en tu historial.</h3>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lobbyData?.historyMatches.map((m) => {
                    const isWin = m.isCurrentUserWinner;
                    const isDraw = m.winnerId === null;

                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between shadow-lg ${
                          isDraw
                            ? 'bg-slate-900/80 border-slate-700'
                            : isWin
                            ? 'bg-emerald-950/20 border-emerald-500/50'
                            : 'bg-rose-950/20 border-rose-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">
                            {isDraw ? '🤝' : isWin ? '🏆' : '💀'}
                          </span>
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${
                              isDraw ? 'text-slate-400' : isWin ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {isDraw ? 'Empate' : isWin ? 'Victoria' : 'Derrota'}
                            </span>
                            <h4 className="text-xs font-bold text-white">
                              {m.categoryIcon} {m.categoryName}
                            </h4>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-white block">
                            {m.currentUserScore?.toLocaleString('es-AR')} vs {m.opponentScore?.toLocaleString('es-AR')} pts
                          </span>
                          <span className={`text-[10px] font-mono font-bold block ${
                            (m.eloChange || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {(m.eloChange || 0) >= 0 ? `+${m.eloChange}` : m.eloChange} ELO
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </>
        )}

        {/* ========================================================= */}
        {/* VISTA 2: JUEGO DEL DUELO (10 PREGUNTAS EN VIVO)          */}
        {/* ========================================================= */}
        {view === 'PLAYING' && matchData && (
          <div className="flex flex-col gap-6">
            {/* HEADER DE PARTIDA */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center shadow-xl">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block">
                  Duelo 1v1 • {matchData.category.icon} {matchData.category.name}
                </span>
                <h3 className="text-sm font-black text-white">
                  Pregunta {currentQIndex + 1} de {matchData.questions.length}
                </h3>
              </div>

              {/* TEMPORIZADOR */}
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg border-2 ${
                  timeRemaining <= 3 ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse' : 'border-amber-400 bg-amber-400/20 text-amber-300'
                }`}>
                  {timeRemaining}s
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-mono block">Puntos</span>
                  <span className="text-sm font-black text-amber-400 font-mono">
                    {totalScore.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            {/* PREGUNTA & OPCIONES */}
            {matchData.questions[currentQIndex] && (
              <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
                {/* Imagen si es pregunta visual */}
                {matchData.questions[currentQIndex].imageUrl && (
                  <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <Image
                      src={matchData.questions[currentQIndex].imageUrl!}
                      alt="Fotograma"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-bold text-white text-center">
                  {matchData.questions[currentQIndex].text}
                </h2>

                {/* OPCIONES DE RESPUESTA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {matchData.questions[currentQIndex].options.map((option: string, idx: number) => {
                    const isEliminated = eliminatedOptions.includes(option);
                    const isChosen = selectedOption === option;

                    return (
                      <button
                        key={idx}
                        onClick={() => !isEliminated && handleSelectAnswer(option)}
                        disabled={selectedOption !== null || isEliminated}
                        className={`p-4 rounded-2xl text-xs md:text-sm font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                          isEliminated
                            ? 'opacity-20 border-slate-800 bg-slate-950 cursor-not-allowed line-through'
                            : isChosen
                            ? 'bg-amber-400 text-slate-950 border-amber-300 scale-102 font-black shadow-lg shadow-amber-400/30'
                            : 'bg-slate-950/80 border-slate-800 hover:border-amber-400 text-slate-200 hover:bg-slate-800/80'
                        }`}
                      >
                        <span>{option}</span>
                        <span className="text-xs opacity-40 font-mono">#{idx + 1}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* BANDEJA DE POWER-UPS EQUIPADOS */}
            {matchData.powerUps.length > 0 && (
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  ⚡ Tus Power-Ups:
                </span>
                <div className="flex gap-2">
                  {matchData.powerUps.map((p) => {
                    const isUsed = usedPowerUps.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleUsePowerUp(p)}
                        disabled={isUsed || selectedOption !== null}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          isUsed
                            ? 'opacity-30 border-slate-800 bg-slate-950 text-slate-600 cursor-not-allowed'
                            : 'border-amber-400 bg-amber-400/15 text-amber-300 hover:bg-amber-400 hover:text-slate-950 cursor-pointer shadow-md'
                        }`}
                      >
                        ⚡ {p.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 3: RESULTADO FINAL DEL DUELO                        */}
        {/* ========================================================= */}
        {view === 'RESULT' && submitResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl text-center flex flex-col gap-6 max-w-lg mx-auto"
          >
            <div>
              <span className="text-5xl block mb-2">
                {submitResult.result === 'VICTORY'
                  ? '🏆'
                  : submitResult.result === 'DEFEAT'
                  ? '💀'
                  : submitResult.result === 'DRAW'
                  ? '🤝'
                  : '⏳'}
              </span>
              <span className={`text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${
                submitResult.result === 'VICTORY'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-950/40'
                  : submitResult.result === 'DEFEAT'
                  ? 'border-rose-500 text-rose-400 bg-rose-950/40'
                  : 'border-amber-400 text-amber-300 bg-amber-950/40'
              }`}>
                {submitResult.result === 'VICTORY'
                  ? '¡Victoria Épica!'
                  : submitResult.result === 'DEFEAT'
                  ? 'Derrota en el Duelo'
                  : submitResult.result === 'DRAW'
                  ? '¡Empate!'
                  : 'Desafío Publicado'}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
                {submitResult.message}
              </h2>
            </div>

            {/* COMPARATIVA DE PUNTAJES */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-around items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase">Tu Puntaje</span>
                <span className="text-xl font-black text-amber-400 font-mono">
                  {submitResult.myScore.toLocaleString('es-AR')}
                </span>
              </div>
              {submitResult.opponentScore !== undefined && (
                <>
                  <span className="text-slate-600 font-black text-sm">VS</span>
                  <div>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">
                      {submitResult.opponentName || 'Rival'}
                    </span>
                    <span className="text-xl font-black text-slate-300 font-mono">
                      {submitResult.opponentScore.toLocaleString('es-AR')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* VARIACIÓN DE ELO */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nuevo ELO ({submitResult.rankTier}):
              </span>
              <div className="text-right">
                <span className="text-base font-black text-white font-mono block">
                  {submitResult.newEloRating} pts
                </span>
                {submitResult.eloChange !== 0 && (
                  <span className={`text-xs font-mono font-bold ${
                    submitResult.eloChange > 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {submitResult.eloChange > 0 ? `+${submitResult.eloChange}` : submitResult.eloChange} ELO
                  </span>
                )}
              </div>
            </div>

            {/* RECOMPENSAS */}
            {(submitResult.rewards.coins > 0 || submitResult.rewards.xp > 0) && (
              <div className="flex justify-center gap-4 text-xs font-bold font-mono">
                <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-xl">
                  🪙 +{submitResult.rewards.coins} Monedas
                </span>
                <span className="bg-sky-400/10 border border-sky-400/30 text-sky-300 px-3 py-1 rounded-xl">
                  🧠 +{submitResult.rewards.xp} XP
                </span>
              </div>
            )}

            <button
              onClick={() => {
                setView('LOBBY');
                fetchLobbyData();
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer"
            >
              Volver al Lobby de Duelos
            </button>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* MODAL: CONFIGURAR Y BUSCAR DESAFÍO                       */}
        {/* ========================================================= */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl max-w-lg w-full p-6 flex flex-col gap-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowConfigModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center"
              >
                ✕
              </button>

              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
                  Emparejamiento 1v1
                </span>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider mt-0.5">
                  Iniciar Duelo PvP
                </h2>
                <p className="text-slate-400 text-xs mt-0.5">
                  Seleccioná la categoría y hasta 2 cartas de Power-Up para la batalla.
                </p>
              </div>

              {/* SELECTOR DE CATEGORÍA */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Categoría del Duelo:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                >
                  <option value="">🎬 Trivia Mixta Universal (Cualquier Película)</option>
                  {OFFICIAL_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* SELECTOR DE POWER-UPS */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Equipar Power-Ups ({equippedCards.length} / 2):
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Opcional</span>
                </div>

                {myCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                    No tenés cartas con Power-Up en tu inventario.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
                    {myCards.map((uc) => {
                      const isEquipped = equippedCards.includes(uc.cardId);
                      return (
                        <button
                          key={uc.id}
                          type="button"
                          onClick={() => toggleEquipCard(uc.cardId)}
                          className={`p-2 rounded-xl text-left border transition text-xs flex flex-col justify-between ${
                            isEquipped
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="truncate font-bold text-white text-[11px]">
                            {uc.title}
                          </span>
                          <span className="text-[9px] text-amber-400/90 font-mono truncate mt-0.5">
                            ⚡ {uc.powerUpAction?.replace(/_/g, ' ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BOTÓN DE ACCIÓN */}
              <button
                onClick={handleStartChallenge}
                disabled={isStarting}
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer disabled:opacity-50"
              >
                {isStarting ? 'Emparejando...' : '⚔️ ¡ENTRAR AL DUELO!'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
