import React, { useEffect } from 'react';
import { Check, X, MapPin, Handshake } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { LandStatus } from '../../types';

interface LandOption {
  status: LandStatus;
  label: string;
  helper: string;
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
}

const LAND_OPTIONS: LandOption[] = [
  {
    status: 'owned',
    label: 'Sim, já tenho',
    helper: 'Vamos considerar características reais do seu terreno.',
    icon: <Check size={32} />,
    iconBgClass: 'bg-emerald-100',
    iconColorClass: 'text-emerald-600',
  },
  {
    status: 'negotiating',
    label: 'Estou negociando',
    helper: 'Vamos usar as informações do lote para validar viabilidade.',
    icon: <Handshake size={32} />,
    iconBgClass: 'bg-amber-100',
    iconColorClass: 'text-amber-600',
  },
  {
    status: 'no',
    label: 'Ainda não',
    helper: 'Vamos usar um cenário-base e você refina depois.',
    icon: <X size={32} />,
    iconBgClass: 'bg-slate-100',
    iconColorClass: 'text-slate-500',
  },
];

export const Step3Terrain: React.FC = () => {
  const { updateData, setStepValid, goToNextStep } = useWizard();

  useEffect(() => {
    setStepValid(true);
  }, [setStepValid]);

  const handleChoice = (status: LandStatus) => {
    if (status === 'owned') {
      updateData({ 
        landStatus: 'owned',
        hasProject: null,
        landAreaM2: null,
      });
    } else if (status === 'negotiating') {
      updateData({ 
        landStatus: 'negotiating',
        hasProject: null, // Não perguntamos sobre projeto para quem está negociando
      });
    } else {
      // status === 'no'
      updateData({ 
        landStatus: 'no',
        hasProject: false,
        landAreaM2: null,
        // Aplicar defaults para cenário-base (sem terreno)
        topography: 'flat',
        constructionMethod: 'masonry',
      });
    }
    setTimeout(() => goToNextStep(), 200);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-indigo-50 p-4 rounded-full mb-6">
          <MapPin className="text-indigo-600" size={32} />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
          Você já tem o terreno?
        </h2>
        <p className="text-slate-500 text-center text-lg max-w-lg">
          Isso define quais informações do lote entram na simulação agora.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {LAND_OPTIONS.map((option) => (
          <button
            key={option.status}
            onClick={() => handleChoice(option.status)}
            className="h-full flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all group touch-manipulation active:scale-[0.98] active:bg-slate-50"
          >
            <div className={`w-16 h-16 rounded-full ${option.iconBgClass} ${option.iconColorClass} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform mb-4`}>
              {option.icon}
            </div>
            <div className="flex flex-col items-center flex-1">
              <span className="text-lg font-bold text-slate-800 group-hover:text-indigo-900 mb-2">
                {option.label}
              </span>
              <span className="text-sm text-slate-500 group-hover:text-slate-600 leading-relaxed">
                {option.helper}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};