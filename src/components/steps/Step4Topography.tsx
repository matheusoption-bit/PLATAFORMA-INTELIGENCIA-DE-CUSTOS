import React, { useEffect } from 'react';
import { MoveHorizontal, TrendingUp, Mountain } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { TopographyType } from '../../types';

export const Step4Topography: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { topography } = state.data;

  useEffect(() => {
    setStepValid(!!topography);
  }, [topography]);

  const handleSelect = (key: TopographyType) => {
    updateData({ topography: key });
    setTimeout(() => goToNextStep(), 300);
  };

  const options: { key: TopographyType; label: string; icon: React.ReactNode; desc: string }[] = [
    { 
      key: 'flat', 
      label: 'Plano', 
      icon: <MoveHorizontal size={40} />,
      desc: 'Terreno nivelado. Menor custo de fundação e movimento de terra.'
    },
    { 
      key: 'slope_light', 
      label: 'Aclive/Declive Leve', 
      icon: <TrendingUp size={40} />,
      desc: 'Inclinação suave. Requer pequenos muros de arrimo e ajustes.'
    },
    { 
      key: 'slope_high', 
      label: 'Aclive/Declive Acentuado', 
      icon: <Mountain size={40} />,
      desc: 'Terreno íngreme. Elevado custo de estrutura, contenções e terraplanagem.'
    }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto px-4 md:px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col items-center mb-10">
        <div className="bg-indigo-50 p-4 rounded-full mb-6">
          <Mountain className="text-indigo-600" size={32} />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center">
          Como é a topografia do terreno?
        </h2>
        <p className="text-slate-500 text-center text-lg">
          Isso influencia diretamente nos custos de fundação e terraplanagem.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 items-stretch">
        {options.map((option) => {
          const isSelected = topography === option.key;
          return (
            <button
              key={option.key}
              onClick={() => handleSelect(option.key)}
              className={`
                h-full flex flex-col items-center text-center p-6 md:p-8 rounded-2xl border-2 transition-all duration-200 touch-manipulation
                ${isSelected 
                  ? 'border-indigo-600 bg-indigo-50 shadow-md' 
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 active:scale-[0.98] active:bg-slate-50'}
              `}
            >
              <div className={`p-4 rounded-xl mb-4 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-600'}`}>
                {option.icon}
              </div>
              
              <div className="flex flex-col items-center flex-1">
                <span className={`block text-lg md:text-xl font-bold mb-2 ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {option.label}
                </span>
                <span className={`text-sm leading-relaxed ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                  {option.desc}
                </span>
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