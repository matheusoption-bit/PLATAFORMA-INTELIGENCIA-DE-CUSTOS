import React, { useEffect } from 'react';
import { ScrollText, Ruler } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';

export const Step3ProjectStatus: React.FC = () => {
  const { updateData, setStepValid, goToNextStep } = useWizard();

  useEffect(() => {
    setStepValid(true);
  }, []);

  const handleChoice = (hasProject: boolean) => {
    updateData({ hasProject });
    setTimeout(() => goToNextStep(), 200);
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-indigo-50 p-4 rounded-full mb-6">
        <ScrollText className="text-indigo-600" size={32} />
      </div>

      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 text-center">
        Já possui o projeto de arquitetura?
      </h2>
      <p className="text-slate-500 mb-12 text-center text-lg max-w-lg">
        Isso determina se solicitaremos o quadro de áreas técnico ou uma estimativa conceitual.
      </p>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
        <button
          onClick={() => handleChoice(true)}
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all group touch-manipulation active:scale-95 active:bg-slate-50"
        >
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ScrollText size={32} />
          </div>
          <span className="text-xl font-bold text-slate-800 group-hover:text-indigo-900 mb-2">Sim, tenho projetos</span>
          <p className="text-sm text-slate-500 text-center">Já possuo as metragens exatas de cada pavimento definidas.</p>
        </button>

        <button
          onClick={() => handleChoice(false)}
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50 hover:shadow-lg transition-all group touch-manipulation active:scale-95 active:bg-slate-50"
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Ruler size={32} />
          </div>
          <span className="text-xl font-bold text-slate-800 group-hover:text-indigo-900 mb-2">Apenas o terreno</span>
          <p className="text-sm text-slate-500 text-center">Tenho apenas uma ideia do tamanho que desejo construir.</p>
        </button>
      </div>
    </div>
  );
};