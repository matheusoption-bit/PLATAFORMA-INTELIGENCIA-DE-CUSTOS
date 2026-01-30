import React, { useEffect } from 'react';
import { useWizard } from '../../context/WizardContext';

export const Step1Intro: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { userName } = state.data;

  // Validação: Nome deve ter pelo menos 2 caracteres
  useEffect(() => {
    setStepValid(userName.trim().length >= 2);
  }, [userName]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userName.trim().length >= 2) {
      goToNextStep();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 text-center leading-tight">
        Qual o seu nome ou como<br/>
        prefere ser chamado?
      </h2>
      
      <div className="w-full max-w-2xl relative group">
        <input
          type="text"
          value={userName}
          onChange={(e) => updateData({ userName: e.target.value })}
          onKeyDown={handleKeyPress}
          placeholder="Digite aqui..."
          autoFocus
          className="w-full bg-transparent border-b-2 border-slate-300 py-4 text-2xl md:text-4xl text-center text-indigo-900 placeholder-slate-300 focus:border-indigo-600 focus:outline-none transition-colors duration-300"
        />
        <p className="text-center mt-6 text-slate-400 text-sm">
          Pressione <span className="font-bold text-indigo-600">Enter ↵</span> para continuar
        </p>
      </div>
    </div>
  );
};