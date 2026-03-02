// web/src/app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { TmdbService, TmdbMovie } from '@/services/tmdb.service';
import MovieModal from '@/components/admin/MovieModal'; 
import { CardsService } from '@/services/cards.service';

const GENRES = [
  { id: '', name: 'Todos los géneros' },
  { id: '28', name: 'Acción' },
  { id: '12', name: 'Aventura' },
  { id: '878', name: 'Ciencia Ficción' },
  { id: '35', name: 'Comedia' },
  { id: '18', name: 'Drama' },
  { id: '14', name: 'Fantasía' },
  { id: '27', name: 'Terror' },
  { id: '53', name: 'Suspense' }
];

export default function AdminDashboard() {
  const [movies, setMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [dbCards, setDbCards] = useState<any[]>([]);
  
  const [query, setQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxYear, setMaxYear] = useState('');

  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);

  // Al iniciar, buscamos las de TMDB y también nuestro inventario de la DB
  useEffect(() => {
    fetchPopular();
    fetchInventory();
  }, [selectedGenre, minYear, maxYear]);

  // Función para traer tu inventario
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
      const data = await TmdbService.getPopular(selectedGenre, minYear, maxYear);
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
    
    setSelectedGenre(''); setMinYear(''); setMaxYear('');
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
      // ACTUALIZAMOS EL INVENTARIO SIN RECARGAR LA PÁGINA
      await fetchInventory(); 
      setSelectedMovie(null); 
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ ERROR: ${errorMessage}`);
    }
  };

  // 🔥 CÁLCULO DE ESTADÍSTICAS EN TIEMPO REAL
  const stats = dbCards.reduce((acc, card) => {
    acc[card.rarity] = (acc[card.rarity] || 0) + 1;
    acc.total += 1;
    return acc;
  }, { total: 0, COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 });

  return (
    <div className="min-h-screen bg-[#0f3a61] text-white p-8 relative">
      <header className="mb-6 border-b border-gray-700 pb-6 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black text-[#E50914] tracking-wider drop-shadow-md">
              FRAME CLASH
            </h1>
            <p className="text-gray-300 font-light mt-1">Panel de Curación (Admin)</p>
          </div>
          
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text" placeholder="Buscar peli exacta..." value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="px-4 py-2 rounded bg-[#09090b] border border-gray-600 focus:outline-none focus:border-[#E50914] text-white w-64"
            />
            <button type="submit" className="px-4 py-2 bg-[#E50914] font-bold rounded hover:bg-red-700 transition-colors">
              Buscar
            </button>
          </form>
        </div>

        <div className="flex gap-4 p-4 bg-[#09090b] rounded-lg border border-gray-700 items-center">
          <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Explorar:</span>
          
          <select value={selectedGenre} onChange={(e) => { setQuery(''); setSelectedGenre(e.target.value); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm focus:border-[#E50914] outline-none">
            {GENRES.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>

          <input type="number" placeholder="Año Min" value={minYear} onChange={(e) => { setQuery(''); setMinYear(e.target.value); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm w-32 focus:border-[#E50914] outline-none" />
          <input type="number" placeholder="Año Max" value={maxYear} onChange={(e) => { setQuery(''); setMaxYear(e.target.value); }} className="px-3 py-2 bg-[#0f3a61] border border-gray-600 rounded text-sm w-32 focus:border-[#E50914] outline-none" />
          
          <button onClick={() => { setSelectedGenre(''); setMinYear(''); setMaxYear(''); setQuery(''); }} className="text-xs text-gray-400 hover:text-white underline ml-auto">
            Limpiar Filtros
          </button>
        </div>

        {/* 🔥 BARRA DE ESTADÍSTICAS */}
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => {
            // 🔥 CHEQUEAMOS SI LA PELI YA EXISTE EN NUESTRA DB
            const isAdded = dbCards.some(card => card.tmdbId === movie.id);

            return (
              <div 
                key={movie.id} 
                className={`bg-[#09090b] rounded-lg overflow-hidden border transition-all flex flex-col relative
                  ${isAdded ? 'border-green-500 opacity-80 cursor-default' : 'border-gray-700 hover:border-[#E50914] hover:scale-105 cursor-pointer group shadow-lg'}`}
                onClick={() => !isAdded && setSelectedMovie(movie)} // Solo abre el modal si NO está agregada
              >
                {/* 🔥 OVERLAY VERDE SI YA EXISTE */}
                {isAdded && (
                  <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                    <span className="bg-green-600 text-white px-4 py-2 rounded-lg font-black tracking-widest shadow-xl rotate-12 border-2 border-green-400">
                      AGREGADA
                    </span>
                  </div>
                )}

                <div className="relative w-full aspect-2/3 bg-gray-800">
                  {movie.poster_path ? (
                    <Image src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw" className="object-cover" priority={false} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <span className="text-sm text-gray-500">Sin póster</span>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 z-0">
                  <h3 className={`font-bold text-sm truncate transition-colors ${!isAdded && 'group-hover:text-[#E50914]'}`}>{movie.title}</h3>
                  <p className="text-xs text-gray-400 mt-1">{movie.release_date ? movie.release_date.substring(0, 4) : 'Año desconocido'}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} onSave={handleSaveCard} />
      )}
    </div>
  );
}