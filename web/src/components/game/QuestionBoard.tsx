// src/components/game/QuestionBoard.tsx
import React from 'react';
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
  onOptionClick 
}: QuestionBoardProps) {
  return (
    <>
      <div className="w-full max-w-md bg-[#09090b] p-6 rounded-xl shadow-2xl border border-gray-800 mb-8 min-h-37.5 flex items-center justify-center text-center relative z-0">
        <h2 className="text-xl md:text-2xl font-bold">{question.text}</h2>
      </div>

      <div className="w-full max-w-md grid grid-cols-1 gap-4 relative z-0">
        {question.options.map((option, idx) => {
          if (hiddenOptions.includes(option)) {
            return <div key={idx} className="w-full py-4 px-6 invisible" />;
          }

          let bgColor = 'bg-blue-800 hover:bg-blue-700';
          
          if (selectedOption === option) {
            bgColor = isCorrect ? 'bg-green-600' : 'bg-red-600';
          } else if (selectedOption !== null) {
            bgColor = 'bg-gray-700 opacity-50 cursor-not-allowed'; 
          }

          return (
            <button
              key={idx}
              onClick={() => onOptionClick(option)}
              disabled={selectedOption !== null}
              className={`w-full py-4 px-6 rounded-lg text-lg font-bold transition-all duration-200 shadow-md ${bgColor}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </>
  );
}