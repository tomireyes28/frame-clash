// web/src/app/play/battle-royale/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  battleRoyaleSocketService,
  BRLobbyUpdatePayload,
  BRMatchStartPayload,
  BRQuestionStartPayload,
  BRRoundEliminationPayload,
  BRMatchEndPayload,
} from '@/services/battle-royale.service';
import { soundManager } from '@/utils/audio';

export default function BattleRoyalePage() {
  const [view, setView] = useState<'LOBBY' | 'PLAYING' | 'ELIMINATION_CUTSCENE' | 'PODIUM'>('LOBBY');

  // Lobby
  const [lobbyData, setLobbyData] = useState<BRLobbyUpdatePayload>({ playerCount: 0, players: [] });
  const [isInQueue, setIsInQueue] = useState(false);

  // Combate
  const [matchInfo, setMatchInfo] = useState<BRMatchStartPayload | null>(null);
  const [questionData, setQuestionData] = useState<BRQuestionStartPayload | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(10);
  const [eliminationCutsceneData, setEliminationCutsceneData] = useState<BRRoundEliminationPayload | null>(null);

  // Podio Final
  const [podiumData, setPodiumData] = useState<BRMatchEndPayload | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const qStartTimeRef = useRef<number>(0);

  useEffect(() => {
    const socket = battleRoyaleSocketService.connect();

    socket.on('lobby_update', (data: BRLobbyUpdatePayload) => {
      setLobbyData(data);
    });

    socket.on('br_match_start', (data: BRMatchStartPayload) => {
      setMatchInfo(data);
      setIsInQueue(false);
      setView('PLAYING');
      soundManager.playVictory();
    });

    socket.on('br_question_start', (data: BRQuestionStartPayload) => {
      setQuestionData(data);
      setSelectedOption(null);
      setRevealedAnswer(null);
      setTimeRemaining(data.timeLimit);
      setView('PLAYING');
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

    socket.on('br_leaderboard_update', (data: { leaderboard: any[] }) => {
      setQuestionData((prev) => (prev ? { ...prev, leaderboard: data.leaderboard } : null));
    });

    socket.on('br_question_result', (data: { correctAnswer: string; leaderboard: any[] }) => {
      if (timerRef.current) clearInterval(timerRef.current);
      setRevealedAnswer(data.correctAnswer);
      setQuestionData((prev) => (prev ? { ...prev, leaderboard: data.leaderboard } : null));
    });

    socket.on('br_round_elimination', (data: BRRoundEliminationPayload) => {
      setEliminationCutsceneData(data);
      setView('ELIMINATION_CUTSCENE');
      soundManager.playIncorrect();
    });

    socket.on('br_match_end', async (data: BRMatchEndPayload) => {
      setPodiumData(data);
      setView('PODIUM');
      soundManager.playVictory();
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch (e) {
        console.error(e);
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      battleRoyaleSocketService.disconnect();
    };
  }, []);

  const handleJoinLobby = () => {
    setIsInQueue(true);
    battleRoyaleSocketService.joinLobby();
  };

  const handleLeaveLobby = () => {
    setIsInQueue(false);
    battleRoyaleSocketService.leaveLobby();
  };

  const handleAnswer = (option: string) => {
    if (selectedOption !== null || !matchInfo) return;
    const timeSpentMs = Math.round(performance.now() - qStartTimeRef.current);
    setSelectedOption(option);
    soundManager.playCorrect();

    battleRoyaleSocketService.submitAnswer(matchInfo.roomId, option, timeSpentMs);
  };

  return (
    <div className="w-full flex flex-col items-center p-3 pb-8 font-sans">
      <div className="w-full flex flex-col gap-3.5">

        {/* ========================================================= */}
        {/* VISTA 1: LOBBY DE ESPERA (SALA DE 10 JUGADORES)          */}
        {/* ========================================================= */}
        {view === 'LOBBY' && (
          <div className="flex flex-col gap-3.5">
            {/* HERO CARD */}
            <div className="bg-gradient-to-r from-amber-950/60 to-slate-900 border border-amber-500/50 p-4 rounded-3xl shadow-xl flex flex-col justify-between items-center gap-3">
              <div>
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-500/40 inline-block mb-1">
                  👑 Modo Supervivencia Masiva
                </span>
                <h1 className="text-xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                  Battle Royale (10 Jugadores)
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">
                  5 Rondas de eliminación directa. Los 2 peores puntajes de cada ronda quedan eliminados.
                </p>
              </div>

              {!isInQueue ? (
                <button
                  onClick={handleJoinLobby}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_4px_0_#9a3412] active:translate-y-1 active:shadow-none transition cursor-pointer"
                >
                  ⚔️ ¡ENTRAR AL COLISEO!
                </button>
              ) : (
                <button
                  onClick={handleLeaveLobby}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-2xl border border-slate-700 transition"
                >
                  Cancelar Espera
                </button>
              )}
            </div>

            {/* GRILLA DE 10 CASILLAS DE JUGADORES */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sala de Espera ({lobbyData.playerCount} / 10):
                </h3>
                {isInQueue && (
                  <span className="text-xs font-mono text-amber-400 animate-pulse font-bold">
                    ⏳ Buscando retadores y completando sala...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, idx) => {
                  const player = lobbyData.players[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl border flex flex-col items-center justify-center text-center gap-1.5 transition ${
                        player
                          ? 'bg-amber-950/20 border-amber-400/60 shadow-lg shadow-amber-950/20 scale-102'
                          : 'bg-slate-950/50 border-slate-800/80 text-slate-600'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                        player ? 'bg-amber-400/20 border border-amber-400 text-amber-300' : 'bg-slate-900 text-slate-700'
                      }`}>
                        {player ? '👤' : '🔒'}
                      </div>
                      <span className={`text-xs font-bold truncate max-w-[100px] ${player ? 'text-white' : 'text-slate-600'}`}>
                        {player ? player.name : `Slot #${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 2: ARENA DE COMBATE & SIDEBAR EN VIVO              */}
        {/* ========================================================= */}
        {view === 'PLAYING' && questionData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* COLUMNA PRINCIPAL: PREGUNTA & OPCIONES */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              {/* Header de Ronda */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl flex justify-between items-center shadow-xl">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-widest block">
                    {questionData.round === 4
                      ? '🔥 Semifinal de Supervivientes'
                      : questionData.round === 5
                      ? '👑 Gran Final 1v1'
                      : `Ronda ${questionData.round} de ${questionData.totalRounds}`}
                  </span>
                  <h3 className="text-sm font-black text-white">
                    Pregunta {questionData.questionNumber} de 3 • {questionData.activePlayerCount} Supervivientes
                  </h3>
                </div>

                {/* Cronómetro */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-mono font-black text-lg border-2 ${
                  timeRemaining <= 3
                    ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                    : 'border-amber-400 bg-amber-400/20 text-amber-300'
                }`}>
                  {timeRemaining}s
                </div>
              </div>

              {/* Pregunta */}
              <div className="bg-slate-900/90 border border-slate-800 p-6 md:p-8 rounded-3xl shadow-2xl flex flex-col gap-6">
                {questionData.question.imageUrl && (
                  <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                    <Image
                      src={questionData.question.imageUrl}
                      alt="Fotograma"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  </div>
                )}

                <h2 className="text-lg md:text-xl font-bold text-white text-center">
                  {questionData.question.text}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {questionData.question.options.map((option, idx) => {
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

            {/* COLUMNA LATERAL: TABLA DE SUPERVIVIENTES EN VIVO */}
            <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-3xl shadow-xl flex flex-col gap-3">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <span>🏆</span>
                  <span>Tabla en Vivo</span>
                </span>
                <span className="text-[10px] text-rose-400 font-mono font-bold">
                  💀 Últimos 2 se van
                </span>
              </div>

              <div className="flex flex-col gap-1.5 max-h-[480px] overflow-y-auto">
                {questionData.leaderboard.map((player, idx) => {
                  const isRedZone = idx >= questionData.activePlayerCount - 2 && !player.isEliminated;

                  return (
                    <div
                      key={player.userId}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        player.isEliminated
                          ? 'opacity-30 bg-slate-950 border-slate-900'
                          : isRedZone
                          ? 'bg-rose-950/30 border-rose-500/50 shadow-md shadow-rose-950/30 animate-pulse'
                          : 'bg-slate-950/60 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-5 text-center font-mono text-xs font-black ${
                          idx === 0 ? 'text-amber-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          #{player.rank}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-[100px]">
                            {player.name}
                          </h4>
                          {player.isEliminated ? (
                            <span className="text-[9px] text-rose-500 font-bold block">ELIMINADO</span>
                          ) : player.hasAnswered ? (
                            <span className="text-[9px] text-emerald-400 font-mono block">⚡ Respondió</span>
                          ) : (
                            <span className="text-[9px] text-slate-500 font-mono block">Pensando...</span>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-mono font-black text-amber-400">
                        {player.score.toLocaleString('es-AR')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA 3: CUTSCENE DE ELIMINACIÓN DE RONDA                 */}
        {/* ========================================================= */}
        {view === 'ELIMINATION_CUTSCENE' && eliminationCutsceneData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-rose-500 p-8 rounded-3xl shadow-2xl text-center flex flex-col gap-6 max-w-lg mx-auto"
          >
            <div>
              <span className="text-6xl block mb-2 animate-bounce">💀</span>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-rose-400 bg-rose-950/50 px-3 py-1 rounded-full border border-rose-500/40">
                Fin de la Ronda {eliminationCutsceneData.roundEnded}
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white mt-2 uppercase tracking-wide">
                ¡Corte de Eliminación!
              </h2>
            </div>

            {/* Jugadores Eliminados */}
            <div className="bg-rose-950/30 border border-rose-500/40 p-4 rounded-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 block mb-2">
                Quedan Fuera del Coliseo:
              </span>
              <div className="flex flex-col gap-1.5">
                {eliminationCutsceneData.eliminatedPlayers.map((p) => (
                  <div key={p.userId} className="flex justify-between items-center text-xs font-mono">
                    <span className="text-white font-bold line-through">💀 {p.name}</span>
                    <span className="text-rose-400">{p.score.toLocaleString('es-AR')} pts</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Siguiente Ronda */}
            <p className="text-xs font-mono text-amber-400 animate-pulse">
              ⚡ Preparando Ronda {eliminationCutsceneData.nextRound} con los supervivientes...
            </p>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* VISTA 4: GRAN PODIO FINAL DE BATTLE ROYALE                */}
        {/* ========================================================= */}
        {view === 'PODIUM' && podiumData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border-2 border-amber-400 p-8 rounded-3xl shadow-2xl text-center flex flex-col gap-6 max-w-xl mx-auto"
          >
            <div>
              <span className="text-6xl block mb-2 animate-bounce">👑</span>
              <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest bg-amber-950/60 px-3 py-1 rounded-full border border-amber-400/40 inline-block mb-2">
                Gran Final de Battle Royale
              </span>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent">
                ¡{podiumData.champion.name} es el Campeón!
              </h2>
            </div>

            {/* PODIO TOP 4 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {podiumData.podium.map((p) => (
                <div
                  key={p.rank}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1 ${
                    p.rank === 1
                      ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-950/30'
                      : p.rank === 2
                      ? 'bg-slate-800/40 border-slate-400'
                      : 'bg-slate-900 border-slate-800'
                  }`}
                >
                  <span className="text-2xl">
                    {p.rank === 1 ? '👑' : p.rank === 2 ? '🥈' : '🥉'}
                  </span>
                  <span className="text-xs font-bold text-white truncate max-w-[100px]">
                    {p.name}
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-black">
                    {p.score.toLocaleString('es-AR')} pts
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setView('LOBBY')}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition cursor-pointer"
            >
              Volver al Lobby de Battle Royale
            </button>
          </motion.div>
        )}

      </div>
    </div>
  );
}
