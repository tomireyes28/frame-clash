// web/src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TmdbService, TmdbMovie } from '@/services/tmdb.service';
import MovieModal from '@/components/admin/MovieModal'; 
import { CardsService } from '@/services/cards.service';

export default function AdminDashboard() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  // NUEVO ESTADO: Maneja qué película está abierta en el modal
  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);

  useEffect(() => {
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    setLoading(true);
    try {
      const data = await TmdbService.getPopular();
      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return fetchPopular();
    
    setLoading(true);
    try {
      const data = await TmdbService.search(query);
      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (movie: TmdbMovie, rarity: string) => {
    try {
      await CardsService.saveCard(movie, rarity);
      alert(`✅ ¡ÉXITO! ${movie.title} guardada como carta ${rarity} en tu base de datos.`);
      setSelectedMovie(null); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido';
      alert(`❌ ERROR: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white p-8 relative">
      <header className="mb-8 border-b border-gray-700 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-[#E50914] tracking-wider drop-shadow-md">
            FRAME CLASH
          </h1>
          <p className="text-gray-300 font-light mt-1">Panel de Curación (Admin)</p>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Buscar película..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="px-4 py-2 rounded bg-[#09090b] border border-gray-600 focus:outline-none focus:border-[#E50914] text-white w-64"
          />
          <button type="submit" className="px-4 py-2 bg-[#E50914] font-bold rounded hover:bg-red-700 transition-colors">
            Buscar
          </button>
        </form>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl animate-pulse text-[#E50914] font-bold">Cargando la bóveda de cine...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="bg-[#09090b] rounded-lg overflow-hidden border border-gray-700 hover:border-[#E50914] hover:scale-105 transition-all cursor-pointer group shadow-lg flex flex-col"
              // ACÁ ABRIMOS EL MODAL:
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="relative w-full aspect-2/3 bg-gray-800">
                {movie.poster_path ? (
                  <Image 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                    className="object-cover"
                    priority={false}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                    <span className="text-sm text-gray-500">Sin póster</span>
                  </div>
                )}
              </div>
              
              <div className="p-3 flex-1">
                <h3 className="font-bold text-sm truncate group-hover:text-[#E50914] transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {movie.release_date ? movie.release_date.substring(0, 4) : 'Año desconocido'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RENDERIZADO CONDICIONAL DEL MODAL aisaldo */}
      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onSave={handleSaveCard} 
        />
      )}
    </div>
  );
}