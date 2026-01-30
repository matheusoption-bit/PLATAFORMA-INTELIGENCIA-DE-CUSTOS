import React, { useState, useEffect, useRef } from 'react';
import { Ruler, HelpCircle } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

export const StepLandArea: React.FC = () => {
  const { state, updateData, setStepValid } = useWizard();
  const { landAreaM2 } = state.data;
  
  // Estado local para a área do terreno
  const initialArea = landAreaM2 || 360;
  const [landArea, setLandArea] = useState<number>(initialArea);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(String(initialArea));
  const inputRef = useRef<HTMLInputElement>(null);

  // Atualiza o contexto quando a área muda
  useEffect(() => {
    if (landArea >= 50) {
      updateData({ landAreaM2: landArea });
    }
  }, [landArea, updateData]);

  // Validação: área mínima de 50m²
  useEffect(() => {
    setStepValid(landArea >= 50);
  }, [landArea, setStepValid]);

  // Foca no input quando entra em modo de edição
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNumberClick = () => {
    setEditValue(String(landArea));
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setEditValue(value);
  };

  const handleEditBlur = () => {
    const numValue = parseInt(editValue);
    if (!isNaN(numValue) && numValue >= 50 && numValue <= 2000) {
      setLandArea(numValue);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEditBlur();
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(String(landArea));
    }
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto pb-10">
      <div className="bg-indigo-50 p-4 rounded-full mb-6">
        <Ruler className="text-indigo-600" size={32} />
      </div>
      
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        Qual é o tamanho do terreno que você está negociando?
      </h2>
      <p className="text-slate-500 mb-10 text-center text-base max-w-xl leading-relaxed">
        Isso ajuda a validar se a área construída que você quer faz sentido para esse lote. 
        A estimativa de custo da obra continua sendo calculada pela área construída — 
        o terreno entra aqui como referência de viabilidade.
      </p>

      {/* Card Principal: Slider de Área */}
      <div className="w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8">
        <div className="flex flex-col items-center justify-center">
          {/* Número clicável/editável */}
          <div className="flex items-baseline gap-2 mb-8">
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                inputMode="numeric"
                value={editValue}
                onChange={handleEditChange}
                onBlur={handleEditBlur}
                onKeyDown={handleEditKeyDown}
                className="text-6xl font-bold text-indigo-600 bg-transparent border-b-2 border-indigo-400 outline-none text-center w-40"
              />
            ) : (
              <span 
                onClick={handleNumberClick}
                className="text-6xl font-bold text-indigo-600 cursor-pointer hover:text-indigo-500 transition-colors"
                title="Clique para digitar"
              >
                {landArea}
              </span>
            )}
            <span className="text-2xl font-medium text-slate-400">m²</span>
          </div>

          {/* Slider */}
          <input
            type="range"
            min="50"
            max="2000"
            step="10"
            value={landArea}
            onChange={(e) => setLandArea(parseInt(e.target.value))}
            className="w-full h-4 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all mb-10 touch-manipulation"
          />

          {/* Presets */}
          <div className="grid grid-cols-4 gap-3 w-full">
            {[200, 360, 500, 800].map((preset) => (
              <button 
                key={preset}
                onClick={() => setLandArea(preset)}
                className={`p-3 rounded-xl border-2 text-sm font-medium transition-all touch-manipulation active:scale-95 ${landArea === preset ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-300 active:bg-slate-50'}`}
              >
                {preset}m²
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Helper text */}
      <p className="flex items-center gap-2 text-sm text-slate-500">
        <HelpCircle size={16} className="flex-shrink-0" />
        Se não souber o número exato, use uma estimativa (vale olhar no anúncio).
      </p>
    </div>
  );
};
