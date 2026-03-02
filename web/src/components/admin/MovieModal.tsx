// web/src/components/admin/MovieModal.tsx
import { useState } from 'react';
import Image from 'next/image';
import { TmdbMovie } from '@/services/tmdb.service';

interface MovieModalProps {
  movie: TmdbMovie;
  onClose: () => void;
  onSave: (movie: TmdbMovie, rarity: string) => void;
}

export default function MovieModal({ movie, onClose, onSave }: MovieModalProps) {
  // Estado local solo para este formulario
  const [rarity, setRarity] = useState('COMMON');

  const handleSave = () => {
    onSave(movie, rarity);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#09090b] border border-gray-700 rounded-xl max-w-2xl w-full flex overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Lado Izquierdo: Póster */}
        <div className="w-1/3 relative bg-gray-900 hidden sm:block">
          {movie.poster_path ? (
            <Image 
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
              alt={movie.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">Sin póster</div>
          )}
        </div>

        {/* Lado Derecho: Controles */}
        <div className="w-full sm:w-2/3 p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{movie.title}</h2>
              <p className="text-[#E50914] text-sm font-bold mt-1">
                {movie.release_date ? movie.release_date.substring(0, 4) : 'Año desconocido'}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-xl font-bold">&times;</button>
          </div>

          <div className="flex-1 space-y-4 py-4">
            {/* Selector de Rareza */}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">Rareza de la Carta</label>
              <select 
                value={rarity}
                onChange={(e) => setRarity(e.target.value)}
                className="w-full bg-[#0f3a61] border border-gray-600 text-white rounded p-3 focus:outline-none focus:border-[#E50914]"
              >
                <option value="COMMON">⚪ Común (60% Drop)</option>
                <option value="RARE">🔵 Rara (25% Drop)</option>
                <option value="EPIC">🟣 Épica (10% Drop)</option>
                <option value="LEGENDARY">🟡 Legendaria (5% Drop)</option>
              </select>
            </div>
            
            {/* Acá a futuro irá el selector de Power-Ups y Categorías */}
            <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded text-sm text-gray-400">
              <p>💡 Tip: Las películas más icónicas deberían ser Épicas o Legendarias para balancear el mazo.</p>
            </div>
          </div>

          {/* Botonera */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-800">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-[#E50914] text-white font-bold rounded shadow-lg hover:bg-red-700 transition-colors"
            >
              Guardar Carta
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}