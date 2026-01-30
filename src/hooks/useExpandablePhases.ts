/**
 * ══════════════════════════════════════════════════════════════════════════════
 * HOOK: useExpandablePhases
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Hook customizado para gerenciar o estado de expansão das fases
 * e fornecer acesso às subfases processadas.
 * 
 * Responsabilidades:
 * - Gerenciar estado de expansão (accordion)
 * - Processar fases com o PhaseEvaluator
 * - Memoizar cálculos para performance
 * 
 * Referência: PROPOSTA_TECNICA_FASES_EXPANSIVEIS.md
 */

import { useState, useMemo, useCallback } from 'react';
import { ProjectData } from '../types';
import {
  Phase,
  SubPhase,
  ExpandedPhaseState,
  ProcessedPhase,
  ProcessedSubPhase,
  EvaluationContext
} from '../types/phases';
import { MACRO_PHASES_SCHEMA, PILOT_PHASE } from '../data/phasesSchema';
import { PhaseEvaluator } from '../utils/phaseEvaluator';

// ══════════════════════════════════════════════════════════════════════════════
// INTERFACE DO HOOK
// ══════════════════════════════════════════════════════════════════════════════

export interface UseExpandablePhasesResult {
  /** Todas as fases do schema */
  phases: Phase[];
  
  /** Apenas a fase piloto (para implementação inicial) */
  pilotPhase: Phase;
  
  /** Estado de expansão das fases */
  expandedPhases: ExpandedPhaseState;
  
  /** Toggle expansão de uma fase específica */
  togglePhase: (phaseId: string) => void;
  
  /** Expande todas as fases */
  expandAll: () => void;
  
  /** Colapsa todas as fases */
  collapseAll: () => void;
  
  /** Verifica se uma fase está expandida */
  isExpanded: (phaseId: string) => boolean;
  
  /** Obtém subfases aplicáveis para uma fase */
  getApplicableSubPhases: (phase: Phase) => SubPhase[];
  
  /** Obtém subfases processadas com valores calculados */
  getProcessedSubPhases: (phase: Phase, phaseValue: number) => ProcessedSubPhase[];
  
  /** Processa a fase piloto com valores */
  processPilotPhase: (phaseValue: number) => ProcessedPhase;
  
  /** Contexto de avaliação extraído dos dados */
  evaluationContext: EvaluationContext;
  
  /** Verifica se a fase tem subfases críticas visíveis */
  hasCriticalSubPhases: (phase: Phase) => boolean;
  
  /** Conta subfases aplicáveis */
  countApplicableSubPhases: (phase: Phase) => number;
}

// ══════════════════════════════════════════════════════════════════════════════
// IMPLEMENTAÇÃO DO HOOK
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para gerenciar fases expansíveis com subfases condicionais.
 * 
 * @param data - Dados do projeto do WizardContext
 * @returns Objeto com estado, ações e funções de processamento
 */
export function useExpandablePhases(
  data: ProjectData
): UseExpandablePhasesResult {
  
  // ────────────────────────────────────────────────────────────────────────────
  // ESTADO
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Estado de expansão das fases.
   * Objeto com phaseId como chave e boolean como valor.
   */
  const [expandedPhases, setExpandedPhases] = useState<ExpandedPhaseState>({});
  
  // ────────────────────────────────────────────────────────────────────────────
  // CONTEXTO DE AVALIAÇÃO (Memoizado)
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Contexto extraído dos dados do projeto.
   * Memoizado para evitar recálculos desnecessários.
   */
  const evaluationContext = useMemo(() => {
    return PhaseEvaluator.extractContext(data);
  }, [data]);
  
  // ────────────────────────────────────────────────────────────────────────────
  // AÇÕES DE EXPANSÃO
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Toggle expansão de uma fase específica.
   * Comportamento de accordion: apenas uma fase expandida por vez.
   */
  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases(prev => {
      // Se a fase já está expandida, colapsa
      if (prev[phaseId]) {
        return { ...prev, [phaseId]: false };
      }
      
      // Caso contrário, expande (colapsa as outras para comportamento accordion)
      const newState: ExpandedPhaseState = {};
      Object.keys(prev).forEach(key => {
        newState[key] = false;
      });
      newState[phaseId] = true;
      
      return newState;
    });
  }, []);
  
  /**
   * Expande todas as fases.
   */
  const expandAll = useCallback(() => {
    const allExpanded = MACRO_PHASES_SCHEMA.reduce((acc, phase) => {
      acc[phase.id] = true;
      return acc;
    }, {} as ExpandedPhaseState);
    
    setExpandedPhases(allExpanded);
  }, []);
  
  /**
   * Colapsa todas as fases.
   */
  const collapseAll = useCallback(() => {
    setExpandedPhases({});
  }, []);
  
  /**
   * Verifica se uma fase está expandida.
   */
  const isExpanded = useCallback((phaseId: string): boolean => {
    return !!expandedPhases[phaseId];
  }, [expandedPhases]);
  
  // ────────────────────────────────────────────────────────────────────────────
  // FUNÇÕES DE PROCESSAMENTO
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Obtém subfases aplicáveis para uma fase.
   * Usa o contexto memoizado para avaliação.
   */
  const getApplicableSubPhases = useCallback((phase: Phase): SubPhase[] => {
    return PhaseEvaluator.getApplicableSubPhases(phase, evaluationContext);
  }, [evaluationContext]);
  
  /**
   * Obtém subfases processadas com valores calculados.
   */
  const getProcessedSubPhases = useCallback((
    phase: Phase,
    phaseValue: number
  ): ProcessedSubPhase[] => {
    const applicable = PhaseEvaluator.getApplicableSubPhases(phase, evaluationContext);
    const adjusted = PhaseEvaluator.recalculatePercentages(applicable);
    
    return adjusted.map(sp => ({
      ...sp,
      calculatedValue: (phaseValue * sp.adjustedPercentage) / 100
    }));
  }, [evaluationContext]);
  
  /**
   * Processa a fase piloto com valores calculados.
   */
  const processPilotPhase = useCallback((phaseValue: number): ProcessedPhase => {
    return PhaseEvaluator.processPhase(PILOT_PHASE, evaluationContext, phaseValue);
  }, [evaluationContext]);
  
  /**
   * Verifica se a fase tem subfases críticas visíveis.
   */
  const hasCriticalSubPhases = useCallback((phase: Phase): boolean => {
    const applicable = PhaseEvaluator.getApplicableSubPhases(phase, evaluationContext);
    return applicable.some(sp => sp.isCritical);
  }, [evaluationContext]);
  
  /**
   * Conta subfases aplicáveis para uma fase.
   */
  const countApplicableSubPhases = useCallback((phase: Phase): number => {
    return PhaseEvaluator.getApplicableSubPhases(phase, evaluationContext).length;
  }, [evaluationContext]);
  
  // ────────────────────────────────────────────────────────────────────────────
  // RETORNO
  // ────────────────────────────────────────────────────────────────────────────
  
  return {
    phases: MACRO_PHASES_SCHEMA,
    pilotPhase: PILOT_PHASE,
    expandedPhases,
    togglePhase,
    expandAll,
    collapseAll,
    isExpanded,
    getApplicableSubPhases,
    getProcessedSubPhases,
    processPilotPhase,
    evaluationContext,
    hasCriticalSubPhases,
    countApplicableSubPhases
  };
}
