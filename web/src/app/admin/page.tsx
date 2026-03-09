// web/src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TmdbService, TmdbMovie } from '@/services/tmdb.service';
import MovieModal from '@/components/admin/MovieModal'; 
import { CardsService, VaultCard } from '@/services/cards.service';

const TMDB_SEARCH_GENRES = [
  { id: '', name: 'Todos los géneros' },
  { id: '28', name: 'Acción' },
  { id: '12', name: 'Aventura' },
  { id: '878', name: 'Ciencia Ficción' },
  { id: '35', name: 'Comedia' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasía' },
  { id: '27', name: 'Terror' },
];

export default function AdminDashboard() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbCards, setDbCards] = useState<VaultCard[]>([]);
  
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // 🔥 Estado de paginación

  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);

  useEffect(() => {
    fetchPopular();
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, minYear, maxYear, currentPage]); // 🔥 Reacciona al cambio de página

  const fetchInventory = async () => {
    try {
      const cards = await CardsService.getAllCards();
      setDbCards(cards);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchPopular = async () => {
    setLoading(true);
    try {
      // 🔥 Pasamos el currentPage a la API
      const data = await TmdbService.getPopular(selectedGenre, minYear, maxYear, currentPage);
      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return fetchPopular();
    
    setSelectedGenre(''); 
    setMinYear(''); 
    setMaxYear('');
    setCurrentPage(1); // 🔥 Volvemos a la página 1 al buscar
    
    setLoading(true);
    try {
      const data = await TmdbService.search(query, 1);
      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally { setLoading(false); }
  };

  const handleSaveCard = async (movie: TmdbMovie, rarity: string, categories: string[]) => {
    try {
      await CardsService.saveCard(movie, rarity, categories);
      await fetchInventory(); 
      setSelectedMovie(null); 
    } catch (error) {
      alert(`❌ ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const stats = dbCards.reduce((acc: Record<string, number>, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { total: 0, COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 });

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white p-8 relative">
      <header className="mb-6 border-b border-gray-700 pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#E50914] tracking-wider drop-shadow-md">FRAME CLASH</h1>
            <p className="text-gray-300 font-light mt-1">La Forja del Admin</p>
          </div>
          
          <div className="flex gap-4 items-center">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text" placeholder="Buscar peli exacta..." value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="px-4 py-2 rounded bg-[#09090b] border border-gray-600 focus:border-[#E50914] outline-none w-64"
              />
              <button type="submit" className="px-4 py-2 bg-[#E50914] font-bold rounded hover:bg-red-700 transition-colors">
                Buscar
              </button>
            </form>
            
            <Link href="/admin/vault" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 font-bold rounded transition-colors shadow-lg">
              🏦 Ir a La Bóveda
            </Link>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-[#09090b] rounded-lg border border-gray-700 items-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Explorar TMDB:</span>
          
          {/* 🔥 Agregamos setCurrentPage(1) al cambiar filtros */}
          <select value={selectedGenre} onChange={(e) => { setQuery(''); setSelectedGenre(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm outline-none">
            {TMDB_SEARCH_GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <input type="number" placeholder="Año Min" value={minYear} onChange={(e) => { setQuery(''); setMinYear(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm w-32 outline-none" />
          <input type="number" placeholder="Año Max" value={maxYear} onChange={(e) => { setQuery(''); setMaxYear(e.target.value); setCurrentPage(1); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm w-32 outline-none" />
          
          <button onClick={() => { setSelectedGenre(''); setMinYear(''); setMaxYear(''); setQuery(''); setCurrentPage(1); }} className="text-xs text-gray-400 hover:text-white underline ml-auto">
            Limpiar Filtros
          </button>
        </div>

        <div className="flex gap-4 text-sm font-bold bg-[#09090b] p-3 rounded border border-gray-800 shadow-inner justify-between items-center">
          <span className="text-white bg-gray-700 px-3 py-1 rounded">Total Cartas: {stats.total}</span>
          <div className="flex gap-4">
            <span className="text-gray-300">⚪ Común: {stats.COMMON}</span>
            <span className="text-green-400">🟢 P. Común: {stats.UNCOMMON}</span>
            <span className="text-blue-400">🔵 Rara: {stats.RARE}</span>
            <span className="text-purple-400">🟣 Épica: {stats.EPIC}</span>
            <span className="text-yellow-400">🟡 Legendaria: {stats.LEGENDARY}</span>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-xl animate-pulse text-[#E50914] font-bold">Cargando la bóveda de cine...</p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-4 font-bold">
            Mostrando {movies.length} resultados listos para forjar
          </p>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {movies.map((movie) => {
              const isAdded = dbCards.some(card => card.tmdbId === movie.id);

              return (
                <div 
                  key={movie.id} 
                  className={`bg-[#09090b] rounded-lg overflow-hidden border transition-all flex flex-col relative
                    ${isAdded ? 'border-green-500 opacity-60 cursor-default' : 'border-gray-700 hover:border-[#E50914] hover:scale-105 cursor-pointer group shadow-lg'}`}
                  onClick={() => !isAdded && setSelectedMovie(movie)} 
                >
                  {isAdded && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                      <span className="bg-green-600 text-white px-2 py-1 rounded text-[10px] font-black tracking-widest shadow-xl rotate-12 border border-green-400">
                        LISTA
                      </span>
                    </div>
                  )}

                  <div className="relative w-full aspect-2/3 bg-gray-800">
                    {movie.poster_path ? (
                      <Image 
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                        alt={movie.title} 
                        fill 
                        sizes="(max-width: 768px) 33vw, 10vw" 
                        className="object-cover" 
                        priority={false} 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                        <span className="text-[10px] text-gray-500">Sin póster</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2 flex-1 z-0 bg-linear-to-t from-black to-transparent">
                    <h3 className={`font-bold text-[11px] leading-tight line-clamp-2 transition-colors ${!isAdded && 'group-hover:text-[#E50914]'}`}>
                      {movie.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🔥 CONTROLES DE PAGINACIÓN */}
          {movies.length > 0 && (
            <div className="flex justify-center items-center gap-6 mt-12 mb-8">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg border border-gray-600 transition-colors"
              >
                ◀ Anterior
              </button>
              
              <span className="text-gray-400 font-bold bg-[#09090b] px-4 py-2 rounded-lg border border-gray-700">
                Bloque {currentPage}
              </span>
              
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={movies.length < 50} 
                className="px-6 py-2 bg-[#E50914] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
              >
                Siguiente 60 ⏵
              </button>
            </div>
          )}
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onSave={handleSaveCard} />
      )}
    </div>
  );
}