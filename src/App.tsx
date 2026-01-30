import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { Container } from './components/ui/Container';
import { WizardProvider, useWizard } from './context/WizardContext';

// Importação dos passos do Wizard
import { Step1Intro } from './components/steps/Step1Intro';
import { Step2City } from './components/steps/Step2City';
import { StepNeighborhood } from './components/steps/StepNeighborhood';
import { StepProjectGoal } from './components/steps/StepProjectGoal';
import { StepSiteType } from './components/steps/StepSiteType';
import { Step3Terrain } from './components/steps/Step3Terrain';
import { StepLandArea } from './components/steps/StepLandArea';
import { Step3ProjectStatus } from './components/steps/Step3ProjectStatus';
import { Step4Topography } from './components/steps/Step4Topography';
import { Step5Method } from './components/steps/Step5Method';
import { Step6Standard } from './components/steps/Step6Standard';
// Correção: Apontando para o arquivo correto renomeado
import { StepDimensionsConceptual as StepDimensionsConceptualComponent } from './components/steps/StepDimensionsConceptual';
import { Step7Dimensions } from './components/steps/Step7Dimensions';
import { Step3Results as Step8Results } from './components/wizard/Step3Results';

// --- COMPONENTE: Landing Page (Tela Inicial Dark) ---
const LandingPage: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-3xl pointer-events-none animate-pulse duration-[5000ms]" />
      <div className="z-10 flex flex-col items-center max-w-5xl px-6 text-center animate-in fade-in duration-1000 slide-in-from-bottom-10">
        <div className="mb-16 md:mb-20">
          <span className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            bautt<span className="text-indigo-500">.</span>
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] mb-8 tracking-wide">
          Planeje sua obra<br />
          <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">com números claros</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-20 font-light leading-relaxed">
          Descubra em minutos o investimento estimado para construir sua residência com dados atualizados de mercado.
        </p>
        <button
          onClick={onStart}
          className="group relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 focus:outline-none"
        >
          <div className="absolute inset-0 rounded-full border border-indigo-600/50 transition-all duration-500 group-hover:border-indigo-400 group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.5)]" />
          <div className="absolute inset-3 rounded-full border border-white/5 group-hover:border-indigo-500/20 transition-colors duration-500" />
          <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-white uppercase group-hover:text-indigo-300 transition-colors">
            Começar
          </span>
        </button>
      </div>
      <div className="absolute bottom-8 right-8 text-xs text-slate-700 font-medium tracking-wide uppercase flex gap-4">
        <span>Device</span>
        <span>PT-BR</span>
      </div>
    </div>
  );
};

