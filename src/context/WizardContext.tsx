import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProjectData, WizardState, MaturityLevel, LandStatus } from '../types';

const INITIAL_DATA: ProjectData = {
  userName: '',
  cityKey: 'florianopolis',
  neighborhood: null,
  neighborhoodCustom: null,
  projectGoal: null,
  siteType: null,
  
  // Inicialização de Estado de Maturidade
  hasLand: null, // derivado de landStatus
  hasProject: null,
  maturity: 'idea', // Default seguro
  
  // Status do Terreno (fonte de verdade)
  landStatus: null,
  landAreaM2: null,
  
  topography: 'flat',
  constructionMethod: 'masonry',
  standard: 'normal',
  
  areas: {
    ground: 0,
    upper: 0,
    subfloor: 0,
    outdoor: 0
  },
  basementIntent: null,
  subfloorDepth: null, // Profundidade do subsolo (apenas para maturity === 'project')
  containmentType: null, // Tipo de contenção (apenas para topografia não plana E maturity === 'project')
  
  recommendedDeadlineMonths: 12,
  deadlineMonths: 12,
  deadlineMode: 'auto'
};

interface WizardContextType {
  state: WizardState;
  goToNextStep: () => void;
  goToPrevStep: () => void;
  updateData: (data: Partial<ProjectData>) => void;
  setStepValid: (isValid: boolean) => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | undefined>(undefined);

export const WizardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<WizardState>({
    currentStep: 1,
    data: INITIAL_DATA,
    isStepValid: false
  });

  // Função auxiliar de cálculo de prazo econômico
  const calculateRecommendedDeadline = (areas: ProjectData['areas']): number => {
    const totalArea = areas.ground + areas.upper + areas.subfloor;
    // Fórmula: max(6, ceil(totalArea / 25) + 2)
    return Math.max(6, Math.ceil(totalArea / 25) + 2);
  };

  const updateData = (newData: Partial<ProjectData>) => {
    setState(prev => {
      // 1. Merge dos dados
      const updatedData = { ...prev.data, ...newData };
      
      // 1.1 Derivar hasLand a partir de landStatus (compatibilidade)
      if (updatedData.landStatus !== undefined) {
        updatedData.hasLand = updatedData.landStatus === 'owned' || updatedData.landStatus === 'negotiating';
        
        // Limpar landAreaM2 se mudar de negotiating para outro status
        if (updatedData.landStatus !== 'negotiating' && prev.data.landStatus === 'negotiating') {
          updatedData.landAreaM2 = null;
        }
      }
      
      // 2. Inferência de Maturidade (Lógica Centralizada e Corrigida)
      // Objetivo: Garantir que hasLand === true leve a 'land' se hasProject for null ou false.
      let derivedMaturity: MaturityLevel = prev.data.maturity; // Default fallback

      if (updatedData.hasLand === false) {
        // Regra 1: Sem terreno = Perfil Ideia
        derivedMaturity = 'idea';
      } else if (updatedData.hasLand === true) {
        // Regra 2: Com terreno, verificamos o projeto
        if (updatedData.hasProject === true) {
          // Terreno + Projeto = Perfil Projeto
          derivedMaturity = 'project';
        } else {
          // Terreno + (Sem Projeto OU Não Respondeu) = Perfil Terreno (Land)
          // Isso garante que o passo 'Step3ProjectStatus' seja acessível
          derivedMaturity = 'land';
        }
      } else {
        // hasLand é null: mantém estado inicial 'idea'
        derivedMaturity = 'idea';
      }

      // 3. Aplicação de Defaults baseados na Maturidade (Regras de Negócio)
      if (derivedMaturity === 'idea') {
        updatedData.topography = 'flat';
        updatedData.constructionMethod = 'masonry';
        updatedData.areas.subfloor = 0;
      } else if (derivedMaturity === 'land') {
        // Se entrou no fluxo Land, garante um método construtivo default se não houver
        if (!newData.constructionMethod && !updatedData.constructionMethod) {
            updatedData.constructionMethod = 'masonry';
        }
      }

      // 4. Lógica de Prazo Inteligente (Auto vs Manual + Clamping)
      
      // 4.1 Recalcular o Recomendado com base na NOVA área
      const newRecommended = calculateRecommendedDeadline(updatedData.areas);
      updatedData.recommendedDeadlineMonths = newRecommended;

      // 4.2 Definir Limites de Segurança (Clamping)
      // Mínimo: 70% do recomendado, nunca abaixo de 6 meses
      const minSelectable = Math.max(6, Math.floor(newRecommended * 0.70));
      // Máximo: Recomendado + 12 meses
      const maxSelectable = newRecommended + 12;

      // 4.3 Aplicar regras de atualização do prazo
      if (newData.deadlineMode) {
        // A. Troca de modo explícita (ex: clicou em "Usar Recomendado")
        updatedData.deadlineMode = newData.deadlineMode;
        if (newData.deadlineMode === 'auto') {
          updatedData.deadlineMonths = newRecommended;
        }
      } else if (newData.deadlineMonths !== undefined) {
        // B. Usuário alterou o slider manualmente
        updatedData.deadlineMode = 'manual';
        // Garante que o input manual respeite os limites calculados
        updatedData.deadlineMonths = Math.min(Math.max(newData.deadlineMonths, minSelectable), maxSelectable);
      } else {
        // C. Atualização implícita (ex: mudou a área)
        if (updatedData.deadlineMode === 'auto') {
          // Se estava em auto, segue o recomendado
          updatedData.deadlineMonths = newRecommended;
        } else {
          // Se estava em manual, mantém o valor mas aplica clamp para não ficar inválido
          updatedData.deadlineMonths = Math.min(Math.max(updatedData.deadlineMonths, minSelectable), maxSelectable);
        }
      }

      return {
        ...prev,
        data: {
          ...updatedData,
          maturity: derivedMaturity
        }
      };
    });
  };

  const goToNextStep = () => {
    setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
  };

  const goToPrevStep = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(1, prev.currentStep - 1) }));
  };

  const setStepValid = (isValid: boolean) => {
    setState(prev => ({ ...prev, isStepValid: isValid }));
  };

  const resetWizard = () => {
    setState({
      currentStep: 1,
      data: INITIAL_DATA,
      isStepValid: false
    });
  };

  return (
    <WizardContext.Provider value={{ state, goToNextStep, goToPrevStep, updateData, setStepValid, resetWizard }}>
      {children}
    </WizardContext.Provider>
  );
};

export const useWizard = () => {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider');
  }
  return context;
};