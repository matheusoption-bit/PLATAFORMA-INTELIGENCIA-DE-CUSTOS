import React from 'react';
import { Star, Crown, Home } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { MARKET_DATA } from '../../data/marketData';
import { FinishingStandard } from '../../types';

const DESCRIPTIONS: Record<string, string> = {
  low: "Pisos cerâmicos simples, pintura látex padrão, esquadrias de alumínio linha básica, louças e metais standard.",
  normal: "Porcelanatos médios, massa corrida, pintura acrílica, esquadrias linha intermediária, bancadas em granito comum.",
  high: "Porcelanatos grandes formatos, rebaixo em gesso, esquadrias PVC ou alumínio linha gold, bancadas em quartzo/mármore."
};

export const Step6Standard: React.FC = () => {
  const { state, updateData, goToNextStep } = useWizard();
  const { standard } = state.data;

  const getIcon = (key: string) => {
    switch (key) {
      case 'high': return <Crown size={28} />;
      case 'normal': return <Star size={28} />;
      default: return <Home size={28} />;
    }
  };

  const handleSelect = (key: string) => {
    updateData({ standard: key as FinishingStandard });
    setTimeout(() => goToNextStep(), 300);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-indigo-50 p-4 rounded-full mb-6">
          <Star className="text-indigo-600" size={32} />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center">
          Qual o padrão de acabamento desejado?
        </h2>
        <p className="text-slate-500 text-lg text-center">
          Isso define a qualidade dos materiais como pisos, metais e aberturas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {Object.entries(MARKET_DATA.finishStandards).map(([key, value]) => {
          const isSelected = standard === key;
          const description = DESCRIPTIONS[key] || "Acabamento padrão.";

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={`
                h-full flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-300 touch-manipulation
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm active:scale-[0.98] active:bg-slate-50'}
              `}
            >
              <div className={`p-4 rounded-full flex-shrink-0 transition-colors mb-4 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {getIcon(key)}
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <h3 className={`text-lg md:text-xl font-bold mb-1 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {value.label}
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 mb-3">
                  CUB {value.cubCode}
                </span>
                <p className={`${isSelected ? 'text-indigo-700' : 'text-slate-500'} text-sm leading-relaxed flex-1`}>
                  {description}
                </p>
              </div>

              <div className={`
                mt-4 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isSelected ? 'border-indigo-600' : 'border-slate-300'}
              `}>
                {isSelected && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};