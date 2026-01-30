import React, { useEffect } from 'react';
import { Shield, Building, LayoutGrid, MapPin } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { SiteType } from '../../types';

const SITE_OPTIONS: { key: SiteType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'gated_community',
    label: 'Condomínio Fechado',
    description: 'Com portaria e controle de acesso',
    icon: <Shield size={24} />
  },
  {
    key: 'open_community',
    label: 'Condomínio Aberto',
    description: 'Sem portaria, mas com área comum',
    icon: <Building size={24} />
  },
  {
    key: 'subdivision',
    label: 'Loteamento',
    description: 'Lotes individuais sem área comum',
    icon: <LayoutGrid size={24} />
  },
  {
    key: 'urban_land',
    label: 'Terreno Urbano Comum',
    description: 'Lote urbano independente',
    icon: <MapPin size={24} />
  }
];

export const StepSiteType: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { siteType, userName } = state.data;

  useEffect(() => {
    setStepValid(!!siteType);
  }, [siteType, setStepValid]);

  const handleSelect = (type: SiteType) => {
    updateData({ siteType: type });
    setTimeout(() => goToNextStep(), 300);
  };

  // Fallback seguro para nome do usuário
  const displayName = userName?.trim() || '';

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        {displayName ? `${displayName}, onde` : 'Onde'} será a construção?
      </h2>
      <p className="text-slate-500 mb-10 text-center max-w-lg">
        O tipo de local pode influenciar custos e exigências
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {SITE_OPTIONS.map((option) => {
          const isSelected = siteType === option.key;
          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className={`
                group relative flex items-center p-6 rounded-xl border-2 transition-all duration-200 text-left touch-manipulation cursor-pointer
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-lg scale-105 z-10' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md active:scale-95 active:bg-slate-50'}
              `}
            >
              <div className={`mr-4 p-3 rounded-full ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600'}`}>
                {option.icon}
              </div>
              <div>
                <span className={`block text-lg font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {option.label}
                </span>
                <span className={`text-sm ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {option.description}
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
