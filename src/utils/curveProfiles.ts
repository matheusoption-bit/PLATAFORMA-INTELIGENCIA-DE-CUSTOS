/**
 * Perfis de curva de desembolso para fases de obra.
 * Cada perfil representa um padrão realista de gasto ao longo do tempo.
 * 
 * REGRA DE OURO: Custos de obra têm picos e vales — nunca são lineares.
 */

export type CurveProfile = 'FRONT_LOADED' | 'MID_PEAK' | 'BACK_LOADED' | 'UNIFORM';

// Shapes base para cada perfil (normalizados, soma ≈ 1)
const BASE_SHAPES: Record<CurveProfile, number[]> = {
  FRONT_LOADED: [0.35, 0.28, 0.20, 0.12, 0.05],  // Pico no início: fundação, mobilização
  MID_PEAK:     [0.10, 0.20, 0.30, 0.25, 0.10, 0.05], // Pico no meio: estrutura
  BACK_LOADED:  [0.05, 0.10, 0.18, 0.27, 0.40],  // Pico no fim: acabamentos
  UNIFORM:      [1], // Distribuição uniforme (expandida dinamicamente)
};

/**
 * Interpola linearmente um array de pesos para um novo tamanho.
 * Mantém a "forma" da curva original.
 */
function resampleWeights(original: number[], targetLength: number): number[] {
  if (targetLength <= 0) return [1];
  if (targetLength === 1) return [1];
  if (original.length === 1) {
    // UNIFORM: todos iguais
    return Array(targetLength).fill(1 / targetLength);
  }
  if (targetLength === original.length) {
    return [...original];
  }

  const result: number[] = [];
  const ratio = (original.length - 1) / (targetLength - 1);

  for (let i = 0; i < targetLength; i++) {
    const srcIndex = i * ratio;
    const lowerIdx = Math.floor(srcIndex);
    const upperIdx = Math.min(lowerIdx + 1, original.length - 1);
    const fraction = srcIndex - lowerIdx;

    // Interpolação linear entre dois pontos adjacentes
    const interpolated = original[lowerIdx] * (1 - fraction) + original[upperIdx] * fraction;
    result.push(interpolated);
  }

  return result;
}

/**
 * Normaliza um array para que a soma seja exatamente 1.
 */
function normalizeWeights(weights: number[]): number[] {
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (sum <= 0 || !Number.isFinite(sum)) {
    // Fallback seguro: distribuição uniforme
    const len = weights.length || 1;
    return Array(len).fill(1 / len);
  }
  return weights.map(w => w / sum);
}

/**
 * Gera pesos para uma duração específica, baseado no perfil.
 * 
 * @param profile - Tipo de curva (FRONT_LOADED, MID_PEAK, etc.)
 * @param duration - Número de meses da fase
 * @returns Array de pesos normalizados (soma = 1)
 */
export function getWeights(profile: CurveProfile, duration: number): number[] {
  const safeDuration = Math.max(1, Math.floor(duration));
  
  // Edge case: duração 1
  if (safeDuration === 1) {
    return [1];
  }

  // Edge case: duração 2
  if (safeDuration === 2) {
    switch (profile) {
      case 'FRONT_LOADED': return [0.65, 0.35];
      case 'MID_PEAK':     return [0.45, 0.55];
      case 'BACK_LOADED':  return [0.35, 0.65];
      case 'UNIFORM':      return [0.5, 0.5];
      default:             return [0.5, 0.5];
    }
  }

  // Edge case: duração 3
  if (safeDuration === 3) {
    switch (profile) {
      case 'FRONT_LOADED': return normalizeWeights([0.50, 0.30, 0.20]);
      case 'MID_PEAK':     return normalizeWeights([0.25, 0.50, 0.25]);
      case 'BACK_LOADED':  return normalizeWeights([0.20, 0.30, 0.50]);
      case 'UNIFORM':      return [1/3, 1/3, 1/3];
      default:             return [1/3, 1/3, 1/3];
    }
  }

  // Duração >= 4: usar interpolação do shape base
  const baseShape = BASE_SHAPES[profile];
  const resampled = resampleWeights(baseShape, safeDuration);
  return normalizeWeights(resampled);
}

/**
 * Mapeia o nome/tipo da fase para um perfil de curva.
 * Usa heurística por palavras-chave no nome.
 */
export function getPhaseProfile(phaseName: string, phaseType?: string): CurveProfile {
  const text = `${phaseName} ${phaseType || ''}`.toLowerCase();

  // FRONT_LOADED: início intenso
  const frontPatterns = [
    'fundação', 'fundacao', 'terraplanagem', 'terraplenagem',
    'mobilização', 'mobilizacao', 'canteiro', 'demolição', 'demolicao',
    'escavação', 'escavacao', 'sondagem', 'infraestrutura'
  ];
  if (frontPatterns.some(p => text.includes(p))) {
    return 'FRONT_LOADED';
  }

  // MID_PEAK: pico no meio da execução
  const midPatterns = [
    'estrutura', 'supraestrutura', 'laje', 'concreto', 
    'alvenaria', 'vedação', 'vedacao', 'cobertura', 'telhado'
  ];
  if (midPatterns.some(p => text.includes(p))) {
    return 'MID_PEAK';
  }

  // BACK_LOADED: intensifica no final
  const backPatterns = [
    'acabamento', 'pintura', 'esquadria', 'louça', 'louca',
    'metal', 'metais', 'piso', 'revestimento', 'forro',
    'finalização', 'finalizacao', 'limpeza', 'entrega',
    'paisagismo', 'jardim', 'decoração', 'decoracao'
  ];
  if (backPatterns.some(p => text.includes(p))) {
    return 'BACK_LOADED';
  }

  // UNIFORM: distribuição constante
  const uniformPatterns = [
    'instalação', 'instalacao', 'instalações', 'instalacoes',
    'elétrica', 'eletrica', 'hidráulica', 'hidraulica',
    'hidrossanitária', 'hidrossanitaria', 'gás', 'gas',
    'gestão', 'gestao', 'administração', 'administracao',
    'projeto', 'aprovação', 'aprovacao', 'licença', 'licenca'
  ];
  if (uniformPatterns.some(p => text.includes(p))) {
    return 'UNIFORM';
  }

  // Default: UNIFORM (mais seguro)
  return 'UNIFORM';
}

/**
 * Aplica pesos a um valor total, garantindo fechamento matemático exato.
 * 
 * @param totalValue - Valor total a distribuir
 * @param weights - Array de pesos normalizados
 * @returns Array de valores mensais (soma exata = totalValue)
 */
export function distributeByWeights(totalValue: number, weights: number[]): number[] {
  if (!Number.isFinite(totalValue) || totalValue <= 0 || weights.length === 0) {
    return weights.map(() => 0);
  }

  // Distribuição inicial
  const values = weights.map(w => totalValue * w);

  // Correção de floating point: ajusta último valor para fechar exato
  const calculatedSum = values.reduce((acc, v) => acc + v, 0);
  const delta = totalValue - calculatedSum;
  
  if (Math.abs(delta) > 0.0001) {
    // Adiciona delta no último mês (mais comum em obras: ajuste final)
    values[values.length - 1] += delta;
  }

  return values;
}
