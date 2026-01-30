/**
 * ══════════════════════════════════════════════════════════════════════════════
 * SCHEMA DE 6 FASES MACRO COM SUBFASES EXPANSÍVEIS
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Define a estrutura de 6 fases macro que agrupam as 19 fases originais.
 * Cada fase macro contém subfases que podem ser condicionais ou sempre visíveis.
 * 
 * Estrutura:
 * 1. Planejamento e Projetos (pré-obra)
 * 2. Mobilização e Canteiro (início de obra)
 * 3. Infraestrutura, Fundações e Contenções (fundações)
 * 4. Estrutura e Envoltória (superestrutura + vedações + cobertura)
 * 5. Instalações e Acabamentos (MEP + revestimentos + pintura)
 * 6. Entrega e Finalização (limpeza + paisagismo)
 * 
 * Regras de Inferência Determinísticas:
 * - Existência de subsolo: subsoilArea > 0
 * - Existência de pavimento superior: upperFloorArea > 0
 * - Terreno não plano: topography !== 'flat'
 * 
 * Referência: PROPOSTA_TECNICA_FASES_EXPANSIVEIS.md
 */

import { Phase, PHASES_SCHEMA_VERSION } from '../types/phases';

// ══════════════════════════════════════════════════════════════════════════════
// MAPEAMENTO: IDs originais (PHASE_DEFINITIONS) → Fases Macro
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Mapeia cada fase original para sua fase macro correspondente.
 */
