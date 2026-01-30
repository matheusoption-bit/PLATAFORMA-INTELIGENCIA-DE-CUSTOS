export const MARKET_DATA = {
  region: {
    uf: "SC",
    name: "Santa Catarina",
    // Fonte: comparacao_fatores.csv (SC)
    regionalFactor: 1.4178,
    // Fonte: fact_cub_historico.csv (Estimativa Jan/2026 para R1-A)
    cubValues: {
      "R1-B": 2450.00, // Estimado Baixo
      "R1-N": 2916.12, // CUB SINDUSCON-SC Janeiro/2026
      "R1-A": 3350.00  // Estimado Alto
    },
    monthlyInflation: 0.0085 // 0.85% a.m.
  },
  
  // ══════════════════════════════════════════════════════════════════════════════
  // TAXAS E IMPOSTOS POR CIDADE - Baseado em pesquisa legislativa detalhada
  // Fonte: Códigos Tributários Municipais, Lei Complementar 755/2019 (SC)
  // ══════════════════════════════════════════════════════════════════════════════
  cities: {
    "palhoca": { 
      name: "Palhoça", 
      factor: 1.05, 
      taxes: { 
        // ISS: 5% sobre mão de obra (Lei Complementar 2218/2005)
        iss: 0.05,
        // Alvará: R$ 2,19/m² + R$ 150,00 fixo
        alvaraBase: 150,
        alvaraM2: 2.19,
        // Habite-se: R$ 8,50/m²
        habiteseM2: 8.50,
        // Habite-se Sanitário: R$ 1,14/m² + R$ 150 vistoria
        habiteseSanitarioM2: 1.14,
        habiteseSanitarioVistoria: 150,
        // INSS: 11% sobre 50% do valor (mão de obra estimada)
        inssAliquota: 0.11,
        inssBasePercent: 0.50,
        // ART/RRT: R$ 430 (até 200m²), R$ 650 (200-400m²)
        artRrtBase: 430,
        artRrtMedio: 650,
      } 
    },
    "sao_jose": { 
      name: "São José", 
      factor: 1.12, 
      taxes: { 
        // ISS: 2% (Lei Complementar 5938/2020)
        iss: 0.02,
        // Alvará: R$ 1,85/m² + R$ 120,00 fixo
        alvaraBase: 120,
        alvaraM2: 1.85,
        // Habite-se: R$ 6,20/m² (mínimo R$ 300)
        habiteseM2: 6.20,
        habiteseMinimo: 300,
        // Habite-se Sanitário
        habiteseSanitarioM2: 1.14,
        habiteseSanitarioVistoria: 150,
        // INSS
        inssAliquota: 0.11,
        inssBasePercent: 0.50,
        // ART/RRT
        artRrtBase: 430,
        artRrtMedio: 650,
      } 
    },
    "florianopolis": { 
      name: "Florianópolis", 
      factor: 1.18, 
      taxes: { 
        // ISS: 3% (Lei Complementar 5054/97)
        iss: 0.03,
        // Alvará: Sistema UFIR complexo - valor médio estimado
        alvaraBase: 500,
        alvaraM2: 3.50,
        // Habite-se: R$ 12,00/m² + R$ 500 análise
        habiteseM2: 12.00,
        habiteseFixo: 500,
        // Habite-se Sanitário
        habiteseSanitarioM2: 1.14,
        habiteseSanitarioVistoria: 200,
        // INSS
        inssAliquota: 0.11,
        inssBasePercent: 0.50,
        // ART/RRT
        artRrtBase: 430,
        artRrtMedio: 650,
      } 
    },
    "biguacu": { 
      name: "Biguaçu", 
      factor: 1.02, 
      taxes: { 
        // ISS: 2,5%
        iss: 0.025,
        // Alvará
        alvaraBase: 100,
        alvaraM2: 1.75,
        // Habite-se
        habiteseM2: 6.50,
        // Habite-se Sanitário
        habiteseSanitarioM2: 1.14,
        habiteseSanitarioVistoria: 150,
        // INSS
        inssAliquota: 0.11,
        inssBasePercent: 0.50,
        // ART/RRT
        artRrtBase: 430,
        artRrtMedio: 650,
      } 
    },
    "santo_amaro": { 
      name: "Santo Amaro da Imperatriz", 
      factor: 1.00, 
      taxes: { 
        // ISS: 2%
        iss: 0.02,
        // Alvará
        alvaraBase: 80,
        alvaraM2: 1.50,
        // Habite-se
        habiteseM2: 5.00,
        // Habite-se Sanitário
        habiteseSanitarioM2: 1.14,
        habiteseSanitarioVistoria: 130,
        // INSS
        inssAliquota: 0.11,
        inssBasePercent: 0.50,
        // ART/RRT
        artRrtBase: 430,
        artRrtMedio: 650,
      } 
    }
  },
  
  // ══════════════════════════════════════════════════════════════════════════════
  // TAXAS ESTADUAIS E CARTORIAIS (Santa Catarina)
  // Fonte: Lei Complementar Estadual 755/2019, Circular 551/2024
  // ══════════════════════════════════════════════════════════════════════════════
  estadual: {
    // ITBI - Imposto de Transmissão (municipal, mas uniforme)
    itbiAliquota: 0.02, // 2%
    
    // Averbação - Faixas de emolumentos
    averbacao: {
      faixas: [
        { ate: 19850.14, emolumentos: 75.42, taxaJudiciaria: 17.14 },
        { ate: 33083.58, emolumentos: 88.65, taxaJudiciaria: 20.15 },
        { ate: 66167.16, emolumentos: 119.10, taxaJudiciaria: 27.07 },
        { ate: Infinity, emolumentos: 119.10, taxaJudiciariaBase: 27.07, percentualExcesso: 0.005, percentualExcessoTaxa: 0.001 }
      ]
    },
    
    // Escritura - Faixas de emolumentos
    escritura: {
      faixas: [
        { ate: 265000, emolumentos: 519.86 },
        { ate: 530000, emolumentosBase: 519.86, percentualExcesso: 0.003 },
        { ate: Infinity, emolumentosBase: 1314.86, percentualExcesso: 0.002 }
      ],
      taxasFixas: 150 // Taxas administrativas
    }
  },
  // Fonte: dim_metodo_fase2.csv (Razão sobre base 1200)
  constructionMethods: {
    masonry:    { label: "Alvenaria Convencional", factor: 1.00 },
    steelFrame: { label: "Steel Frame", factor: 1.125 }, // 1350/1200
    woodFrame:  { label: "Wood Frame", factor: 1.083 },  // 1300/1200
    eps:        { label: "EPS / ICF", factor: 1.041 },   // 1250/1200
    container:  { label: "Contêineres", factor: 0.916 }  // 1100/1200
  },
  // Fonte: dim_cub_tipologia.csv
  finishStandards: {
    low:    { label: "Padrão Baixo (R1-B)", cubCode: "R1-B" },
    normal: { label: "Padrão Normal (R1-N)", cubCode: "R1-N" },
    high:   { label: "Padrão Alto (R1-A)", cubCode: "R1-A" }
  },
  constructionFactors: {
    subfloor: 1.25, // Subsolo
    ground: 1.00,
    upper: 0.98
  },
  topography: {
    flat: 1.00,
    slope_light: 1.08,
    slope_high: 1.25
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // CENÁRIOS DE CONSTRUÇÃO - Baseado em análise técnica de engenharia
  // Fonte: documentos técnicos de fase/mapeamento de custos residenciais SC
  // ══════════════════════════════════════════════════════════════════════════════
  scenarios: {
    // Cenário 1: Terreno plano sem subsolo (referência base)
    flat_no_subfloor: {
      id: 'flat_no_subfloor',
      label: 'Plano sem Subsolo',
      description: 'Terreno plano, fundação simples, sem movimentação de terra significativa',
      totalCostMultiplier: 1.0,
      scheduleMultiplier: 1.0,
      phaseMultipliers: {
        foundations: 1.0,
        structure: 1.0,
        earthwork: 1.0,
        containment: 0.0,
        drainage: 0.5,
      },
      risk: {
        level: 'baixo' as const,
        label: 'Baixo Risco',
        color: 'green',
        contingencyPercent: 5,
        notes: ['Execução convencional', 'Menor complexidade técnica'],
      }
    },
    // Cenário 2: Terreno plano COM subsolo
    flat_with_subfloor: {
      id: 'flat_with_subfloor',
      label: 'Plano com Subsolo',
      description: 'Terreno plano com escavação para subsolo, requer escoramento e drenagem',
      totalCostMultiplier: 1.25,
      scheduleMultiplier: 1.20,
      phaseMultipliers: {
        foundations: 1.35,
        structure: 1.15,
        earthwork: 2.0,
        containment: 1.0,
        drainage: 1.5,
      },
      risk: {
        level: 'medio' as const,
        label: 'Risco Médio',
        color: 'yellow',
        contingencyPercent: 10,
        notes: ['Escavação profunda requer cuidado', 'Verificar lençol freático'],
      }
    },
    // Cenário 3: Aclive sem subsolo
    slope_up_no_subfloor: {
      id: 'slope_up_no_subfloor',
      label: 'Aclive sem Subsolo',
      description: 'Terreno em aclive, requer corte de terreno e possível contenção',
      totalCostMultiplier: 1.35,
      scheduleMultiplier: 1.30,
      phaseMultipliers: {
        foundations: 1.40,
        structure: 1.10,
        earthwork: 2.5,
        containment: 0.8,
        drainage: 1.2,
      },
      risk: {
        level: 'medio' as const,
        label: 'Risco Médio',
        color: 'yellow',
        contingencyPercent: 12,
        notes: ['Movimentação de terra significativa', 'Contenção pode ser necessária'],
      }
    },
    // Cenário 4: Aclive COM subsolo (cenário mais complexo em aclive)
    slope_up_with_subfloor: {
      id: 'slope_up_with_subfloor',
      label: 'Aclive com Subsolo',
      description: 'Terreno em aclive com subsolo, alta complexidade de fundação e contenção',
      totalCostMultiplier: 1.55,
      scheduleMultiplier: 1.52,
      phaseMultipliers: {
        foundations: 1.80,
        structure: 1.25,
        earthwork: 3.0,
        containment: 1.5,
        drainage: 2.0,
      },
      risk: {
        level: 'alto' as const,
        label: 'Risco Alto',
        color: 'orange',
        contingencyPercent: 18,
        notes: [
          'Complexidade estrutural elevada',
          'Contenção robusta obrigatória',
          'Drenagem crítica para estabilidade'
        ],
      }
    },
    // Cenário 5: Declive sem subsolo
    slope_down_no_subfloor: {
      id: 'slope_down_no_subfloor',
      label: 'Declive sem Subsolo',
      description: 'Terreno em declive, fundação em desnível com pilares alongados',
      totalCostMultiplier: 1.45,
      scheduleMultiplier: 1.40,
      phaseMultipliers: {
        foundations: 1.60,
        structure: 1.30,
        earthwork: 1.8,
        containment: 0.6,
        drainage: 1.3,
      },
      risk: {
        level: 'alto' as const,
        label: 'Risco Alto',
        color: 'orange',
        contingencyPercent: 15,
        notes: [
          'Pilares alongados aumentam custo estrutural',
          'Acesso de obra pode ser complicado'
        ],
      }
    },
    // Cenário 6: Declive COM subsolo (cenário mais crítico)
    slope_down_with_subfloor: {
      id: 'slope_down_with_subfloor',
      label: 'Declive com Subsolo',
      description: 'Cenário de maior complexidade: declive + subsolo = máxima contenção e estrutura',
      totalCostMultiplier: 1.85,
      scheduleMultiplier: 2.07,
      phaseMultipliers: {
        foundations: 2.20,
        structure: 1.50,
        earthwork: 4.0,
        containment: 2.0,
        drainage: 2.5,
      },
      risk: {
        level: 'critico' as const,
        label: 'Risco Crítico',
        color: 'red',
        contingencyPercent: 25,
        notes: [
          'Projeto estrutural especial obrigatório',
          'Contenção de alto porte',
          'Recomenda-se sondagem de solo',
          'Prazo estendido é inevitável'
        ],
      }
    }
  } as const,

  // ══════════════════════════════════════════════════════════════════════════════
  // PROFUNDIDADE DE SUBSOLO - Multiplicadores adicionais por profundidade
  // ══════════════════════════════════════════════════════════════════════════════
  subfloorDepth: {
    shallow: { label: 'Raso (até 1,5m)', multiplier: 1.0 },
    standard: { label: 'Padrão (1,5m a 3m)', multiplier: 1.15 },
    deep: { label: 'Profundo (3m a 5m)', multiplier: 1.35 },
    veryDeep: { label: 'Muito Profundo (>5m)', multiplier: 1.60 }
  },

  // ══════════════════════════════════════════════════════════════════════════════
  // TIPOS DE CONTENÇÃO - Opções e custos relativos
  // ══════════════════════════════════════════════════════════════════════════════
  containmentTypes: {
    none: { label: 'Sem contenção', costPerM2: 0, applicable: ['flat_no_subfloor'] },
    gabion: { label: 'Gabiões', costPerM2: 280, applicable: ['slope_up_no_subfloor', 'slope_down_no_subfloor'] },
    concrete_wall: { label: 'Muro de arrimo', costPerM2: 450, applicable: ['slope_up_no_subfloor', 'slope_up_with_subfloor', 'slope_down_no_subfloor'] },
    anchored_wall: { label: 'Cortina atirantada', costPerM2: 850, applicable: ['slope_up_with_subfloor', 'slope_down_with_subfloor'] },
    secant_piles: { label: 'Estacas secantes', costPerM2: 1200, applicable: ['flat_with_subfloor', 'slope_down_with_subfloor'] }
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS E INTERFACES DERIVADOS DO MARKET_DATA
// ══════════════════════════════════════════════════════════════════════════════

export type ScenarioId = keyof typeof MARKET_DATA.scenarios;
export type RiskLevel = 'baixo' | 'medio' | 'alto' | 'critico';

export interface ScenarioInfo {
  id: ScenarioId;
  label: string;
  description: string;
  totalCostMultiplier: number;
  scheduleMultiplier: number;
  phaseMultipliers: {
    foundations: number;
    structure: number;
    earthwork: number;
    containment: number;
    drainage: number;
  };
  risk: {
    level: RiskLevel;
    label: string;
    color: string;
    contingencyPercent: number;
    notes: readonly string[];
  };
}

// ══════════════════════════════════════════════════════════════════════════════
// FUNÇÕES UTILITÁRIAS PARA CENÁRIOS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Determina o cenário com base na topografia e presença de subsolo
 */
export function getScenarioId(
  topography: 'flat' | 'slope_light' | 'slope_high',
  hasSubfloor: boolean
): ScenarioId {
  // Mapear topografia para categoria de cenário
  const topoMap: Record<string, 'flat' | 'slope_up' | 'slope_down'> = {
    flat: 'flat',
    slope_light: 'slope_up', // Aclive leve → tratado como aclive
    slope_high: 'slope_down' // Declive acentuado → tratado como declive
  };

  const topoCategory = topoMap[topography] || 'flat';
  const suffix = hasSubfloor ? 'with_subfloor' : 'no_subfloor';

  return `${topoCategory}_${suffix}` as ScenarioId;
}

/**
 * Obtém informações completas do cenário
 */
export function getScenarioInfo(scenarioId: ScenarioId): ScenarioInfo {
  return MARKET_DATA.scenarios[scenarioId] as unknown as ScenarioInfo;
}

/**
 * Calcula o multiplicador total de custo para um cenário
 */
export function getTotalCostMultiplier(
  topography: 'flat' | 'slope_light' | 'slope_high',
  hasSubfloor: boolean
): number {
  const scenarioId = getScenarioId(topography, hasSubfloor);
  return MARKET_DATA.scenarios[scenarioId].totalCostMultiplier;
}

/**
 * Calcula o multiplicador de prazo para um cenário
 */
export function getScheduleMultiplier(
  topography: 'flat' | 'slope_light' | 'slope_high',
  hasSubfloor: boolean
): number {
  const scenarioId = getScenarioId(topography, hasSubfloor);
  return MARKET_DATA.scenarios[scenarioId].scheduleMultiplier;
}

/**
 * Obtém informações de risco para um cenário
 */
export function getScenarioRisk(
  topography: 'flat' | 'slope_light' | 'slope_high',
  hasSubfloor: boolean
) {
  const scenarioId = getScenarioId(topography, hasSubfloor);
  return MARKET_DATA.scenarios[scenarioId].risk;
}

/**
 * Retorna cor CSS para o nível de risco
 */
export function getRiskColorClasses(riskLevel: RiskLevel): { bg: string; text: string; border: string } {
  const colors: Record<RiskLevel, { bg: string; text: string; border: string }> = {
    baixo: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    medio: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-300' },
    alto: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
    critico: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300' }
  };
  return colors[riskLevel];
}