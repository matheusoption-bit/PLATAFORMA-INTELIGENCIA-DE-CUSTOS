import { MARKET_DATA, getScenarioId, getScenarioInfo, type ScenarioId, type RiskLevel } from '../data/marketData';
import { ProjectData, AreaBreakdown, SubfloorDepth } from '../types';

// ══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE NEGÓCIO
// ══════════════════════════════════════════════════════════════════════════════

/** Taxa de Administração de Obra: 15% sobre Mão de Obra + Insumos (hardCost) */
export const ADMINISTRATION_FEE_RATE = 0.15;

/** Fator de redução da taxa de administração na fase pré-obra */
export const PRE_CONSTRUCTION_ADMIN_WEIGHT = 0.5; // 50% do peso normal

export interface DetailedPhase {
  id: string;
  name: string;
  type: 'pre' | 'construction' | 'post' | 'admin';
  weight: number;
  startMonth: number;
  endMonth: number;
  baseValue: number;
  inflatedValue: number;
}

export const PHASE_DEFINITIONS = [
  { id: 'p1', name: 'Planejamento e Orçamentação', type: 'pre', weight: 0.01 },
  { id: 'p2', name: 'Definição de Escopo', type: 'pre', weight: 0.01 },
  { id: 'p3', name: 'Preparação de Obra', type: 'pre', weight: 0.01 },
  { id: 'p4', name: 'Cronograma Físico-Financeiro', type: 'pre', weight: 0.005 },
  { id: 'p5', name: 'Gestão de Suprimentos', type: 'pre', weight: 0.005 },
  { id: 'c1', name: 'Instalação de Canteiro', type: 'construction', weight: 0.03 },
  { id: 'c2', name: 'Mobilização', type: 'construction', weight: 0.02 },
  { id: 'c3', name: 'Infraestrutura e Fundações', type: 'construction', weight: 0.07 },
  { id: 'c4', name: 'Supraestrutura (Estrutura)', type: 'construction', weight: 0.16 },
  { id: 'c5', name: 'Alvenaria e Vedações', type: 'construction', weight: 0.04 },
  { id: 'c6', name: 'Cobertura e Telhado', type: 'construction', weight: 0.05 },
  { id: 'c7', name: 'Esquadrias (Portas e Janelas)', type: 'construction', weight: 0.12 },
  { id: 'c8', name: 'Instalações Hidrossanitárias', type: 'construction', weight: 0.06 },
  { id: 'c9', name: 'Instalações Elétricas', type: 'construction', weight: 0.06 },
  { id: 'c10', name: 'Revestimentos Internos', type: 'construction', weight: 0.18 },
  { id: 'c11', name: 'Fachada e Rev. Externos', type: 'construction', weight: 0.08 },
  { id: 'c12', name: 'Pintura', type: 'construction', weight: 0.05 },
  { id: 'c13', name: 'Serviços Complementares', type: 'construction', weight: 0.01 },
  { id: 'f1', name: 'Paisagismo e Limpeza Final', type: 'post', weight: 0.03 },
];

// ══════════════════════════════════════════════════════════════════════════════
// INTERFACES DE DETALHAMENTO GRANULAR
// ══════════════════════════════════════════════════════════════════════════════

export interface CityTaxes {
  iss: number;
  alvaraBase: number;
  alvaraM2: number;
  habiteseM2: number;
  habiteseMinimo?: number;
  habiteseFixo?: number;
  habiteseSanitarioM2: number;
  habiteseSanitarioVistoria: number;
  inssAliquota: number;
  inssBasePercent: number;
  artRrtBase: number;
  artRrtMedio: number;
}

export interface ProjectDetail {
  name: string;
  value: number;
  phase: 'pre' | 'construction' | 'post';
}

export interface TaxDetail {
  name: string;
  value: number;
  phase: 'pre' | 'construction' | 'post';
}

