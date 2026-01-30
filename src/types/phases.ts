/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TIPOS PARA SISTEMA DE FASES E SUBFASES EXPANSÍVEIS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este arquivo define a estrutura de tipos para o sistema de fases de obra
 * com subfases expansíveis e condicionais.
 * 
 * Referência: PROPOSTA_TECNICA_FASES_EXPANSIVEIS.md
 */

import { ProjectData } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE CONDIÇÕES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Define uma condição para exibição de subfases.
 * - 'always': Sempre exibida, independente dos dados
 * - 'conditional': Exibida apenas quando as regras forem satisfeitas
 */
export interface PhaseCondition {
  type: 'always' | 'conditional';
  rules?: ConditionalRule[];
}

/**
 * Define uma regra condicional individual.
 * As regras são combinadas com AND por padrão.
 */
export interface ConditionalRule {
  /** Campo do ProjectData a ser avaliado */
  field: keyof ProjectData | 'subsoilArea' | 'upperFloorArea' | 'groundArea';
  
  /** Operador de comparação */
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'includes';
  
  /** Valor esperado para a comparação */
  value: string | number | boolean | string[] | null;
  
  /** Operador lógico para combinar com a próxima regra (padrão: AND) */
  combineWith?: 'AND' | 'OR';
}

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE SUBFASES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Representa uma subfase dentro de uma fase de obra.
 */
export interface SubPhase {
  /** Identificador único da subfase */
  id: string;
  
  /** Nome da subfase para exibição */
  name: string;
  
  /** Descrição detalhada da subfase */
  description: string;
  
  /** Condição para exibição da subfase */
  condition: PhaseCondition;
  
  /** Percentual estimado dentro da fase pai (0-100) */
  estimatedPercentage: number;
  
  /** Ordem de exibição dentro da fase */
  order: number;
  
  /** Indica se esta subfase é crítica (destaque visual) */
  isCritical?: boolean;
  
  /** Ícone opcional para a subfase */
  icon?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE FASES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Representa uma fase principal de obra.
 */
export interface Phase {
  /** Identificador único da fase */
  id: string;
  
  /** Nome da fase para exibição */
  name: string;
  
  /** Descrição detalhada da fase */
  description: string;
  
  /** Explicação técnica detalhada da fase (para exibição quando expandida) */
  detailedExplanation?: string;
  
  /** Percentual base do custo total (0-100) */
  basePercentage: number;
  
  /** Percentual de duração em relação ao prazo total (0-100) - para timeline */
  durationPercentage?: number;
  
  /** Lista de subfases desta fase */
  subPhases: SubPhase[];
  
  /** Ícone da fase (nome do ícone Lucide) */
  icon?: string;
  
  /** Cor principal da fase (hex) */
  color?: string;
  
  /** Tipo da fase para agrupamento */
  phaseType: 'pre' | 'construction' | 'post';
  
  /** Mapeamento para o ID original do PHASE_DEFINITIONS */
  originalPhaseId?: string;
}

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS DE ESTADO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Estado de expansão das fases (quais estão abertas/fechadas).
 */
export interface ExpandedPhaseState {
  [phaseId: string]: boolean;
}

/**
 * Subfase processada com valores calculados.
 */
export interface ProcessedSubPhase extends SubPhase {
  /** Valor financeiro calculado para esta subfase */
  calculatedValue: number;
  
  /** Percentual ajustado após filtragem de subfases inaplicáveis */
  adjustedPercentage: number;
}

/**
 * Fase processada com subfases filtradas e valores calculados.
 */
export interface ProcessedPhase extends Phase {
  /** Subfases aplicáveis (que passaram na avaliação de condições) */
  applicableSubPhases: ProcessedSubPhase[];
  
  /** Valor financeiro total da fase */
  phaseValue: number;
  
  /** Indica se a fase possui subfases aplicáveis (para controle de UI) */
  hasApplicableSubPhases: boolean;
}

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS AUXILIARES
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Dados extraídos do ProjectData para avaliação de condições.
 * Inclui campos derivados como subsoilArea e upperFloorArea.
 */
export interface EvaluationContext {
  // Campos diretos do ProjectData
  topography: string | null;
  constructionMethod: string | null;
  siteType: string | null;
  landStatus: string | null;
  maturity: string | null;
  standard: string | null;
  
  // Campos derivados das áreas
  subsoilArea: number;
  upperFloorArea: number;
  groundArea: number;
  
  // Flag de existência de subsolo (inferida de subsoilArea > 0)
  hasSubsoil: boolean;
  
  // Flag de existência de pavimento superior
  hasUpperFloor: boolean;
}

/**
 * Versão do schema de fases (para controle de compatibilidade).
 */
export const PHASES_SCHEMA_VERSION = '1.0.0';
