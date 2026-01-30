import React, { useState } from 'react';
import { Box, Hammer, Grid, Layers, Package, TrendingDown, TrendingUp, Minus, ChevronDown } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { MARKET_DATA } from '../../data/marketData';
import { ConstructionMethod } from '../../types';

export const Step5Method: React.FC = () => {
  const { state, updateData, goToNextStep } = useWizard();
  const { constructionMethod, maturity } = state.data;
  const [showAll, setShowAll] = useState(false);

  const isProjectProfile = maturity === 'project';
  const shouldShowGrid = isProjectProfile || showAll;

  const getIcon = (key: string) => {
    switch (key) {
      case 'masonry': return <Hammer size={32} />;
      case 'steelFrame': return <Grid size={32} />;
      case 'woodFrame': return <Layers size={32} />;
      case 'eps': return <Box size={32} />;
      case 'container': return <Package size={32} />;
      default: return <Hammer size={32} />;
    }
  };

  const handleSelect = (key: string) => {
    updateData({ constructionMethod: key as ConstructionMethod });
    setTimeout(() => goToNextStep(), 300);
  };

  const renderCard = (key: string, value: any) => {
    const factor = value.factor;
    const isSelected = constructionMethod === key;
    
    let badge = null;
    if (factor < 1.0) {
      badge = (
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
          <TrendingDown size={12} /> Mais Econômico
        </span>
      );
    } else if (factor > 1.0) {
      badge = (
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
          <TrendingUp size={12} /> Investimento Maior
        </span>
      );
    } else {
       badge = (
        <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
          <Minus size={12} /> Padrão de Mercado
        </span>
      );
    }

    return (
      <button
        key={key}
        onClick={() => handleSelect(key)}
        className={`
          group relative flex flex-col items-start p-6 rounded-2xl border-2 transition-all duration-300 text-left h-full w-full touch-manipulation
          ${isSelected 
            ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-[1.02]' 
            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-95 active:bg-slate-50'}
        `}
      >
        <div className={`mb-4 p-3 rounded-full ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50'}`}>
          {getIcon(key)}
        </div>
        
        <div className="flex-1 w-full">
          <div className="flex justify-between items-start mb-2">
            <span className="font-bold text-lg text-slate-800">{value.label}</span>
          </div>
          {badge}
        </div>

        {isSelected && (
          <div className="absolute top-4 right-4 w-4 h-4 bg-indigo-600 rounded-full shadow-[0_0_0_4px_rgba(79,70,229,0.2)]" />
        )}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
       <div className="bg-indigo-50 p-4 rounded-full mb-6">
        <Box className="text-indigo-600" size={32} />
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        Qual método construtivo você deseja utilizar?
      </h2>
      <p className="text-slate-500 mb-10 text-center text-lg max-w-2xl">
        A escolha do sistema construtivo impacta no prazo de execução e no custo final da obra.
      </p>
      
      {!shouldShowGrid ? (
        <div className="w-full max-w-md flex flex-col items-center gap-6 animate-in fade-in">
          {renderCard('masonry', MARKET_DATA.constructionMethods.masonry)}
          
          <button 
            onClick={() => setShowAll(true)}
            className="flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 hover:bg-indigo-50 px-4 py-2 rounded-lg transition-colors touch-manipulation"
          >
            Quero escolher outro método <ChevronDown size={20} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl animate-in zoom-in-95 duration-500">
          {Object.entries(MARKET_DATA.constructionMethods).map(([key, value]) => renderCard(key, value))}
        </div>
      )}
    </div>
  );
};