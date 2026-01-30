import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useWizard } from '../../context/WizardContext';
import { MapPin, Search, Check, Edit2 } from 'lucide-react';
import { 
  getNeighborhoodsByCity, 
  searchNeighborhoods,
  hasCityNeighborhoods,
  Neighborhood 
} from '../../data/neighborhoods';
import { MARKET_DATA } from '../../data/marketData';

export const StepNeighborhood: React.FC = () => {
  const { state, updateData, setStepValid } = useWizard();
  const { cityKey, neighborhood, neighborhoodCustom, userName } = state.data;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customValue, setCustomValue] = useState(neighborhoodCustom || '');
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const cityName = MARKET_DATA.cities[cityKey]?.name || cityKey;
  
  // Todos os bairros da cidade
  const allNeighborhoods = useMemo(() => 
    getNeighborhoodsByCity(cityKey), 
    [cityKey]
  );
  
  // Bairros filtrados pela busca
  const filteredNeighborhoods = useMemo(() => 
    searchNeighborhoods(cityKey, searchTerm),
    [cityKey, searchTerm]
  );
  
  // Nome do bairro selecionado
  const selectedNeighborhoodName = useMemo(() => {
    if (neighborhoodCustom) return neighborhoodCustom;
    if (neighborhood) {
      const found = allNeighborhoods.find(n => n.id === neighborhood);
      return found?.name || null;
    }
    return null;
  }, [neighborhood, neighborhoodCustom, allNeighborhoods]);
  
  // Validação do step
  useEffect(() => {
    const isValid = !!(neighborhood || neighborhoodCustom);
    setStepValid(isValid);
  }, [neighborhood, neighborhoodCustom, setStepValid]);
  
  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Seleciona um bairro da lista
  const handleSelectNeighborhood = (n: Neighborhood) => {
    updateData({ 
      neighborhood: n.id, 
      neighborhoodCustom: null 
    });
    setSearchTerm('');
    setIsDropdownOpen(false);
    setShowCustomInput(false);
    setCustomValue('');
  };
  
  // Confirma entrada customizada
  const handleConfirmCustom = () => {
    if (customValue.trim()) {
      updateData({ 
        neighborhood: null, 
        neighborhoodCustom: customValue.trim() 
      });
      setShowCustomInput(false);
      setSearchTerm('');
    }
  };
  
  // Limpa seleção
  const handleClear = () => {
    updateData({ 
      neighborhood: null, 
      neighborhoodCustom: null 
    });
    setSearchTerm('');
    setCustomValue('');
    setShowCustomInput(false);
  };
  
  // Abre input customizado
  const handleShowCustomInput = () => {
    setShowCustomInput(true);
    setIsDropdownOpen(false);
    // Focus no input após render
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const hasNeighborhoodData = hasCityNeighborhoods(cityKey);

  // Fallback seguro para nome do usuário
  const displayName = userName?.trim() || '';

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      {/* Título */}
      <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 text-center mb-2">
        {displayName ? `${displayName}, em` : 'Em'} qual bairro de {cityName}?
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Isso nos ajuda a entender melhor a localização do seu terreno
      </p>

      <div className="w-full max-w-md mx-auto space-y-6">
        
        {/* Seleção atual */}
        {selectedNeighborhoodName && !showCustomInput && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Bairro selecionado</p>
                <p className="text-green-800 font-semibold">{selectedNeighborhoodName}</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-green-600 hover:text-green-800 p-2 hover:bg-green-100 rounded-lg transition-colors"
              title="Alterar bairro"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Campo de busca com dropdown */}
        {(!selectedNeighborhoodName || showCustomInput) && hasNeighborhoodData && (
          <div ref={dropdownRef} className="relative">
            {!showCustomInput && (
              <>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                    placeholder="Buscar bairro..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                
                {/* Dropdown de resultados */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredNeighborhoods.length > 0 ? (
                      <>
                        {filteredNeighborhoods.slice(0, 10).map((n) => (
                          <button
                            key={n.id}
                            onClick={() => handleSelectNeighborhood(n)}
                            className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                          >
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{n.name}</span>
                            {n.zone && (
                              <span className="ml-auto text-xs text-gray-400 capitalize">
                                {n.zone}
                              </span>
                            )}
                          </button>
                        ))}
                        
                        {filteredNeighborhoods.length > 10 && (
                          <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                            +{filteredNeighborhoods.length - 10} bairros...
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <p className="mb-3">Nenhum bairro encontrado</p>
                        <button
                          onClick={handleShowCustomInput}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Digitar manualmente →
                        </button>
                      </div>
                    )}
                    
                    {/* Opção de digitar manualmente sempre visível */}
                    {filteredNeighborhoods.length > 0 && (
                      <button
                        onClick={handleShowCustomInput}
                        className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 border-t border-gray-200 font-medium"
                      >
                        Não encontrei meu bairro →
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            
            {/* Input customizado */}
            {showCustomInput && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Digite o nome do bairro
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  placeholder="Ex: Jardim das Flores"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmCustom();
                    if (e.key === 'Escape') {
                      setShowCustomInput(false);
                      setCustomValue('');
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleConfirmCustom}
                    disabled={!customValue.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomValue('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Fallback se não houver dados de bairros */}
        {!hasNeighborhoodData && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Digite o nome do bairro
            </label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => {
                setCustomValue(e.target.value);
                if (e.target.value.trim()) {
                  updateData({ 
                    neighborhood: null, 
                    neighborhoodCustom: e.target.value.trim() 
                  });
                } else {
                  updateData({ 
                    neighborhood: null, 
                    neighborhoodCustom: null 
                  });
                }
              }}
              placeholder="Ex: Centro, Jardim das Flores..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        )}
        
        {/* Info text */}
        <p className="text-sm text-gray-500 text-center mt-4">
          <MapPin className="inline w-4 h-4 mr-1 -mt-0.5" />
          {hasNeighborhoodData 
            ? `${allNeighborhoods.length} bairros disponíveis em ${cityName}`
            : 'Digite o nome do seu bairro'
          }
        </p>
      </div>
    </div>
  );
};
