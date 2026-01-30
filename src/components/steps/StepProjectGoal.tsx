import React, { useEffect } from 'react';
import { Home, TrendingUp, DollarSign, HelpCircle } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { ProjectGoal } from '../../types';

const GOAL_OPTIONS: { key: ProjectGoal; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'live',
    label: 'Construir para Morar',
    description: 'Será minha residência principal',
    icon: <Home size={24} />
  },
  {
    key: 'invest',
    label: 'Construir para Investir',
    description: 'Para alugar e gerar renda',
    icon: <TrendingUp size={24} />
  },
  {
    key: 'sell',
    label: 'Construir para Vender',
    description: 'Comercializar após a obra',
    icon: <DollarSign size={24} />
  },
  {
    key: 'evaluating',
    label: 'Ainda estou avaliando',
    description: 'Quero entender os custos primeiro',
    icon: <HelpCircle size={24} />
  }
];

export const StepProjectGoal: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { projectGoal, userName } = state.data;

  useEffect(() => {
    setStepValid(!!projectGoal);
  }, [projectGoal, setStepValid]);

  const handleSelect = (goal: ProjectGoal) => {
    updateData({ projectGoal: goal });
    setTimeout(() => goToNextStep(), 300);
  };

  // Fallback seguro para nome do usuário
  const displayName = userName?.trim() || '';

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        {displayName ? `${displayName}, qual` : 'Qual'} é o objetivo da construção?
      </h2>
      <p className="text-slate-500 mb-10 text-center max-w-lg">
        Isso nos ajuda a entender melhor o seu projeto
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
        {GOAL_OPTIONS.map((option) => {
          const isSelected = projectGoal === option.key;
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
