// web/src/app/play/pvp-live/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  pvpSocketService,
  MatchStartPayload,
  QuestionStartPayload,
  LiveScoreUpdatePayload,
  QuestionResultPayload,
  MatchEndPayload,
} from '@/services/pvp-socket.service';
import { inventoryService, InventoryCard } from '@/services/inventory.service';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';
import { soundManager } from '@/utils/audio';

export default function PvpLivePage() {
  const [view, setView] = useState<'LOBBY' | 'MATCHMAKING' | 'PLAYING' | 'RESULT'>('LOBBY');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [myCards, setMyCards] = useState<InventoryCard[]>([]);
  const [equippedCards, setEquippedCards] = useState<string[]>([]);

  // Estado de Combate en Vivo
  const [matchInfo, setMatchInfo] = useState<MatchStartPayload | null>(null);
  const [currentQData, setCurrentQData] = useState<QuestionStartPayload | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(10);

  // Puntajes en vivo
  const [myScore, setMyScore] = useState<number>(0);
  const [opponentScore, setOpponentScore] = useState<number>(0);
  const [opponentAnswered, setOpponentAnswered] = useState<boolean>(false);

  // Resultado Final
  const [matchEndResult, setMatchEndResult] = useState<MatchEndPayload | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qStartTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchInventory();

    const socket = pvpSocketService.connect();

    socket.on('queue_joined', () => {
      setView('MATCHMAKING');
    });

    socket.on('queue_left', () => {
      setView('LOBBY');
    });

    socket.on('match_start', (data: MatchStartPayload) => {
      setMatchInfo(data);
      setMyScore(0);
      setOpponentScore(0);
      setOpponentAnswered(false);
      setView('PLAYING');
      soundManager.playVictory();
    });

    socket.on('question_start', (data: QuestionStartPayload) => {
      setCurrentQData(data);
      setSelectedOption(null);
      setRevealedAnswer(null);
      setOpponentAnswered(false);
      setTimeRemaining(data.timeLimit);
      qStartTimeRef.current = performance.now();

      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          if (prev <= 4) soundManager.playTick();
          return prev - 1;
        });
      }, 1000);
    });

    socket.on('live_score_update', (data: LiveScoreUpdatePayload) => {
      setOpponentScore(data.totalScore);
      setOpponentAnswered(true);
    });

    socket.on('question_result', (data: QuestionResultPayload) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setRevealedAnswer(data.correctAnswer);
      if (isPlayer1()) {
        setMyScore(data.p1Score);
        setOpponentScore(data.p2Score);
      } else {
        setMyScore(data.p2Score);
        setOpponentScore(data.p1Score);
      }
    });

    socket.on('match_end', (data: MatchEndPayload) => {
      setMatchEndResult(data);
      setView('RESULT');
      const isWinner = data.winnerId === (isPlayer1() ? data.player1.userId : data.player2.userId);
      if (isWinner) soundManager.playVictory();
    });

    socket.on('player_forfeit', (data: { message: string }) => {
      alert(`⚡ ${data.message}`);
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      pvpSocketService.disconnect();
    };
  }, []);

  const fetchInventory = async () => {
    try {
      const inventory = await inventoryService.getInventory();
      const withPowerUps = (inventory || []).filter((c) => Boolean(c.powerUpAction));
      setMyCards(withPowerUps);
    } catch (err) {
      console.error(err);
    }
  };

  const isPlayer1 = () => {
    if (!matchInfo) return true;
    const socket = pvpSocketService.getSocket();
    return socket?.id ? true : true; // Fallback
  };

  const handleStartSearching = () => {
    pvpSocketService.joinQueue(selectedCategory || undefined, equippedCards);
  };

  const handleCancelSearch = () => {
    pvpSocketService.leaveQueue();
    setView('LOBBY');
  };

  const handleAnswer = (option: string) => {
    if (selectedOption !== null || !matchInfo) return;
    const timeSpentMs = Math.round(performance.now() - qStartTimeRef.current);
    setSelectedOption(option);
    soundManager.playCorrect();

    pvpSocketService.submitAnswer(matchInfo.roomId, option, timeSpentMs);
  };

  const toggleEquipCard = (cardId: string) => {
    setEquippedCards((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return [prev[1], cardId];
      return [...prev, cardId];
    });
  };

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      <div className="w-full flex flex-col gap-3.5">

        {/* ========================================================= */}
        {/* VISTA 1: LOBBY DE ENTRADA AL COLÍSEO EN VIVO              */}
        {/* ========================================================= */}
        {view === 'LOBBY' && (
          <div className="flex flex-col gap-3.5">
            <div className="bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/50 p-4 rounded-3xl shadow-xl flex flex-col justify-between items-center gap-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-red-400 uppercase tracking-widest bg-red-950/60 px-2.5 py-0.5 rounded-full border border-red-500/40 inline-block mb-1">
                  ⚡ Multijugador Sincrónico
                </span>
                <h1 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-red-500 via-orange-500 to-amber-400 bg-clip-text text-transparent">
                  Coliseo en Vivo 1v1
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  10 preguntas simultáneas donde cada segundo define el puntaje y la variación de ELO.
                </p>
              </div>

              <button
                onClick={handleStartSearching}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 hover:from-red-500 hover:to-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#7f1d1d] active:translate-y-1 active:shadow-none transition cursor-pointer"
              >
                ⚡ ¡BUSCAR PARTIDA EN VIVO!
              </button>
            </div>

            {/* SELECTOR DE CATEGORÍA Y POWER-UPS */}
            <div className="grid grid-cols-1 gap-2.5">
              {/* Categoría */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Categoría del Duelo:
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-amber-400"
                >
                  <option value="">🎬 Trivia Mixta Universal</option>
                  {OFFICIAL_CATEGORIES.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Power-Ups */}
              <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Equipar Cartas ({equippedCards.length} / 2):
                </label>
                {myCards.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2">
                    Sin cartas con Power-Up en el inventario.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {myCards.map((uc) => {
                      const isEquipped = equippedCards.includes(uc.cardId);
                      return (
                        <button
                          key={uc.id}
                          type="button"
                          onClick={() => toggleEquipCard(uc.cardId)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition truncate max-w-[140px] ${
                            isEquipped
                              ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {uc.title}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 2: RADAR DE MATCHMAKING                             */}
        {/* ========================================================= */}
        {view === 'MATCHMAKING' && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
            {/* Radar animado */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-red-500/40 animate-ping" />
              <div className="absolute inset-4 rounded-full border-2 border-amber-400/60 animate-pulse" />
              <div className="w-20 h-20 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-400/20">
                ⚡
              </div>
            </div>

            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest block mb-1">
              Buscando Rival en Vivo...
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white">
              Sintonizando frecuencias del Coliseo
            </h2>
            <p className="text-slate-400 text-xs mt-1 mb-8 max-w-sm">
              Emparejando contra un oponente de ELO similar en tiempo real.
            </p>

            <button
              onClick={handleCancelSearch}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition"
            >
              Cancelar Búsqueda
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 3: PANTALLA DE COMBATE EN TIEMPO REAL              */}
        {/* ========================================================= */}
        {view === 'PLAYING' && matchInfo && currentQData && (
          <div className="flex flex-col gap-6">
            {/* VERSUS HEADER */}
            <div className="bg-slate-900 border-2 border-slate-800 p-4 rounded-3xl flex items-center justify-between shadow-2xl">
              {/* JUGADOR 1 (TÚ) */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400 flex items-center justify-center text-lg shrink-0">
                  👤
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-amber-400 font-mono font-bold block truncate">
                    TÚ
                  </span>
                  <span className="text-base font-black text-white font-mono">
                    {myScore.toLocaleString('es-AR')} pts
                  </span>
                </div>
              </div>

              {/* CRONÓMETRO CENTRAL */}
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg border-2 ${
                  timeRemaining <= 3
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'border-amber-400 bg-amber-400/20 text-amber-300'
                }`}>
                  {timeRemaining}s
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                  Ronda {currentQData.questionIndex + 1}/{currentQData.totalQuestions}
                </span>
              </div>

              {/* JUGADOR 2 (RIVAL) */}
              <div className="flex items-center gap-3 text-right min-w-0">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    {opponentAnswered && (
                      <span className="text-[9px] bg-red-500 text-white font-black px-1 rounded animate-pulse">
                        ⚡ RESPONDIÓ
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono font-bold truncate">
                      {matchInfo.player2.name}
                    </span>
                  </div>
                  <span className="text-base font-black text-slate-300 font-mono">
                    {opponentScore.toLocaleString('es-AR')} pts
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-950/40 border border-red-500/50 flex items-center justify-center text-lg shrink-0">
                  ⚔️
                </div>
              </div>
            </div>

            {/* PREGUNTA & OPCIONES */}
            <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
              {currentQData.question.imageUrl && (
                <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                  <Image
                    src={currentQData.question.imageUrl}
                    alt="Fotograma"
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
              )}

              <h2 className="text-lg md:text-xl font-bold text-white text-center">
                {currentQData.question.text}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentQData.question.options.map((option, idx) => {
                  const isChosen = selectedOption === option;
                  const isCorrect = revealedAnswer !== null && revealedAnswer === option;
                  const isWrong = revealedAnswer !== null && isChosen && revealedAnswer !== option;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedOption !== null || revealedAnswer !== null}
                      className={`p-4 rounded-2xl text-xs md:text-sm font-bold border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isCorrect
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black scale-102 shadow-lg shadow-emerald-500/40'
                          : isWrong
                          ? 'bg-rose-600 text-white border-rose-500 font-black'
                          : isChosen
                          ? 'bg-amber-400 text-slate-950 border-amber-300 font-black scale-102 shadow-lg shadow-amber-400/30'
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
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 4: RESULTADO FINAL DEL DUELO EN VIVO               */}
        {/* ========================================================= */}
        {view === 'RESULT' && matchEndResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-slate-800 p-8 rounded-3xl shadow-2xl text-center flex flex-col gap-6 max-w-lg mx-auto"
          >
            <div>
              <span className="text-6xl block mb-2">
                {matchEndResult.winnerId ? '👑' : '🤝'}
              </span>
              <h2 className="text-3xl font-black uppercase tracking-wide bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                {matchEndResult.winnerId ? '¡Final del Duelo en Vivo!' : '¡Empate Simultáneo!'}
              </h2>
            </div>

            {/* MARCADOR FINAL */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-around items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">{matchEndResult.player1.name}</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {matchEndResult.player1.score.toLocaleString('es-AR')}
                </span>
                <span className={`text-[10px] font-mono font-bold block ${
                  matchEndResult.player1.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {matchEndResult.player1.eloChange >= 0 ? `+${matchEndResult.player1.eloChange}` : matchEndResult.player1.eloChange} ELO
                </span>
              </div>

              <span className="text-slate-600 font-black text-xl">VS</span>

              <div>
                <span className="text-[10px] text-slate-400 font-mono uppercase block">{matchEndResult.player2.name}</span>
                <span className="text-2xl font-black text-slate-300 font-mono">
                  {matchEndResult.player2.score.toLocaleString('es-AR')}
                </span>
                <span className={`text-[10px] font-mono font-bold block ${
                  matchEndResult.player2.eloChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {matchEndResult.player2.eloChange >= 0 ? `+${matchEndResult.player2.eloChange}` : matchEndResult.player2.eloChange} ELO
                </span>
              </div>
            </div>

            <button
              onClick={() => setView('LOBBY')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer"
            >
              Volver al Menú de Duelos en Vivo
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
