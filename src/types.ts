// Definições de tipos globais para a aplicação

export type PropertyType = 'residential' | 'commercial' | 'industrial';
export type FinishingStandard = 'low' | 'normal' | 'high';
export type TopographyType = 'flat' | 'slope_light' | 'slope_high';
export type ConstructionMethod = 'masonry' | 'steelFrame' | 'woodFrame' | 'eps' | 'container';
export type MaturityLevel = 'idea' | 'land' | 'project';
export type BasementIntent = 'yes' | 'no' | 'unknown' | null;
export type ProjectGoal = 'live' | 'invest' | 'sell' | 'evaluating' | null;
export type SiteType = 'gated_community' | 'open_community' | 'subdivision' | 'urban_land' | null;
export type LandStatus = 'owned' | 'negotiating' | 'no' | null;
export type SubfloorDepth = 'shallow' | 'standard' | 'deep' | 'veryDeep' | null;
export type ContainmentType = 'none' | 'gabion' | 'concrete_wall' | 'anchored_wall' | 'secant_piles' | null;

export interface AreaBreakdown {
  ground: number;
  upper: number;
  subfloor: number;
  outdoor: number;
}

// Estrutura completa dos dados do projeto
export interface ProjectData {
  userName: string;
  cityKey: string;
  neighborhood: string | null; // ID do bairro ou null se digitado manualmente
  neighborhoodCustom: string | null; // Nome do bairro digitado manualmente
  projectGoal: ProjectGoal;
  siteType: SiteType;
  
  // Controle de Maturidade (Inferência)
  hasLand: boolean | null; // derivado de landStatus para compatibilidade
  hasProject: boolean | null;
  maturity: MaturityLevel;
  
  // Status do Terreno (fonte de verdade)
  landStatus: LandStatus;
  landAreaM2: number | null; // área do terreno (m²) quando negotiating
  
  // Dados Técnicos
  topography: TopographyType;
  constructionMethod: ConstructionMethod;
  standard: FinishingStandard;
  
  // Dimensionamento
  areas: AreaBreakdown;
  basementIntent: BasementIntent;
  subfloorDepth: SubfloorDepth; // Profundidade do subsolo (apenas para maturity === 'project')
  containmentType: ContainmentType; // Tipo de contenção (apenas para topografia não plana E maturity === 'project')
  
  // Prazo (Econômico vs Definido)
  recommendedDeadlineMonths: number;
  deadlineMonths: number; // Input do usuário
  deadlineMode: 'auto' | 'manual'; // Controle de comportamento

  /**
   * Data de início do cálculo da inflação (INCC)
   */
  startDate?: string;
}

export interface WizardState {
  currentStep: number;
  data: ProjectData;
  isStepValid: boolean;
}

export interface MarketRate {
  region: string;
  type: string;
  pricePerSqm: number;
}