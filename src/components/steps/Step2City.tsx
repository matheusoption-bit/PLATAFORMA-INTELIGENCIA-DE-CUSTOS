import React, { useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { MARKET_DATA } from '../../data/marketData';

export const Step2City: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { cityKey, userName } = state.data;

  useEffect(() => {
    setStepValid(!!cityKey);
  }, [cityKey]);

  const handleSelect = (key: string) => {
    updateData({ cityKey: key });
    setTimeout(() => goToNextStep(), 300);
  };

  // Fallback seguro para nome do usuário
  const displayName = userName?.trim() || '';

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-10 text-center">
        {displayName ? `${displayName}, em` : 'Em'} qual <br /> cidade você pretende construir?
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {Object.entries(MARKET_DATA.cities).map(([key, value]) => {
          const isSelected = cityKey === key;
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`
                group relative flex items-center p-6 rounded-xl border-2 transition-all duration-200 text-left touch-manipulation cursor-pointer
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105 z-10' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-95 active:bg-slate-50'}
              `}
            >
              <div className={`mr-4 p-3 rounded-full ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600'}`}>
                <MapPin size={24} />
              </div>
              <div>
                <span className={`block text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {value.name}
                </span>
                <span className={`text-sm ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                  Santa Catarina
                </span>
              </div>
              
              {isSelected && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};