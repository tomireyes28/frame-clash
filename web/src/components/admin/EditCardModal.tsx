// web/src/components/admin/EditCardModal.tsx
import { useState } from 'react';
import Image from 'next/image';
import { OFFICIAL_CATEGORIES } from '@/utils/categories';
import { VaultCard, CardCategory } from '@/services/cards.service'; // 👈 Importamos los tipos

interface EditModalProps {
  card: VaultCard; 
  onClose: () => void;
  onSave: (id: string, rarity: string, categories: string[]) => void;
}

export default function EditCardModal({ card, onClose, onSave }: EditModalProps) {
  const [rarity, setRarity] = useState(card.rarity);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    card.categories ? card.categories.map((c: CardCategory) => c.key) : []
  );

  const toggleCategory = (key: string) => {
    setSelectedCategories((prev) => 
      prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]
    );
  };

  const handleSave = () => {
    if (selectedCategories.length === 0) {
      alert('⚠️ Debes seleccionar al menos 1 categoría.');
      return;
    }
    onSave(card.id, rarity, selectedCategories);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#09090b] border border-gray-700 rounded-xl max-w-4xl w-full flex overflow-hidden shadow-2xl relative">
        
        {/* Poster */}
        <div className="w-1/3 bg-gray-900 relative hidden md:block">
          {card.posterPath ? (
             <Image src={`https://image.tmdb.org/t/p/w500${card.posterPath}`} alt={card.title} fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">Sin póster</div>
          )}
        </div>

        {/* Controles de Edición */}
        <div className="p-6 flex-1 flex flex-col max-h-[85vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
          
          <h2 className="text-3xl font-black text-blue-500 mb-1">Editar: {card.title}</h2>
          <p className="text-gray-400 text-sm mb-6">{card.year} • RAREZA ACTUAL: {card.rarity}</p>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Nueva Rareza</label>
            <select 
              value={rarity} 
              onChange={(e) => setRarity(e.target.value)}
              className="w-full bg-[#0f3a61] border border-gray-600 rounded p-3 text-white outline-none font-bold"
            >
              <option value="COMMON">⚪ Común</option>
              <option value="UNCOMMON">🟢 Poco Común</option>
              <option value="RARE">🔵 Rara</option>
              <option value="EPIC">🟣 Épica</option>
              <option value="LEGENDARY">🟡 Legendaria</option>
            </select>
          </div>

          <div className="mb-6 flex-1">
            <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">
              Categorías ({selectedCategories.length} seleccionadas)
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#121214] p-4 rounded border border-gray-800 h-64 overflow-y-auto">
              {OFFICIAL_CATEGORIES.map((cat) => (
                <label key={cat.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-800 p-1 rounded transition-colors">
                  <input 
                    type="checkbox" 
                    checked={selectedCategories.includes(cat.key)}
                    onChange={() => toggleCategory(cat.key)}
                    className="accent-blue-500 w-4 h-4"
                  />
                  <span className={`text-sm ${selectedCategories.includes(cat.key) ? 'text-white font-bold' : 'text-gray-400'}`}>
                    {cat.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-auto pt-4 border-t border-gray-800">
            <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white font-bold transition-colors">Cancelar</button>
            <button onClick={handleSave} className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-lg transition-all">
              GUARDAR CAMBIOS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}