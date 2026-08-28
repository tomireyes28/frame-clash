// web/src/app/admin/collections/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { collectionsService, CreateCollectionPayload } from '@/services/collections.service';
import { CardsService, VaultCard } from '@/services/cards.service';
import Link from 'next/link';

interface AdminCollectionItem {
  id: string;
  name: string;
  description: string | null;
  rewardType: 'COINS' | 'STARDUST' | 'PACK';
  rewardValue: string;
  isActive: boolean;
  cards: VaultCard[];
}

export default function AdminCollectionsPage() {
  const [collections, setCollections] = useState<AdminCollectionItem[]>([]);
  const [allCards, setAllCards] = useState<VaultCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rewardType, setRewardType] = useState<'COINS' | 'STARDUST' | 'PACK'>('COINS');
  const [rewardValue, setRewardValue] = useState('500');
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [cols, cards] = await Promise.all([
        collectionsService.getAdminCollections(),
        CardsService.getAllCards(),
      ]);
      setCollections(cols);
      setAllCards(cards);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleCardSelection = (cardId: string) => {
    if (selectedCardIds.includes(cardId)) {
      setSelectedCardIds(selectedCardIds.filter((id) => id !== cardId));
    } else {
      setSelectedCardIds([...selectedCardIds, cardId]);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresá un nombre para la colección.');
      return;
    }
    if (selectedCardIds.length === 0) {
      alert('Por favor seleccioná al menos una carta para el set.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    const payload: CreateCollectionPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      rewardType,
      rewardValue,
      cardIds: selectedCardIds,
    };

    try {
      await collectionsService.createCollection(payload);
      setStatusMessage('¡Set de colección curado creado con éxito! 🎉');
      setName('');
      setDescription('');
      setSelectedCardIds([]);
      setRewardValue('500');
      await loadData();
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Error al crear colección.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCollection = async (id: string, colName: string) => {
    if (!confirm(`¿Estás seguro de eliminar el set "${colName}"?`)) return;

    try {
      await collectionsService.deleteCollection(id);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la colección.');
    }
  };

  const filteredCards = allCards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans pb-24">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-slate-800 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
            Panel de Curación
          </span>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-wider text-white">
            Gestión de Sets & Álbumes Curados
          </h1>
        </div>

        <div className="flex gap-2">
          <Link
            href="/collections"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            👁️ Ver como Jugador
          </Link>
          <Link
            href="/admin/vault"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            🏛️ Bóveda de Cartas
          </Link>
        </div>
      </div>

      {statusMessage && (
        <div className="max-w-6xl mx-auto mb-6 bg-emerald-950 border border-emerald-500 text-emerald-300 p-4 rounded-2xl text-center text-sm font-bold">
          {statusMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULARIO DE CREACIÓN (IZQUIERDA) */}
        <form
          onSubmit={handleCreateCollection}
          className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 shadow-xl"
        >
          <h2 className="text-lg font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
            ➕ Crear Nuevo Set Curado
          </h2>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
              Nombre del Set / Saga:
            </label>
            <input
              type="text"
              placeholder="Ej: Trilogía El Señor de los Anillos"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
              Descripción:
            </label>
            <textarea
              placeholder="Ej: Reúne las 3 obras maestras de Peter Jackson..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Tipo de Recompensa:
              </label>
              <select
                value={rewardType}
                onChange={(e) => setRewardType(e.target.value as 'COINS' | 'STARDUST' | 'PACK')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              >
                <option value="COINS">Monedas 🪙</option>
                <option value="STARDUST">Polvo Estelar ✨</option>
                <option value="PACK">Sobre de Cartas 📦</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-slate-400 block mb-1">
                Valor / Tipo de Premio:
              </label>
              <input
                type="text"
                placeholder="Ej: 500, 100 o SILVER"
                value={rewardValue}
                onChange={(e) => setRewardValue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          {/* SELECTOR DE CARTAS */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">
                Seleccionar Cartas ({selectedCardIds.length} elegidas):
              </label>
              <span className="text-[10px] text-amber-400 font-mono">
                {allCards.length} en la base de datos
              </span>
            </div>

            <input
              type="text"
              placeholder="Filtrar cartas por título..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 mb-2 focus:outline-none focus:border-amber-400"
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1 bg-slate-950 p-2 rounded-2xl border border-slate-800">
              {filteredCards.map((card) => {
                const isSelected = selectedCardIds.includes(card.id);

                return (
                  <div
                    key={card.id}
                    onClick={() => toggleCardSelection(card.id)}
                    className={`aspect-[2/3] rounded-xl overflow-hidden relative cursor-pointer border-2 transition-all ${
                      isSelected
                        ? 'border-amber-400 scale-102 shadow-md shadow-amber-400/40 ring-2 ring-amber-400/40'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {card.posterPath ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w200${card.posterPath}`}
                        alt={card.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center p-1 text-[9px] text-center text-slate-400 font-bold">
                        {card.title}
                      </div>
                    )}

                    {isSelected && (
                      <div className="absolute top-1 right-1 bg-amber-400 text-slate-950 rounded-full w-4 h-4 flex items-center justify-center font-black text-[10px]">
                        ✓
                      </div>
                    )}

                    <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-center">
                      <span className="text-[8px] font-bold text-white block truncate">
                        {card.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || selectedCardIds.length === 0}
            className="w-full mt-2 py-3.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-950/50 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Guardando Set...' : '🚀 Guardar y Publicar Set Curado'}
          </button>
        </form>

        {/* LISTADO DE SETS EXISTENTES (DERECHA) */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <h2 className="text-lg font-black uppercase tracking-wider text-slate-200">
            📚 Sets Publicados ({collections.length})
          </h2>

          {collections.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 text-xs">
              No hay sets creados todavía. Utilizá el formulario de la izquierda para armar tu primer set curado.
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[750px] overflow-y-auto pr-1">
              {collections.map((col) => (
                <div
                  key={col.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-white uppercase">{col.name}</h4>
                      {col.description && (
                        <p className="text-xs text-slate-400">{col.description}</p>
                      )}
                      <span className="text-[10px] text-amber-400 font-mono mt-1 block">
                        Premio: {col.rewardValue} ({col.rewardType}) • {col.cards.length} cartas
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteCollection(col.id, col.name)}
                      className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 bg-rose-950/40 rounded-lg border border-rose-800/40"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {col.cards.map((c) => (
                      <div
                        key={c.id}
                        className="w-12 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border border-slate-800 relative"
                      >
                        {c.posterPath ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${c.posterPath}`}
                            alt={c.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-950 text-[8px] flex items-center justify-center p-1 text-center">
                            {c.title}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