export interface CostComposition {
  laborCost: number;      // Mão de Obra (~45% do hardCost)
  materialsCost: number;  // Materiais/Insumos (~50% do hardCost)
  equipmentCost: number;  // Aluguel de Equipamentos (~5% do hardCost)
  administrationCost: number; // Taxa de Administração (15% do hardCost)
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERFACE DE CENÁRIO E RISCO
// ══════════════════════════════════════════════════════════════════════════════
export interface ScenarioResult {
  id: ScenarioId;
  label: string;
  description: string;
  costMultiplier: number;
  scheduleMultiplier: number;
  risk: {
    level: RiskLevel;
    label: string;
    contingencyPercent: number;
    contingencyValue: number;
    notes: readonly string[];
  };
}

export interface ConstructionCostResult {
  equivalentArea: number;
  baseCost: number;
  hardCost: number;
  softCost: number;
  projectFees: number;
  administrationFee: number; // 15% sobre hardCost (Mão de Obra + Insumos)
  totalCost: number;
  // Novo: custo ajustado pelo cenário (inclui contingência)
  adjustedTotalCost: number;
  factors: {
    region: number;
    city: number;
    topography: number;
    method: number;
    scenario: number; // Novo: multiplicador do cenário
    subfloorDepth: number; // Novo: multiplicador de profundidade
  };
  cubUsed: number;
  // Novo: informações do cenário
  scenario: ScenarioResult;
  // Novo: prazo ajustado pelo cenário
  adjustedDeadlineMonths: number;
  // Novos campos de detalhamento
  projectDetails: ProjectDetail[];
  taxDetails: TaxDetail[];
  costComposition: CostComposition;
}

export const calculateConstructionCost = (input: ProjectData): ConstructionCostResult => {
  const { areas, cityKey, topography, standard, constructionMethod, hasLand, subfloorDepth, deadlineMonths } = input;
  
  // ══════════════════════════════════════════════════════════════════════════════
  // DETECÇÃO DE CENÁRIO (baseado em topografia + presença de subsolo)
  // ══════════════════════════════════════════════════════════════════════════════
  const hasSubfloor = areas.subfloor > 0;
  const scenarioId = getScenarioId(topography, hasSubfloor);
  const scenarioInfo = getScenarioInfo(scenarioId);
  
  // Multiplicador de profundidade do subsolo (apenas se tiver subsolo E profundidade informada)
  const depthMultiplier = hasSubfloor && subfloorDepth 
    ? MARKET_DATA.subfloorDepth[subfloorDepth as keyof typeof MARKET_DATA.subfloorDepth]?.multiplier || 1.0
    : 1.0;
  
  const equivalentArea = 
    (areas.ground * MARKET_DATA.constructionFactors.ground) +
    (areas.upper * MARKET_DATA.constructionFactors.upper) +
    (areas.subfloor * MARKET_DATA.constructionFactors.subfloor) +
    (areas.outdoor * 0.4); // Área externa tem fator reduzido

  const standardInfo = MARKET_DATA.finishStandards[standard as keyof typeof MARKET_DATA.finishStandards];
  const cubValue = MARKET_DATA.region.cubValues[standardInfo.cubCode as keyof typeof MARKET_DATA.region.cubValues];

  const regionalFactor = MARKET_DATA.region.regionalFactor;
  const topographyFactor = MARKET_DATA.topography[topography as keyof typeof MARKET_DATA.topography];
  
  const cityData = MARKET_DATA.cities[cityKey as keyof typeof MARKET_DATA.cities];
  const cityFactor = cityData ? cityData.factor : 1.0;

  const methodData = MARKET_DATA.constructionMethods[constructionMethod as keyof typeof MARKET_DATA.constructionMethods];
  const methodFactor = methodData ? methodData.factor : 1.0;

  // ══════════════════════════════════════════════════════════════════════════════
  // APLICAÇÃO DO MULTIPLICADOR DE CENÁRIO
  // O multiplicador do cenário já incorpora os fatores de complexidade por
  // topografia + subsolo, então NÃO duplicamos o fator de topografia simples
  // ══════════════════════════════════════════════════════════════════════════════
  const scenarioCostMultiplier = scenarioInfo.totalCostMultiplier;
  
  const baseCost = equivalentArea * cubValue;
  // hardCost agora incorpora o multiplicador de cenário e profundidade
  const hardCost = baseCost * regionalFactor * methodFactor * cityFactor * scenarioCostMultiplier * depthMultiplier;

  const totalRealArea = areas.ground + areas.upper + areas.subfloor + (areas.outdoor * 0.5);
  
  // Valor estimado do imóvel para cálculos cartoriais
  const valorImovel = hardCost;
  
  // ══════════════════════════════════════════════════════════════════════════════
  // DETALHAMENTO DE TAXAS E IMPOSTOS (Fórmulas baseadas na legislação municipal)
  // Fonte: Códigos Tributários Municipais, Lei Complementar 755/2019 (SC)
  // ══════════════════════════════════════════════════════════════════════════════
  const taxes = (cityData?.taxes || {}) as CityTaxes;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ALVARÁ DE CONSTRUÇÃO
  // Fórmula: (Área × Valor/m²) + Taxa Fixa
  // ─────────────────────────────────────────────────────────────────────────────
  const alvaraTotal = (taxes.alvaraBase || 0) + (totalRealArea * (taxes.alvaraM2 || 0));
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ART/RRT (CREA + CAU)
  // Até 200m²: R$ 430 | 200-400m²: R$ 650
  // ─────────────────────────────────────────────────────────────────────────────
  const artRrt = totalRealArea <= 200 ? (taxes.artRrtBase || 430) : (taxes.artRrtMedio || 650);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ISS - Imposto Sobre Serviços
  // Fórmula: (Área × CUB × 50%) × Alíquota Municipal
  // Base de cálculo = 50% do valor (mão de obra estimada)
  // ─────────────────────────────────────────────────────────────────────────────
  const baseCalculoISS = hardCost * 0.50;
  const issEstimado = baseCalculoISS * (taxes.iss || 0.02);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // INSS DA OBRA
  // Fórmula: (Área × CUB × 50%) × 11%
  // Base de cálculo = Área × CUB × 50% (valor de mão de obra estimado pela RFB)
  // ─────────────────────────────────────────────────────────────────────────────
  const baseCalculoINSS = totalRealArea * cubValue * 0.50; // Área × CUB × 50%
  const inssObra = baseCalculoINSS * 0.11; // × 11%
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HABITE-SE
  // Fórmula: max(Área × Valor/m² + Fixo, Mínimo)
  // ─────────────────────────────────────────────────────────────────────────────
  const habiteseCalculado = (totalRealArea * (taxes.habiteseM2 || 0)) + (taxes.habiteseFixo || 0);
  const habiteSe = Math.max(habiteseCalculado, taxes.habiteseMinimo || 0);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // HABITE-SE SANITÁRIO (Vigilância Sanitária)
  // Fórmula: (Área × R$ 1,14) + R$ 150 (vistoria)
  // ─────────────────────────────────────────────────────────────────────────────
  const habiteseSanitario = (totalRealArea * (taxes.habiteseSanitarioM2 || 1.14)) + 
                            (taxes.habiteseSanitarioVistoria || 150);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // AVERBAÇÃO DA CONSTRUÇÃO (Taxas Estaduais - SC)
  // Baseado em faixas de valor - Lei Complementar 755/2019
  // ─────────────────────────────────────────────────────────────────────────────
  const calcularAverbacao = (valor: number): number => {
    if (valor <= 19850.14) return 75.42 + 17.14;
    if (valor <= 33083.58) return 88.65 + 20.15;
    if (valor <= 66167.16) return 119.10 + 27.07;
    // Acima de R$ 66.167,16: base + 0,5% do excesso
    const excesso = valor - 66167.16;
    return 119.10 + (excesso * 0.005) + 27.07 + (excesso * 0.001);
  };
  const averbacao = calcularAverbacao(valorImovel);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // ESCRITURA E REGISTRO (inclui ITBI apenas se não possui terreno)
  // ITBI: 2% do valor (somente para compra de terreno)
  // Emolumentos: conforme faixas
  // ─────────────────────────────────────────────────────────────────────────────
  // ITBI só é cobrado quando o usuário NÃO possui terreno (precisa comprar)
  const itbi = hasLand === false ? valorImovel * 0.02 : 0;
  const calcularEmolumentos = (valor: number): number => {
    if (valor <= 265000) return 519.86;
    if (valor <= 530000) return 519.86 + ((valor - 265000) * 0.003);
    return 1314.86 + ((valor - 530000) * 0.002);
  };
  const emolumentos = calcularEmolumentos(valorImovel);
  const taxasFixas = 150;
  const escrituraRegistro = itbi + emolumentos + taxasFixas;
  
  // ─────────────────────────────────────────────────────────────────────────────
  // TOTAL DE SOFT COSTS (Taxas e Impostos)
  // ─────────────────────────────────────────────────────────────────────────────
  const softCost = alvaraTotal + artRrt + issEstimado + inssObra + 
                   habiteSe + habiteseSanitario + averbacao + escrituraRegistro;
  
  // Montar lista de taxas - ITBI separado para clareza
  const taxDetails: TaxDetail[] = [
    { name: 'Alvará de Construção', value: alvaraTotal, phase: 'pre' as const },
    { name: 'ART/RRT (CREA + CAU)', value: artRrt, phase: 'pre' as const },
    { name: `ISS (${(taxes.iss * 100).toFixed(0)}%)`, value: issEstimado, phase: 'construction' as const },
    { name: 'INSS da Obra (11%)', value: inssObra, phase: 'construction' as const },
    { name: 'Habite-se', value: habiteSe, phase: 'post' as const },
    { name: 'Habite-se Sanitário', value: habiteseSanitario, phase: 'post' as const },
    { name: 'Averbação da Construção', value: averbacao, phase: 'post' as const },
    // ITBI só aparece se não possui terreno
    ...(itbi > 0 ? [{ name: 'ITBI (2%)', value: itbi, phase: 'pre' as const }] : []),
    { name: 'Escritura e Registro', value: emolumentos + taxasFixas, phase: 'post' as const },
  ].filter(t => t.value > 0);

  // ══════════════════════════════════════════════════════════════════════════════
  // DETALHAMENTO DE PROJETOS (valores por m²)
  // ══════════════════════════════════════════════════════════════════════════════
  // Valores de mercado para projetos técnicos (R$/m²)
  const PROJECT_RATES = {
    topografico: 6,      // R$ 6,00/m²
    arquitetonico: 100,  // R$ 100,00/m²
    estrutural: 25,      // R$ 25,00/m²
    hidraulico: 20,      // R$ 20,00/m²
    eletrico: 20,        // R$ 20,00/m²
    paisagismo: 12,      // R$ 12,00/m²
  };

  // Calcular cada projeto baseado na área total
  const projectDetails: ProjectDetail[] = [
    { name: 'Topográfico', value: totalRealArea * PROJECT_RATES.topografico, phase: 'pre' as const },
    { name: 'Arquitetônico', value: totalRealArea * PROJECT_RATES.arquitetonico, phase: 'pre' as const },
    { name: 'Estrutural', value: totalRealArea * PROJECT_RATES.estrutural, phase: 'pre' as const },
    { name: 'Hidrossanitário', value: totalRealArea * PROJECT_RATES.hidraulico, phase: 'pre' as const },
    { name: 'Elétrico', value: totalRealArea * PROJECT_RATES.eletrico, phase: 'pre' as const },
    { name: 'Paisagismo', value: totalRealArea * PROJECT_RATES.paisagismo, phase: 'pre' as const },
  ];

  // Total de projetos
  const projectFees = projectDetails.reduce((sum, p) => sum + p.value, 0);

  // ══════════════════════════════════════════════════════════════════════════════
  // COMPOSIÇÃO DO CUSTO DA OBRA (HARD COST)
  // ══════════════════════════════════════════════════════════════════════════════
  // Distribuição típica em construção residencial de alto padrão
  const administrationFee = hardCost * ADMINISTRATION_FEE_RATE;
  
  const costComposition: CostComposition = {
    laborCost: hardCost * 0.45,        // 45% - Mão de Obra
    materialsCost: hardCost * 0.50,    // 50% - Materiais/Insumos
    equipmentCost: hardCost * 0.05,    // 5% - Equipamentos
    administrationCost: administrationFee, // 15% sobre o hardCost
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // CÁLCULO DE CONTINGÊNCIA E CUSTO AJUSTADO
  // ══════════════════════════════════════════════════════════════════════════════
  const totalCost = hardCost + softCost + projectFees + administrationFee;
  const contingencyValue = totalCost * (scenarioInfo.risk.contingencyPercent / 100);
  const adjustedTotalCost = totalCost + contingencyValue;
  
  // Prazo ajustado pelo multiplicador do cenário
  const adjustedDeadlineMonths = Math.ceil(deadlineMonths * scenarioInfo.scheduleMultiplier);

  // Montar resultado do cenário
  const scenarioResult: ScenarioResult = {
    id: scenarioId,
    label: scenarioInfo.label,
    description: scenarioInfo.description,
    costMultiplier: scenarioCostMultiplier,
    scheduleMultiplier: scenarioInfo.scheduleMultiplier,
    risk: {
      level: scenarioInfo.risk.level,
      label: scenarioInfo.risk.label,
      contingencyPercent: scenarioInfo.risk.contingencyPercent,
      contingencyValue,
      notes: scenarioInfo.risk.notes,
    }
  };

  return {
    equivalentArea,
    baseCost,
    hardCost,
    softCost,
    projectFees,
    administrationFee,
    totalCost,
    adjustedTotalCost,
    factors: {
      region: regionalFactor,
      city: cityFactor,
      topography: topographyFactor,
      method: methodFactor,
      scenario: scenarioCostMultiplier,
      subfloorDepth: depthMultiplier
    },
    cubUsed: cubValue,
    scenario: scenarioResult,
    adjustedDeadlineMonths,
    // Novos campos detalhados
    projectDetails,
    taxDetails,
    costComposition,
  };
};

export interface ScheduleOptions {
  /** Multiplicador de prazo do cenário (ex: 1.5x para cenários complexos) */
  scheduleMultiplier?: number;
  /** Multiplicadores por fase específica do cenário */
  phaseMultipliers?: {
    foundations?: number;
    structure?: number;
    earthwork?: number;
    containment?: number;
    drainage?: number;
  };
}

export const generateDetailedSchedule = (
  totalCost: number, 
  deadlineMonths: number,
  hardCost?: number,
  options?: ScheduleOptions
): DetailedPhase[] => {
  const inflationRate = MARKET_DATA.region.monthlyInflation;
  const constructionPhases = PHASE_DEFINITIONS.filter(p => p.type === 'construction');
  const numConstruction = constructionPhases.length;
  
  // Aplicar multiplicador de cronograma do cenário
  const scheduleMultiplier = options?.scheduleMultiplier || 1.0;
  const adjustedDeadline = Math.ceil(deadlineMonths * scheduleMultiplier);
  
  const phaseDuration = Math.max(1, Math.ceil(adjustedDeadline * 0.3));

  // Calcular número de meses pré-obra (aproximadamente 35% do prazo total)
  const preConstructionMonths = Math.max(1, Math.ceil(adjustedDeadline * 0.35));

  const phases: DetailedPhase[] = PHASE_DEFINITIONS.map((def, index) => {
    let startMonth = 0;
    let endMonth = 0;

    if (def.type === 'pre') {
      // Fases pré-obra: distribuídas nos primeiros meses
      const preIndex = index;
      const prePhaseCount = PHASE_DEFINITIONS.filter(p => p.type === 'pre').length;
      const monthsPerPrePhase = Math.max(1, Math.ceil(preConstructionMonths / prePhaseCount));
      startMonth = Math.max(1, preIndex * monthsPerPrePhase + 1);
      endMonth = Math.min(preConstructionMonths, startMonth + monthsPerPrePhase - 1);
    } else if (def.type === 'post') {
      startMonth = adjustedDeadline + 1;
      endMonth = adjustedDeadline + 1;
    } else {
      // Fases de construção: após período pré-obra
      const constructionIndex = index - PHASE_DEFINITIONS.filter(p => p.type === 'pre').length;
      const constructionStart = preConstructionMonths + 1;
      const constructionDuration = adjustedDeadline - preConstructionMonths;
      const step = (constructionDuration - phaseDuration) / (numConstruction - 1 || 1);
      startMonth = Math.round(constructionStart + (constructionIndex * step));
      endMonth = Math.min(adjustedDeadline, startMonth + phaseDuration - 1);
      if (endMonth < startMonth) endMonth = startMonth;
    }

    // Aplicar multiplicador de fase específico se disponível
    let phaseWeight = def.weight;
    if (options?.phaseMultipliers) {
      const pm = options.phaseMultipliers;
      // Mapear fases específicas para seus multiplicadores
      if (def.id === 'c3' && pm.foundations) {
        phaseWeight *= pm.foundations;
      } else if (def.id === 'c4' && pm.structure) {
        phaseWeight *= pm.structure;
      }
      // Nota: terraplanagem e contenção não estão no PHASE_DEFINITIONS atual,
      // mas podem ser adicionadas futuramente
    }

    const baseValue = totalCost * phaseWeight;
    const midMonth = (startMonth + endMonth) / 2;
    const inflatedValue = baseValue * Math.pow(1 + inflationRate, midMonth);

    return {
      ...def,
      startMonth,
      endMonth,
      baseValue,
      inflatedValue
    } as DetailedPhase;
  });

  // ══════════════════════════════════════════════════════════════════════════════
  // TAXA DE ADMINISTRAÇÃO DE OBRA (15% do hardCost)
  // Distribuída ao longo de todos os meses, com peso reduzido na pré-obra
  // ══════════════════════════════════════════════════════════════════════════════
  if (hardCost && hardCost > 0) {
    const adminTotal = hardCost * ADMINISTRATION_FEE_RATE;
    
    // Gerar pesos mensais para administração (usando prazo ajustado)
    const adminWeights = generateAdminDistributionWeights(adjustedDeadline, preConstructionMonths);
    
    // Criar fases de administração mês a mês
    for (let month = 1; month <= adjustedDeadline; month++) {
      const weight = adminWeights[month - 1];
      const baseValue = adminTotal * weight;
      const inflatedValue = baseValue * Math.pow(1 + inflationRate, month);
      
      phases.push({
        id: `admin-${month}`,
        name: 'Administração de Obra',
        type: 'admin',
        weight: weight,
        startMonth: month,
        endMonth: month,
        baseValue,
        inflatedValue
      });
    }
  }

  return phases;
};

/**
 * Gera pesos de distribuição para a Taxa de Administração de Obra.
 * 
 * Lógica:
 * - Pré-obra: peso reduzido (50% do normal)
 * - Execução: peso aumentado para compensar
 * - Soma total dos pesos = 1
 * 
 * @param totalMonths - Duração total da obra em meses
 * @param preMonths - Número de meses de pré-obra
 * @returns Array de pesos normalizados (soma = 1)
 */
function generateAdminDistributionWeights(totalMonths: number, preMonths: number): number[] {
  const executionMonths = totalMonths - preMonths;
  
  // Peso base se fosse distribuição uniforme
  const uniformWeight = 1 / totalMonths;
  
  // Peso reduzido para pré-obra
  const preWeight = uniformWeight * PRE_CONSTRUCTION_ADMIN_WEIGHT;
  
  // Soma consumida pela pré-obra
  const preTotalWeight = preWeight * preMonths;
  
  // Peso restante para distribuir na execução
  const executionTotalWeight = 1 - preTotalWeight;
  const executionWeight = executionMonths > 0 ? executionTotalWeight / executionMonths : 0;
  
  // Gerar array de pesos
  const weights: number[] = [];
  for (let i = 0; i < totalMonths; i++) {
    if (i < preMonths) {
      weights.push(preWeight);
    } else {
      weights.push(executionWeight);
    }
  }
  
  // Normalizar para garantir soma = 1 (floating point safety)
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
}
