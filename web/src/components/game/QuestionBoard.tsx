// web/src/components/game/QuestionBoard.tsx
import React from 'react';
import Image from 'next/image';
import { Question } from '@/store/useGameStore';

interface QuestionBoardProps {
  question: Question;
  hiddenOptions: string[];
  selectedOption: string | null;
  isCorrect: boolean | null;
  onOptionClick: (option: string) => void;
}

export default function QuestionBoard({
  question,
  hiddenOptions,
  selectedOption,
  isCorrect,
  onOptionClick,
}: QuestionBoardProps) {
  return (
    <>
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-slate-800 mb-6 flex flex-col items-center justify-center text-center relative z-0">
        {/* Imagen para preguntas visuales (Bloque 5: Fotogramas o Posters Ciegos) */}
        {question.imageUrl && (
          <div className="relative w-full h-44 mb-4 rounded-xl overflow-hidden border border-white/10 shadow-inner">
            <Image
              src={question.imageUrl}
              alt="Pregunta visual"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
              priority
            />
          </div>
        )}

        <h2 className="text-lg md:text-xl font-bold text-white leading-snug">
          {question.text}
        </h2>
      </div>

      <div className="w-full max-w-md grid grid-cols-1 gap-3 relative z-0">
        {question.options.map((option, idx) => {
          if (hiddenOptions.includes(option)) {
            return <div key={idx} className="w-full py-4 px-6 invisible" />;
          }

          let bgColor = 'bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/80';

          if (selectedOption === option) {
            bgColor = isCorrect
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/40 animate-pulse'
              : 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/40';
          } else if (selectedOption !== null) {
            bgColor = 'bg-slate-800/40 border-slate-800 text-slate-500 cursor-not-allowed';
          }

          return (
            <button
              key={idx}
              onClick={() => onOptionClick(option)}
              disabled={selectedOption !== null}
              className={`w-full py-3.5 px-5 rounded-xl text-base md:text-lg font-semibold transition-all duration-200 shadow-md transform active:scale-98 ${bgColor}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </>
  );
}