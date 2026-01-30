/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ENGINE DE AVALIAÇÃO DE CONDIÇÕES PARA FASES EXPANSÍVEIS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Este módulo implementa a lógica de avaliação de regras condicionais
 * para determinar quais subfases devem ser exibidas ao usuário.
 * 
 * Princípios:
 * - Inferência determinística (sem probabilidades)
 * - Existência de subsolo inferida exclusivamente por subsoilArea > 0
 * - Não cria novas perguntas nem novos inputs
 * 
 * Referência: PROPOSTA_TECNICA_FASES_EXPANSIVEIS.md
 */

import { ProjectData } from '../types';
import {
  Phase,
  SubPhase,
  PhaseCondition,
  ConditionalRule,
  EvaluationContext,
  ProcessedPhase,
  ProcessedSubPhase
} from '../types/phases';

// ══════════════════════════════════════════════════════════════════════════════
// CLASSE PRINCIPAL: PhaseEvaluator
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Engine de avaliação de condições para subfases.
 * 
 * Responsabilidades:
 * - Extrair contexto de avaliação dos dados do projeto
 * - Avaliar condições individuais e compostas
 * - Filtrar subfases aplicáveis
 * - Calcular valores financeiros das subfases
 */
export class PhaseEvaluator {
  
  // ────────────────────────────────────────────────────────────────────────────
  // EXTRAÇÃO DE CONTEXTO
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Extrai o contexto de avaliação a partir dos dados do projeto.
   * 
   * Inclui campos derivados como:
   * - subsoilArea (de areas.subfloor)
   * - hasSubsoil (inferido de subsoilArea > 0)
   * - upperFloorArea (de areas.upper)
   * - hasUpperFloor (inferido de upperFloorArea > 0)
   */
  static extractContext(data: ProjectData): EvaluationContext {
    return {
      // Campos diretos
      topography: data.topography || null,
      constructionMethod: data.constructionMethod || null,
      siteType: data.siteType || null,
      landStatus: data.landStatus || null,
      maturity: data.maturity || null,
      standard: data.standard || null,
      
      // Campos derivados das áreas
      subsoilArea: data.areas?.subfloor || 0,
      upperFloorArea: data.areas?.upper || 0,
      groundArea: data.areas?.ground || 0,
      
      // Flags inferidas
      hasSubsoil: (data.areas?.subfloor || 0) > 0,
      hasUpperFloor: (data.areas?.upper || 0) > 0
    };
  }
  
  // ────────────────────────────────────────────────────────────────────────────
  // AVALIAÇÃO DE CONDIÇÕES
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Avalia se uma condição é satisfeita dado o contexto.
   * 
   * @param condition - Condição a ser avaliada
   * @param context - Contexto de avaliação (dados extraídos do projeto)
   * @returns true se a condição é satisfeita
   */
  static evaluate(
    condition: PhaseCondition,
    context: EvaluationContext
  ): boolean {
    // Condição 'always' sempre retorna true
    if (condition.type === 'always') {
      return true;
    }
    
    // Se não há regras, retorna false (segurança)
    if (!condition.rules || condition.rules.length === 0) {
      return false;
    }
    
    // Avalia cada regra e combina os resultados
    return this.evaluateRules(condition.rules, context);
  }
  
  /**
   * Avalia um conjunto de regras combinando-as com operadores lógicos.
   * 
   * Por padrão, as regras são combinadas com AND.
   * O operador `combineWith` de cada regra indica como combinar com a próxima.
   */
  private static evaluateRules(
    rules: ConditionalRule[],
    context: EvaluationContext
  ): boolean {
    if (rules.length === 0) return false;
    
    let result = this.evaluateRule(rules[0], context);
    
    for (let i = 1; i < rules.length; i++) {
      const prevRule = rules[i - 1];
      const currentResult = this.evaluateRule(rules[i], context);
      
      // Combina com o resultado anterior usando o operador definido
      if (prevRule.combineWith === 'OR') {
        result = result || currentResult;
      } else {
        // Padrão: AND
        result = result && currentResult;
      }
    }
    
    return result;
  }
  