// --- COMPONENTE: Wizard Content (Aplicação Principal) ---
const WizardContent: React.FC = () => {
  const { state, goToNextStep, goToPrevStep } = useWizard();
  const { currentStep, isStepValid, data } = state;

  // Lógica de Ramificação (Branching Logic) baseada na Maturidade Inferida
  const getSteps = () => {
    // 1. Intro (Sempre)
    // 2. Cidade (Sempre)
    // 3. Bairro (Sempre)
    // 4. Objetivo do Projeto (Sempre)
    // 5. Tipo de Local (Sempre)
    // 6. Terreno (Sempre - Define landStatus)
    const steps = [
      { id: 'intro', component: <Step1Intro /> },
      { id: 'city', component: <Step2City /> },
      { id: 'neighborhood', component: <StepNeighborhood /> },
      { id: 'project_goal', component: <StepProjectGoal /> },
      { id: 'site_type', component: <StepSiteType /> },
      { id: 'terrain', component: <Step3Terrain /> },
    ];

    // StepLandArea: Apenas para quem está negociando terreno
    if (data.landStatus === 'negotiating') {
      steps.push({ id: 'land_area', component: <StepLandArea /> });
    }

    // Se tem terreno (owned ou negotiating), perguntamos sobre o projeto
    // Mas para 'negotiating', não perguntamos sobre projeto (já foi tratado no Step3Terrain)
    if (data.landStatus === 'owned') {
      steps.push({ id: 'project_status', component: <Step3ProjectStatus /> });
    }

    // Topografia: Apenas para quem tem terreno (owned ou negotiating)
    // Perfil IDEA (landStatus === 'no') assume 'flat' por default
    if (data.landStatus === 'owned' || data.landStatus === 'negotiating') {
      steps.push({ id: 'topography', component: <Step4Topography /> });
    }

    // Método Construtivo:
    // owned/negotiating: Exibe (com lógica interna de opt-in).
    // no: Não exibe (assume masonry).
    if (data.landStatus === 'owned' || data.landStatus === 'negotiating') {
      steps.push({ id: 'method', component: <Step5Method /> });
    }

    // Padrão de Acabamento (Sempre)
    steps.push({ id: 'standard', component: <Step6Standard /> });

    // Dimensionamento:
    // PROJECT = Input Técnico Detalhado
    // IDEA/LAND = Input Conceitual (Slider)
    if (data.maturity === 'project') {
      steps.push({ id: 'dimensions_tech', component: <Step7Dimensions /> });
    } else {
      steps.push({ id: 'dimensions_concept', component: <StepDimensionsConceptualComponent /> });
    }

    // Resultados (Sempre)
    steps.push({ id: 'results', component: <Step8Results /> });

    return steps;
  };

  const steps = getSteps();
  
  // Mapeamento dinâmico de índice
  // O WizardContext mantém um contador linear (1, 2, 3...), mas nossos passos são dinâmicos.
  // currentStep no state é 1-based.
  const currentStepIndex = Math.min(Math.max(0, currentStep - 1), steps.length - 1);
  const currentStepData = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col animate-in fade-in duration-500">
      
      {/* Header Minimalista */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-sm z-30 flex items-center justify-between px-6 border-b border-slate-100 transition-all duration-300">
        <div className="flex items-center gap-2 text-indigo-900">
          <span className="font-bold text-xl tracking-tight cursor-pointer" onClick={() => window.location.reload()}>
            bautt<span className="text-indigo-600">.</span>
          </span>
        </div>
        <div className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          Passo {currentStepIndex + 1} de {totalSteps}
        </div>
      </header>

      {/* Barra de Progresso */}
      <div className="fixed top-16 left-0 w-full h-1 bg-slate-100 z-50">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(79,70,229,0.3)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Área de Conteúdo Central */}
      <main className="flex-1 flex flex-col justify-center pt-24 pb-32">
        <Container>
          <div className="w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto lg:px-4 xl:px-6">
             {/* Key força re-renderização da animação na troca de passo */}
             <div key={currentStepIndex}>
                {currentStepData?.component}
             </div>
          </div>
        </Container>
      </main>

      {/* Navegação Inferior */}
      {currentStepIndex < steps.length - 1 && (
        <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-slate-200 p-6 z-40">
          <Container className="flex justify-between items-center max-w-4xl mx-auto">
            <button
              onClick={goToPrevStep}
              disabled={currentStepIndex === 0}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-colors
                ${currentStepIndex === 0 
                  ? 'text-slate-300 cursor-not-allowed opacity-0' 
                  : 'text-indigo-600 hover:bg-indigo-50'}
              `}
            >
              <ChevronLeft size={18} />
              Voltar
            </button>

            <div className="flex gap-2">
              <button
                onClick={goToNextStep}
                disabled={!isStepValid}
                className={`
                  flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all transform active:scale-95
                  ${isStepValid 
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-200 hover:-translate-y-1' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'}
                `}
              >
                {currentStepIndex === steps.length - 2 ? 'Calcular' : 'Continuar'}
                {currentStepIndex === steps.length - 2 ? <CheckCircle2 size={24} /> : <ChevronRight size={24} />}
              </button>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const App: React.FC = () => {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <WizardProvider>
      {!hasStarted ? (
        <LandingPage onStart={() => setHasStarted(true)} />
      ) : (
        <WizardContent />
      )}
    </WizardProvider>
  );
};

export default App;