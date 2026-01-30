import React, { useEffect } from 'react';
import { CalendarDays, Info } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { Container } from '../ui/Container';

export const StepDate: React.FC = () => {
  const { state, updateData, setStepValid, goToNextStep } = useWizard();
  const { startDate } = state.data;

  useEffect(() => {
    setStepValid(!!startDate);
  }, [startDate]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData({ startDate: e.target.value });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && startDate) {
      goToNextStep();
    }
  };

  return (
    <Container className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 text-center leading-tight flex items-center gap-2">
        <CalendarDays className="w-8 h-8 text-indigo-600" />
        Quando o projeto começa?
      </h2>
      <div className="w-full max-w-2xl flex flex-col items-center">
        <input
          type="date"
          value={startDate || ''}
          onChange={handleDateChange}
          onKeyDown={handleKeyPress}
          className="w-full bg-transparent border-b-2 border-slate-300 py-4 text-2xl md:text-4xl text-center text-indigo-900 placeholder-slate-300 focus:border-indigo-600 focus:outline-none transition-colors duration-300 mb-4"
        />
        <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3 mb-6">
          <Info className="w-5 h-5 text-blue-500" />
          <span className="text-blue-700 text-base">
            Esta data define o início do cálculo da inflação (INCC) para o seu projeto.
          </span>
        </div>
        <button
          onClick={goToNextStep}
          disabled={!startDate}
          className="w-full max-w-xs text-lg bg-indigo-600 text-white font-medium py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo
        </button>
      </div>
    </Container>
  );
};

export default StepDate;