export const PHASE_MAPPING: Record<string, string> = {
  // Fase 1: Planejamento
  'p1': 'macro-01', // Planejamento e Orçamentação
  'p2': 'macro-01', // Definição de Escopo
  'p3': 'macro-01', // Preparação de Obra
  'p4': 'macro-01', // Cronograma Físico-Financeiro
  'p5': 'macro-01', // Gestão de Suprimentos
  
  // Fase 2: Mobilização
  'c1': 'macro-02', // Instalação de Canteiro
  'c2': 'macro-02', // Mobilização
  
  // Fase 3: Infraestrutura e Fundações
  'c3': 'macro-03', // Infraestrutura e Fundações
  
  // Fase 4: Estrutura e Envoltória
  'c4': 'macro-04', // Supraestrutura (Estrutura)
  'c5': 'macro-04', // Alvenaria e Vedações
  'c6': 'macro-04', // Cobertura e Telhado
  'c7': 'macro-04', // Esquadrias
  
  // Fase 5: Instalações e Acabamentos
  'c8': 'macro-05',  // Instalações Hidrossanitárias
  'c9': 'macro-05',  // Instalações Elétricas
  'c10': 'macro-05', // Revestimentos Internos
  'c11': 'macro-05', // Fachada e Rev. Externos
  'c12': 'macro-05', // Pintura
  'c13': 'macro-05', // Serviços Complementares
  
  // Fase 6: Entrega
  'f1': 'macro-06', // Paisagismo e Limpeza Final
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 1: PLANEJAMENTO E PROJETOS
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_PLANNING: Phase = {
  id: 'macro-01',
  name: 'Planejamento e Projetos',
  description: 'Desenvolvimento de projetos técnicos, orçamentação e preparação',
  detailedExplanation: 'Inclui aprovação de projetos na prefeitura, contratação de arquiteto e engenheiros, elaboração de cronograma físico-financeiro e definição do escopo completo. Esta fase ocorre antes do início físico da obra.',
  basePercentage: 4, // p1+p2+p3+p4+p5 = 1+1+1+0.5+0.5 = 4%
  durationPercentage: 15, // Duração típica: 15% do prazo total (pré-obra)
  icon: 'FileText',
  color: '#3B82F6',
  phaseType: 'pre',
  originalPhaseId: 'p1,p2,p3,p4,p5',
  
  subPhases: [
    {
      id: 'macro-01-sub-01',
      name: 'Planejamento e Orçamentação',
      description: 'Levantamento de custos, cronograma inicial e definição de metas',
      condition: { type: 'always' },
      estimatedPercentage: 25,
      order: 1,
      isCritical: false,
      icon: 'Calculator'
    },
    {
      id: 'macro-01-sub-02',
      name: 'Definição de Escopo',
      description: 'Especificação técnica detalhada e memorial descritivo',
      condition: { type: 'always' },
      estimatedPercentage: 25,
      order: 2,
      isCritical: false,
      icon: 'ClipboardList'
    },
    {
      id: 'macro-01-sub-03',
      name: 'Preparação de Obra',
      description: 'Licenças, alvarás e documentação legal',
      condition: { type: 'always' },
      estimatedPercentage: 25,
      order: 3,
      isCritical: false,
      icon: 'FileCheck'
    },
    {
      id: 'macro-01-sub-04',
      name: 'Cronograma e Suprimentos',
      description: 'Planejamento físico-financeiro e gestão de compras',
      condition: { type: 'always' },
      estimatedPercentage: 25,
      order: 4,
      isCritical: false,
      icon: 'Calendar'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 2: MOBILIZAÇÃO E CANTEIRO
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_MOBILIZATION: Phase = {
  id: 'macro-02',
  name: 'Mobilização e Canteiro',
  description: 'Instalação do canteiro de obras e mobilização de equipes',
  detailedExplanation: 'Montagem de tapumes, instalação do escritório de obra, vestiários, sanitários e depósitos de materiais. Contratação da mão de obra inicial e primeiras compras. Representa o marco de início físico da construção.',
  basePercentage: 5, // c1+c2 = 3+2 = 5%
  durationPercentage: 8, // Duração típica: 8% do prazo total
  icon: 'HardHat',
  color: '#059669',
  phaseType: 'construction',
  originalPhaseId: 'c1,c2',
  
  subPhases: [
    {
      id: 'macro-02-sub-01',
      name: 'Instalação de Canteiro',
      description: 'Barracões, instalações provisórias, tapumes e acessos',
      condition: { type: 'always' },
      estimatedPercentage: 60,
      order: 1,
      isCritical: false,
      icon: 'Building2'
    },
    {
      id: 'macro-02-sub-02',
      name: 'Mobilização de Equipes',
      description: 'Contratação e alocação de mão de obra inicial',
      condition: { type: 'always' },
      estimatedPercentage: 40,
      order: 2,
      isCritical: false,
      icon: 'Users'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 3: INFRAESTRUTURA, FUNDAÇÕES E CONTENÇÕES
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_FOUNDATIONS: Phase = {
  id: 'macro-03',
  name: 'Infraestrutura e Fundações',
  description: 'Preparação do terreno, fundações e estruturas de contenção',
  detailedExplanation: 'Fase crítica que define a estabilidade da obra. Inclui limpeza do terreno, movimentação de terra, execução de estacas ou sapatas, vigas baldrame e impermeabilização. Terrenos em declive ou com subsolo exigem cuidado especial com contenções e drenagem.',
  basePercentage: 7, // c3 = 7%
  durationPercentage: 15, // Duração típica: 15% do prazo total
  icon: 'Shovel',
  color: '#8B4513',
  phaseType: 'construction',
  originalPhaseId: 'c3',
  
  subPhases: [
    {
      id: 'macro-03-sub-01',
      name: 'Limpeza e Demarcação',
      description: 'Remoção de vegetação, entulhos e marcação topográfica',
      condition: { type: 'always' },
      estimatedPercentage: 10,
      order: 1,
      isCritical: false,
      icon: 'Trash2'
    },
    {
      id: 'macro-03-sub-02',
      name: 'Cortes e Aterros',
      description: 'Movimentação de terra para nivelamento',
      condition: {
        type: 'conditional',
        rules: [{ field: 'topography', operator: 'notEquals', value: 'flat' }]
      },
      estimatedPercentage: 20,
      order: 2,
      isCritical: true,
      icon: 'TrendingUp'
    },
    {
      id: 'macro-03-sub-03',
      name: 'Contenções e Muros de Arrimo',
      description: 'Estruturas de contenção para estabilização de taludes',
      condition: {
        type: 'conditional',
        rules: [{ field: 'topography', operator: 'includes', value: ['slope_light', 'slope_high'] }]
      },
      estimatedPercentage: 25,
      order: 3,
      isCritical: true,
      icon: 'Layers'
    },
    {
      id: 'macro-03-sub-04',
      name: 'Escavação para Subsolo',
      description: 'Escavação profunda para pavimento inferior',
      condition: {
        type: 'conditional',
        rules: [{ field: 'subsoilArea', operator: 'greaterThan', value: 0 }]
      },
      estimatedPercentage: 30,
      order: 4,
      isCritical: true,
      icon: 'ArrowDownCircle'
    },
    {
      id: 'macro-03-sub-05',
      name: 'Fundações Rasas',
      description: 'Sapatas isoladas, vigas baldrame e radier',
      condition: {
        type: 'conditional',
        rules: [
          { field: 'topography', operator: 'equals', value: 'flat' },
          { field: 'subsoilArea', operator: 'equals', value: 0, combineWith: 'AND' }
        ]
      },
      estimatedPercentage: 35,
      order: 5,
      isCritical: false,
      icon: 'Square'
    },
    {
      id: 'macro-03-sub-06',
      name: 'Fundações Profundas',
      description: 'Estacas e blocos de coroamento',
      condition: {
        type: 'conditional',
        rules: [{ field: 'topography', operator: 'notEquals', value: 'flat' }]
      },
      estimatedPercentage: 40,
      order: 6,
      isCritical: true,
      icon: 'ArrowDown'
    },
    {
      id: 'macro-03-sub-07',
      name: 'Drenagem e Impermeabilização',
      description: 'Sistema de drenagem subsuperficial',
      condition: {
        type: 'conditional',
        rules: [{ field: 'subsoilArea', operator: 'greaterThan', value: 0 }]
      },
      estimatedPercentage: 15,
      order: 7,
      isCritical: false,
      icon: 'Droplets'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 4: ESTRUTURA E ENVOLTÓRIA
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_STRUCTURE: Phase = {
  id: 'macro-04',
  name: 'Estrutura e Envoltória',
  description: 'Superestrutura, vedações, cobertura e esquadrias',
  detailedExplanation: 'Maior concentração de custos e tempo. Execução de pilares, vigas e lajes (concreto armado ou pré-moldado), fechamento com alvenaria ou drywall, telhado completo e instalação de portas e janelas. A obra "fecha" nesta fase, protegendo contra intempéries.',
  basePercentage: 37, // c4+c5+c6+c7 = 16+4+5+12 = 37%
  durationPercentage: 30, // Duração típica: 30% do prazo total
  icon: 'Building',
  color: '#6B7280',
  phaseType: 'construction',
  originalPhaseId: 'c4,c5,c6,c7',
  
  subPhases: [
    {
      id: 'macro-04-sub-01',
      name: 'Estrutura do Subsolo',
      description: 'Pilares, vigas e laje do pavimento inferior',
      condition: {
        type: 'conditional',
        rules: [{ field: 'subsoilArea', operator: 'greaterThan', value: 0 }]
      },
      estimatedPercentage: 15,
      order: 1,
      isCritical: true,
      icon: 'ArrowDownCircle'
    },
    {
      id: 'macro-04-sub-02',
      name: 'Estrutura do Térreo',
      description: 'Pilares, vigas e laje do pavimento térreo',
      condition: { type: 'always' },
      estimatedPercentage: 20,
      order: 2,
      isCritical: false,
      icon: 'Square'
    },
    {
      id: 'macro-04-sub-03',
      name: 'Estrutura do Pavimento Superior',
      description: 'Pilares, vigas e laje do andar superior',
      condition: {
        type: 'conditional',
        rules: [{ field: 'upperFloorArea', operator: 'greaterThan', value: 0 }]
      },
      estimatedPercentage: 20,
      order: 3,
      isCritical: false,
      icon: 'ArrowUpCircle'
    },
    {
      id: 'macro-04-sub-04',
      name: 'Alvenaria e Vedações',
      description: 'Paredes em blocos ou drywall',
      condition: { type: 'always' },
      estimatedPercentage: 12,
      order: 4,
      isCritical: false,
      icon: 'LayoutGrid'
    },
    {
      id: 'macro-04-sub-05',
      name: 'Cobertura e Telhado',
      description: 'Estrutura de telhado e telhas',
      condition: { type: 'always' },
      estimatedPercentage: 14,
      order: 5,
      isCritical: false,
      icon: 'Home'
    },
    {
      id: 'macro-04-sub-06',
      name: 'Esquadrias (Portas e Janelas)',
      description: 'Instalação de portas, janelas e vidros',
      condition: { type: 'always' },
      estimatedPercentage: 32,
      order: 6,
      isCritical: false,
      icon: 'DoorOpen'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 5: INSTALAÇÕES E ACABAMENTOS
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_FINISHING: Phase = {
  id: 'macro-05',
  name: 'Instalações e Acabamentos',
  description: 'Instalações hidráulicas, elétricas, revestimentos e pintura',
  detailedExplanation: 'Fase de maior custo unitário por m². Passa-se tubulações de água, esgoto, elétrica e gás. Aplicação de contrapiso, pisos, azulejos, forros de gesso, pintura interna/externa e revestimento de fachada. Cada escolha de acabamento impacta diretamente o custo final.',
  basePercentage: 44, // c8+c9+c10+c11+c12+c13 = 6+6+18+8+5+1 = 44%
  durationPercentage: 27, // Duração típica: 27% do prazo total
  icon: 'Paintbrush',
  color: '#8B5CF6',
  phaseType: 'construction',
  originalPhaseId: 'c8,c9,c10,c11,c12,c13',
  
  subPhases: [
    {
      id: 'macro-05-sub-01',
      name: 'Instalações Hidrossanitárias',
      description: 'Tubulações de água, esgoto e águas pluviais',
      condition: { type: 'always' },
      estimatedPercentage: 14,
      order: 1,
      isCritical: false,
      icon: 'Droplets'
    },
    {
      id: 'macro-05-sub-02',
      name: 'Instalações Elétricas',
      description: 'Fiação, quadros e pontos de luz/tomada',
      condition: { type: 'always' },
      estimatedPercentage: 14,
      order: 2,
      isCritical: false,
      icon: 'Zap'
    },
    {
      id: 'macro-05-sub-03',
      name: 'Revestimentos Internos',
      description: 'Pisos, azulejos, forros e acabamentos',
      condition: { type: 'always' },
      estimatedPercentage: 41,
      order: 3,
      isCritical: false,
      icon: 'Layers'
    },
    {
      id: 'macro-05-sub-04',
      name: 'Fachada e Revestimentos Externos',
      description: 'Acabamento externo e impermeabilização',
      condition: { type: 'always' },
      estimatedPercentage: 18,
      order: 4,
      isCritical: false,
      icon: 'Building2'
    },
    {
      id: 'macro-05-sub-05',
      name: 'Pintura',
      description: 'Pintura interna e externa',
      condition: { type: 'always' },
      estimatedPercentage: 11,
      order: 5,
      isCritical: false,
      icon: 'Paintbrush'
    },
    {
      id: 'macro-05-sub-06',
      name: 'Serviços Complementares',
      description: 'Instalações especiais e serviços finais',
      condition: { type: 'always' },
      estimatedPercentage: 2,
      order: 6,
      isCritical: false,
      icon: 'Wrench'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// FASE 6: ENTREGA E FINALIZAÇÃO
// ══════════════════════════════════════════════════════════════════════════════

const MACRO_PHASE_DELIVERY: Phase = {
  id: 'macro-06',
  name: 'Entrega e Finalização',
  description: 'Paisagismo, limpeza final e entrega da obra',
  detailedExplanation: 'Últimos ajustes, instalação de paisagismo, limpeza pós-obra, remoção de entulhos e vistoria final. Inclui obtenção do Habite-se junto à prefeitura e entrega das chaves. Fase relativamente rápida, mas essencial para a qualidade percebida.',
  basePercentage: 3, // f1 = 3%
  durationPercentage: 5, // Duração típica: 5% do prazo total (pós-obra)
  icon: 'CheckCircle',
  color: '#10B981',
  phaseType: 'post',
  originalPhaseId: 'f1',
  
  subPhases: [
    {
      id: 'macro-06-sub-01',
      name: 'Paisagismo',
      description: 'Jardins, gramado e áreas verdes',
      condition: { type: 'always' },
      estimatedPercentage: 40,
      order: 1,
      isCritical: false,
      icon: 'TreeDeciduous'
    },
    {
      id: 'macro-06-sub-02',
      name: 'Limpeza Final',
      description: 'Limpeza pós-obra e remoção de entulhos',
      condition: { type: 'always' },
      estimatedPercentage: 30,
      order: 2,
      isCritical: false,
      icon: 'Sparkles'
    },
    {
      id: 'macro-06-sub-03',
      name: 'Vistoria e Entrega',
      description: 'Verificação final e entrega de chaves',
      condition: { type: 'always' },
      estimatedPercentage: 30,
      order: 3,
      isCritical: false,
      icon: 'Key'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// EXPORTAÇÃO
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Schema das 6 fases macro com subfases expansíveis.
 */
export const MACRO_PHASES_SCHEMA: Phase[] = [
  MACRO_PHASE_PLANNING,
  MACRO_PHASE_MOBILIZATION,
  MACRO_PHASE_FOUNDATIONS,
  MACRO_PHASE_STRUCTURE,
  MACRO_PHASE_FINISHING,
  MACRO_PHASE_DELIVERY
];

/**
 * Obtém a fase macro pelo ID.
 */
export function getMacroPhaseById(id: string): Phase | undefined {
  return MACRO_PHASES_SCHEMA.find(p => p.id === id);
}

/**
 * Obtém a fase macro que contém uma fase original específica.
 */
export function getMacroPhaseByOriginalId(originalId: string): Phase | undefined {
  const macroId = PHASE_MAPPING[originalId];
  return macroId ? getMacroPhaseById(macroId) : undefined;
}

/**
 * Metadados do schema.
 */
export const MACRO_PHASES_METADATA = {
  version: PHASES_SCHEMA_VERSION,
  lastUpdated: '2026-01-13',
  totalMacroPhases: MACRO_PHASES_SCHEMA.length,
  totalOriginalPhases: Object.keys(PHASE_MAPPING).length
};

// Manter exports anteriores para compatibilidade
export const PHASES_SCHEMA = MACRO_PHASES_SCHEMA;
export const PILOT_PHASE = MACRO_PHASE_FOUNDATIONS;
