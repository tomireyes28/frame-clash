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
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedMovie, setSelectedMovie] = useState<TmdbMovie | null>(null);

  useEffect(() => {
    fetchPopular();
    fetchInventory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenre, minYear, maxYear, currentPage]);

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
      const data = await TmdbService.getPopular(selectedGenre, minYear, maxYear, currentPage);
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

    setSelectedGenre('');
    setMinYear('');
    setMaxYear('');
    setCurrentPage(1);

    setLoading(true);
    try {
      const data = await TmdbService.search(query, 1);
      setMovies(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (
    movie: TmdbMovie,
    rarity: string,
    categories: string[],
    powerUpAction?: string,
    powerUpValue?: number,
  ) => {
    try {
      await CardsService.saveCard(movie, rarity, categories, powerUpAction, powerUpValue);
      await fetchInventory();
      setSelectedMovie(null);
    } catch (error) {
      alert(`❌ ERROR: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const stats = dbCards.reduce(
    (acc: Record<string, number>, card) => {
      acc[card.rarity] = (acc[card.rarity] || 0) + 1;
      acc.total += 1;
      return acc;
    },
    { total: 0, COMMON: 0, UNCOMMON: 0, RARE: 0, EPIC: 0, LEGENDARY: 0 },
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-6 border-b border-slate-800 pb-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              Panel de Administración
            </span>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-rose-600 bg-clip-text text-transparent uppercase tracking-wider">
              La Forja de Cartas (TMDB)
            </h1>
            <p className="text-slate-400 text-xs mt-0.5 font-medium">
              Explorá películas, asignales su Rareza Oficial y guardalas en la base de datos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 items-center w-full md:w-auto">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 md:flex-initial">
              <input
                type="text"
                placeholder="Buscar película exacta..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-amber-400 outline-none text-xs text-white placeholder-slate-500 w-full md:w-56"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer"
              >
                Buscar
              </button>
            </form>

            <Link
              href="/admin/vault"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              🏛️ Ir a La Bóveda ({stats.total})
            </Link>

            <Link
              href="/admin/collections"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
            >
              📚 Sets Curados
            </Link>
          </div>
        </div>

        {/* FILTROS TMDB */}
        <div className="flex flex-wrap gap-3 p-4 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filtros TMDB:
          </span>

          <select
            value={selectedGenre}
            onChange={(e) => {
              setQuery('');
              setSelectedGenre(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs outline-none focus:border-amber-400 text-white"
          >
            {TMDB_SEARCH_GENRES.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Año Min"
            value={minYear}
            onChange={(e) => {
              setQuery('');
              setMinYear(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs w-28 outline-none focus:border-amber-400 text-white placeholder-slate-500"
          />

          <input
            type="number"
            placeholder="Año Max"
            value={maxYear}
            onChange={(e) => {
              setQuery('');
              setMaxYear(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs w-28 outline-none focus:border-amber-400 text-white placeholder-slate-500"
          />

          <button
            onClick={() => {
              setSelectedGenre('');
              setMinYear('');
              setMaxYear('');
              setQuery('');
              setCurrentPage(1);
            }}
            className="text-xs text-slate-400 hover:text-white underline ml-auto"
          >
            Limpiar Filtros
          </button>
        </div>

        {/* ESTADÍSTICAS RÁPIDAS DE LAS 5 RAREZAS OFICIALES */}
        <div className="flex flex-wrap gap-2 text-xs font-bold bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 items-center justify-between">
          <span className="text-white bg-slate-800 px-3 py-1 rounded-xl">
            Total en DB: {stats.total}
          </span>
          <div className="flex flex-wrap gap-2">
            <span className="bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-lg border border-zinc-600">
              ⚪ Común: {stats.COMMON}
            </span>
            <span className="bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded-lg border border-emerald-500">
              🟢 Inusual: {stats.UNCOMMON}
            </span>
            <span className="bg-sky-950 text-sky-300 px-2.5 py-0.5 rounded-lg border border-sky-400">
              🔵 Rara: {stats.RARE}
            </span>
            <span className="bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded-lg border border-purple-500">
              🟣 Épica: {stats.EPIC}
            </span>
            <span className="bg-amber-950 text-amber-300 px-2.5 py-0.5 rounded-lg border border-amber-400">
              🟡 Legendaria: {stats.LEGENDARY}
            </span>
          </div>
        </div>
      </header>

      {/* GRILLA DE PELÍCULAS */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-400 text-xs font-mono">Buscando películas en TMDB...</p>
          </div>
        ) : (
          <div>
            <p className="text-xs text-slate-400 mb-4 font-bold">
              Mostrando {movies.length} resultados listos para forjar
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {movies.map((movie) => {
                const isAdded = dbCards.some((card) => card.tmdbId === movie.id);

                return (
                  <div
                    key={movie.id}
                    className={`bg-slate-900 rounded-2xl overflow-hidden border transition-all flex flex-col relative ${
                      isAdded
                        ? 'border-emerald-500 opacity-60 cursor-default'
                        : 'border-slate-800 hover:border-amber-400 hover:scale-103 cursor-pointer group shadow-lg'
                    }`}
                    onClick={() => !isAdded && setSelectedMovie(movie)}
                  >
                    {isAdded && (
                      <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-xl rotate-12 border border-emerald-400">
                          EN BÓVEDA
                        </span>
                      </div>
                    )}

                    <div className="relative w-full aspect-[2/3] bg-slate-950">
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                          alt={movie.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 15vw"
                          className="object-cover"
                          priority={false}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                          <span className="text-[10px] text-slate-500">Sin póster</span>
                        </div>
                      )}
                    </div>

                    <div className="p-2 flex-1 z-0 bg-gradient-to-t from-slate-950 to-transparent">
                      <h3
                        className={`font-bold text-[11px] leading-tight line-clamp-2 transition-colors ${
                          !isAdded && 'group-hover:text-amber-400'
                        }`}
                      >
                        {movie.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {movie.release_date ? movie.release_date.substring(0, 4) : 'N/A'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CONTROLES DE PAGINACIÓN */}
            {movies.length > 0 && (
              <div className="flex justify-center items-center gap-4 mt-10 mb-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl border border-slate-700 text-xs transition"
                >
                  ◀ Anterior
                </button>

                <span className="text-slate-300 font-mono text-xs bg-slate-900 px-4 py-2 rounded-xl border border-slate-800">
                  Página {currentPage}
                </span>

                <button
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={movies.length < 20}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 disabled:opacity-40 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                >
                  Siguiente ⏵
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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