  /**
   * Avalia uma regra individual contra o contexto.
   * 
   * Operadores suportados:
   * - equals: Igualdade estrita
   * - notEquals: Diferença
   * - greaterThan: Maior que (para números)
   * - lessThan: Menor que (para números)
   * - includes: Valor está contido em array
   */
  private static evaluateRule(
    rule: ConditionalRule,
    context: EvaluationContext
  ): boolean {
    // Obtém o valor do campo no contexto
    const fieldValue = this.getFieldValue(rule.field, context);
    
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
        
      case 'notEquals':
        return fieldValue !== rule.value;
        
      case 'greaterThan':
        return Number(fieldValue) > Number(rule.value);
        
      case 'lessThan':
        return Number(fieldValue) < Number(rule.value);
        
      case 'includes':
        // Verifica se o valor do campo está incluído no array esperado
        if (Array.isArray(rule.value)) {
          return rule.value.includes(fieldValue as string);
        }
        return false;
        
      default:
        // Operador desconhecido: retorna false por segurança
        console.warn(`[PhaseEvaluator] Operador desconhecido: ${rule.operator}`);
        return false;
    }
  }
  
  /**
   * Obtém o valor de um campo do contexto.
   * 
   * Suporta campos especiais derivados:
   * - subsoilArea: Área do subsolo (areas.subfloor)
   * - upperFloorArea: Área do pavimento superior (areas.upper)
   * - groundArea: Área do térreo (areas.ground)
   */
  private static getFieldValue(
    field: string,
    context: EvaluationContext
  ): string | number | boolean | null {
    // Campos especiais (derivados)
    if (field === 'subsoilArea') {
      return context.subsoilArea;
    }
    if (field === 'upperFloorArea') {
      return context.upperFloorArea;
    }
    if (field === 'groundArea') {
      return context.groundArea;
    }
    
    // Campos diretos do contexto
    if (field in context) {
      return context[field as keyof EvaluationContext] as string | number | boolean | null;
    }
    
    // Campo não encontrado
    console.warn(`[PhaseEvaluator] Campo não encontrado: ${field}`);
    return null;
  }
  
  // ────────────────────────────────────────────────────────────────────────────
  // FILTRAGEM DE SUBFASES
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Retorna as subfases aplicáveis para uma fase, dado o contexto.
   * 
   * Subfases são ordenadas por `order` após a filtragem.
   */
  static getApplicableSubPhases(
    phase: Phase,
    context: EvaluationContext
  ): SubPhase[] {
    return phase.subPhases
      .filter(subPhase => this.evaluate(subPhase.condition, context))
      .sort((a, b) => a.order - b.order);
  }
  
  // ────────────────────────────────────────────────────────────────────────────
  // CÁLCULO DE VALORES
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Calcula o valor financeiro de uma subfase.
   * 
   * @param subPhase - Subfase para calcular
   * @param phaseTotal - Valor total da fase pai
   * @returns Valor calculado para a subfase
   */
  static calculateSubPhaseValue(
    subPhase: SubPhase,
    phaseTotal: number
  ): number {
    return (phaseTotal * subPhase.estimatedPercentage) / 100;
  }
  
  /**
   * Recalcula os percentuais das subfases para somar 100%.
   * 
   * Quando algumas subfases são filtradas, os percentuais das
   * subfases restantes são ajustados proporcionalmente.
   */
  static recalculatePercentages(subPhases: SubPhase[]): ProcessedSubPhase[] {
    if (subPhases.length === 0) {
      return [];
    }
    
    const totalPercentage = subPhases.reduce(
      (sum, sp) => sum + sp.estimatedPercentage,
      0
    );
    
    // Se o total já é 100%, não precisa ajustar
    if (Math.abs(totalPercentage - 100) < 0.01) {
      return subPhases.map(sp => ({
        ...sp,
        adjustedPercentage: sp.estimatedPercentage,
        calculatedValue: 0 // Será calculado depois
      }));
    }
    
    // Ajusta proporcionalmente
    return subPhases.map(sp => ({
      ...sp,
      adjustedPercentage: (sp.estimatedPercentage / totalPercentage) * 100,
      calculatedValue: 0 // Será calculado depois
    }));
  }
  
  // ────────────────────────────────────────────────────────────────────────────
  // PROCESSAMENTO COMPLETO
  // ────────────────────────────────────────────────────────────────────────────
  
  /**
   * Processa uma fase completa, retornando as subfases aplicáveis
   * com seus valores calculados.
   * 
   * @param phase - Fase a processar
   * @param context - Contexto de avaliação
   * @param phaseValue - Valor financeiro total da fase
   * @returns Fase processada com subfases filtradas e valores calculados
   */
  static processPhase(
    phase: Phase,
    context: EvaluationContext,
    phaseValue: number
  ): ProcessedPhase {
    // 1. Filtra subfases aplicáveis
    const applicableSubPhases = this.getApplicableSubPhases(phase, context);
    
    // 2. Recalcula percentuais
    const adjustedSubPhases = this.recalculatePercentages(applicableSubPhases);
    
    // 3. Calcula valores financeiros
    const processedSubPhases: ProcessedSubPhase[] = adjustedSubPhases.map(sp => ({
      ...sp,
      calculatedValue: (phaseValue * sp.adjustedPercentage) / 100
    }));
    
    return {
      ...phase,
      applicableSubPhases: processedSubPhases,
      phaseValue,
      hasApplicableSubPhases: processedSubPhases.length > 0
    };
  }
  
  /**
   * Processa múltiplas fases de uma vez.
   * 
   * @param phases - Array de fases a processar
   * @param data - Dados do projeto
   * @param phaseValues - Mapeamento de ID da fase para seu valor financeiro
   * @returns Array de fases processadas
   */
  static processAllPhases(
    phases: Phase[],
    data: ProjectData,
    phaseValues: Record<string, number>
  ): ProcessedPhase[] {
    const context = this.extractContext(data);
    
    return phases.map(phase => 
      this.processPhase(
        phase,
        context,
        phaseValues[phase.id] || 0
      )
    );
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica se uma fase possui subfases críticas visíveis.
 */
export function hasCriticalSubPhases(
  phase: Phase,
  context: EvaluationContext
): boolean {
  const applicableSubPhases = PhaseEvaluator.getApplicableSubPhases(phase, context);
  return applicableSubPhases.some(sp => sp.isCritical);
}

/**
 * Conta o número de subfases aplicáveis para uma fase.
 */
export function countApplicableSubPhases(
  phase: Phase,
  context: EvaluationContext
): number {
  return PhaseEvaluator.getApplicableSubPhases(phase, context).length;
}

/**
 * Debug: Imprime o resultado da avaliação para uma fase.
 */
export function debugPhaseEvaluation(
  phase: Phase,
  data: ProjectData
): void {
  const context = PhaseEvaluator.extractContext(data);
  console.group(`[PhaseEvaluator Debug] ${phase.name}`);
  console.log('Contexto:', context);
  
  phase.subPhases.forEach(sp => {
    const result = PhaseEvaluator.evaluate(sp.condition, context);
    console.log(`  ${result ? '✅' : '❌'} ${sp.name}`, sp.condition);
  });
  
  console.groupEnd();
}
