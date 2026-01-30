# Proposta Técnica: Sistema de Fases e Subfases Expansíveis

**Versão:** 1.0  
**Data:** 13 de janeiro de 2026  
**Autor:** GitHub Copilot (Claude Sonnet 4.5)

---

## 1. Visão Geral

### 1.1 Objetivo

Implementar um sistema hierárquico de visualização de fases de obra, permitindo que o usuário expanda cada fase para visualizar suas subfases correspondentes. A exibição deve ser dinâmica e condicional, baseada exclusivamente nos dados já coletados no fluxo do usuário.

### 1.2 Princípios de Design

- **Zero novas perguntas**: Toda lógica condicional usa apenas dados existentes
- **Inferência determinística**: Regras claras e explícitas (sem probabilidades)
- **Expansão progressiva**: Informação revelada sob demanda
- **Consistência semântica**: Subfases devem ser relevantes ao contexto do usuário

---

## 2. Arquitetura de Dados

### 2.1 Estrutura de Tipos

```typescript
// src/types/phases.ts

export interface PhaseCondition {
  type: 'always' | 'conditional';
  rules?: ConditionalRule[];
}

export interface ConditionalRule {
  field: keyof ConstructionData;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'includes';
  value: any;
  combineWith?: 'AND' | 'OR';
}

export interface SubPhase {
  id: string;
  name: string;
  description: string;
  condition: PhaseCondition;
  estimatedPercentage: number; // % dentro da fase pai
  order: number;
}

export interface Phase {
  id: string;
  name: string;
  description: string;
  basePercentage: number; // % do custo total
  subPhases: SubPhase[];
  icon?: string;
  color?: string;
}

export interface ExpandedPhaseState {
  [phaseId: string]: boolean;
}
```

### 2.2 Schema de Dados: Fases e Subfases

Criar arquivo: `src/data/phasesSchema.ts`

```typescript
export const PHASES_SCHEMA: Phase[] = [
  {
    id: 'phase-01',
    name: 'Projetos e Licenças',
    description: 'Desenvolvimento de projetos técnicos e aprovações legais',
    basePercentage: 6,
    icon: 'FileText',
    color: '#3B82F6',
    subPhases: [
      {
        id: 'phase-01-sub-01',
        name: 'Projeto Arquitetônico',
        description: 'Plantas, cortes, fachadas e detalhamentos',
        condition: { type: 'always' },
        estimatedPercentage: 35,
        order: 1
      },
      {
        id: 'phase-01-sub-02',
        name: 'Projeto Estrutural',
        description: 'Dimensionamento de fundações, pilares, vigas e lajes',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'tradicional'
            }
          ]
        },
        estimatedPercentage: 25,
        order: 2
      },
      {
        id: 'phase-01-sub-03',
        name: 'Projeto de Steel Frame',
        description: 'Detalhamento de estrutura metálica e conexões',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'steel-frame'
            }
          ]
        },
        estimatedPercentage: 30,
        order: 2
      },
      {
        id: 'phase-01-sub-04',
        name: 'Projeto Elétrico',
        description: 'Dimensionamento de rede, quadros e pontos',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 3
      },
      {
        id: 'phase-01-sub-05',
        name: 'Projeto Hidrossanitário',
        description: 'Água fria, esgoto, águas pluviais',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 4
      },
      {
        id: 'phase-01-sub-06',
        name: 'Aprovação em Condomínio',
        description: 'Análise e aprovação junto ao condomínio',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'siteType',
              operator: 'includes',
              value: ['condominio-fechado', 'condominio-aberto']
            }
          ]
        },
        estimatedPercentage: 10,
        order: 5
      },
      {
        id: 'phase-01-sub-07',
        name: 'Alvará de Construção',
        description: 'Aprovação na prefeitura',
        condition: { type: 'always' },
        estimatedPercentage: 10,
        order: 6
      }
    ]
  },
  {
    id: 'phase-02',
    name: 'Terraplanagem e Fundações',
    description: 'Preparação do terreno e execução de fundações',
    basePercentage: 15,
    icon: 'Mountain',
    color: '#8B4513',
    subPhases: [
      {
        id: 'phase-02-sub-01',
        name: 'Limpeza e Demarcação',
        description: 'Remoção de vegetação e marcação topográfica',
        condition: { type: 'always' },
        estimatedPercentage: 10,
        order: 1
      },
      {
        id: 'phase-02-sub-02',
        name: 'Cortes e Aterros',
        description: 'Movimentação de terra para nivelamento',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'topography',
              operator: 'notEquals',
              value: 'plano'
            }
          ]
        },
        estimatedPercentage: 25,
        order: 2
      },
      {
        id: 'phase-02-sub-03',
        name: 'Contenções e Muros de Arrimo',
        description: 'Estabilização de taludes',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'topography',
              operator: 'includes',
              value: ['aclive', 'declive', 'irregular']
            }
          ]
        },
        estimatedPercentage: 30,
        order: 3
      },
      {
        id: 'phase-02-sub-04',
        name: 'Escavação para Subsolo',
        description: 'Escavação e contenção para pavimento inferior',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'subsoilArea',
              operator: 'greaterThan',
              value: 0
            }
          ]
        },
        estimatedPercentage: 35,
        order: 4
      },
      {
        id: 'phase-02-sub-05',
        name: 'Fundações Rasas',
        description: 'Sapatas e vigas baldrame',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'topography',
              operator: 'equals',
              value: 'plano'
            },
            {
              field: 'subsoilArea',
              operator: 'equals',
              value: 0,
              combineWith: 'AND'
            }
          ]
        },
        estimatedPercentage: 35,
        order: 5
      },
      {
        id: 'phase-02-sub-06',
        name: 'Fundações Profundas',
        description: 'Estacas e blocos de coroamento',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'topography',
              operator: 'notEquals',
              value: 'plano'
            }
          ]
        },
        estimatedPercentage: 40,
        order: 5
      }
    ]
  },
  {
    id: 'phase-03',
    name: 'Estrutura',
    description: 'Execução da estrutura principal da edificação',
    basePercentage: 22,
    icon: 'Building',
    color: '#6B7280',
    subPhases: [
      {
        id: 'phase-03-sub-01',
        name: 'Estrutura do Subsolo',
        description: 'Pilares, vigas e laje do pavimento inferior',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'subsoilArea',
              operator: 'greaterThan',
              value: 0
            }
          ]
        },
        estimatedPercentage: 30,
        order: 1
      },
      {
        id: 'phase-03-sub-02',
        name: 'Estrutura Térreo',
        description: 'Pilares, vigas e laje do pavimento térreo',
        condition: { type: 'always' },
        estimatedPercentage: 35,
        order: 2
      },
      {
        id: 'phase-03-sub-03',
        name: 'Estrutura Pavimento Superior',
        description: 'Pilares, vigas e laje do andar superior',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'upperFloorArea',
              operator: 'greaterThan',
              value: 0
            }
          ]
        },
        estimatedPercentage: 35,
        order: 3
      },
      {
        id: 'phase-03-sub-04',
        name: 'Montagem Steel Frame',
        description: 'Estrutura metálica leve e painéis',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'steel-frame'
            }
          ]
        },
        estimatedPercentage: 100,
        order: 1
      },
      {
        id: 'phase-03-sub-05',
        name: 'Montagem Wood Frame',
        description: 'Estrutura em madeira engenheirada',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'wood-frame'
            }
          ]
        },
        estimatedPercentage: 100,
        order: 1
      }
    ]
  },
  {
    id: 'phase-04',
    name: 'Alvenaria e Cobertura',
    description: 'Vedações externas e internas, estrutura de telhado',
    basePercentage: 18,
    icon: 'Home',
    color: '#DC2626',
    subPhases: [
      {
        id: 'phase-04-sub-01',
        name: 'Alvenaria de Vedação',
        description: 'Paredes em blocos cerâmicos ou concreto',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'tradicional'
            }
          ]
        },
        estimatedPercentage: 50,
        order: 1
      },
      {
        id: 'phase-04-sub-02',
        name: 'Fechamento em Drywall',
        description: 'Paredes em gesso acartonado',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'includes',
              value: ['steel-frame', 'wood-frame']
            }
          ]
        },
        estimatedPercentage: 40,
        order: 1
      },
      {
        id: 'phase-04-sub-03',
        name: 'Estrutura do Telhado',
        description: 'Madeiramento e contraventamentos',
        condition: { type: 'always' },
        estimatedPercentage: 25,
        order: 2
      },
      {
        id: 'phase-04-sub-04',
        name: 'Cobertura em Telhas',
        description: 'Telhas cerâmicas, metálicas ou fibrocimento',
        condition: { type: 'always' },
        estimatedPercentage: 20,
        order: 3
      },
      {
        id: 'phase-04-sub-05',
        name: 'Calhas e Rufos',
        description: 'Sistema de captação pluvial',
        condition: { type: 'always' },
        estimatedPercentage: 5,
        order: 4
      }
    ]
  },
  {
    id: 'phase-05',
    name: 'Instalações',
    description: 'Sistemas hidráulicos, elétricos e complementares',
    basePercentage: 13,
    icon: 'Zap',
    color: '#F59E0B',
    subPhases: [
      {
        id: 'phase-05-sub-01',
        name: 'Instalações Elétricas',
        description: 'Eletrodutos, fiação, quadros e pontos',
        condition: { type: 'always' },
        estimatedPercentage: 40,
        order: 1
      },
      {
        id: 'phase-05-sub-02',
        name: 'Instalações Hidráulicas',
        description: 'Tubulações de água fria e quente',
        condition: { type: 'always' },
        estimatedPercentage: 30,
        order: 2
      },
      {
        id: 'phase-05-sub-03',
        name: 'Instalações de Esgoto',
        description: 'Tubulações e caixas de inspeção',
        condition: { type: 'always' },
        estimatedPercentage: 20,
        order: 3
      },
      {
        id: 'phase-05-sub-04',
        name: 'Instalações Pluviais',
        description: 'Captação e direcionamento de águas da chuva',
        condition: { type: 'always' },
        estimatedPercentage: 10,
        order: 4
      }
    ]
  },
  {
    id: 'phase-06',
    name: 'Revestimentos',
    description: 'Aplicação de acabamentos em pisos, paredes e forros',
    basePercentage: 16,
    icon: 'Layers',
    color: '#10B981',
    subPhases: [
      {
        id: 'phase-06-sub-01',
        name: 'Contrapiso e Regularização',
        description: 'Nivelamento de pisos',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 1
      },
      {
        id: 'phase-06-sub-02',
        name: 'Revestimento de Pisos',
        description: 'Cerâmica, porcelanato ou outros materiais',
        condition: { type: 'always' },
        estimatedPercentage: 30,
        order: 2
      },
      {
        id: 'phase-06-sub-03',
        name: 'Revestimento de Paredes',
        description: 'Azulejos em áreas molhadas',
        condition: { type: 'always' },
        estimatedPercentage: 20,
        order: 3
      },
      {
        id: 'phase-06-sub-04',
        name: 'Reboco e Emboço',
        description: 'Preparação de paredes para pintura',
        condition: {
          type: 'conditional',
          rules: [
            {
              field: 'constructionMethod',
              operator: 'equals',
              value: 'tradicional'
            }
          ]
        },
        estimatedPercentage: 20,
        order: 4
      },
      {
        id: 'phase-06-sub-05',
        name: 'Forro de Gesso',
        description: 'Instalação de forros rebaixados',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 5
      }
    ]
  },
  {
    id: 'phase-07',
    name: 'Acabamentos Finais',
    description: 'Pintura, louças, metais e detalhes finais',
    basePercentage: 10,
    icon: 'Sparkles',
    color: '#8B5CF6',
    subPhases: [
      {
        id: 'phase-07-sub-01',
        name: 'Pintura Interna',
        description: 'Pintura de paredes e forros',
        condition: { type: 'always' },
        estimatedPercentage: 25,
        order: 1
      },
      {
        id: 'phase-07-sub-02',
        name: 'Pintura Externa',
        description: 'Pintura de fachadas',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 2
      },
      {
        id: 'phase-07-sub-03',
        name: 'Louças Sanitárias',
        description: 'Instalação de vasos, lavatórios e cubas',
        condition: { type: 'always' },
        estimatedPercentage: 20,
        order: 3
      },
      {
        id: 'phase-07-sub-04',
        name: 'Metais e Acessórios',
        description: 'Torneiras, registros e acessórios',
        condition: { type: 'always' },
        estimatedPercentage: 15,
        order: 4
      },
      {
        id: 'phase-07-sub-05',
        name: 'Esquadrias',
        description: 'Portas, janelas e ferragens',
        condition: { type: 'always' },
        estimatedPercentage: 20,
        order: 5
      },
      {
        id: 'phase-07-sub-06',
        name: 'Vidros',
        description: 'Instalação de vidros temperados e laminados',
        condition: { type: 'always' },
        estimatedPercentage: 5,
        order: 6
      }
    ]
  }
];
```

---

## 3. Lógica Condicional

### 3.1 Engine de Avaliação de Condições

Criar arquivo: `src/utils/phaseEvaluator.ts`

```typescript
import { ConstructionData } from '@/types';
import { ConditionalRule, PhaseCondition } from '@/types/phases';

export class PhaseEvaluator {
  
  /**
   * Avalia se uma condição é verdadeira para os dados fornecidos
   */
  static evaluate(
    condition: PhaseCondition, 
    data: ConstructionData
  ): boolean {
    if (condition.type === 'always') {
      return true;
    }

    if (!condition.rules || condition.rules.length === 0) {
      return false;
    }

    // Avalia cada regra
    const results = condition.rules.map(rule => 
      this.evaluateRule(rule, data)
    );

    // Combina resultados (padrão: AND entre todas)
    return results.every(result => result === true);
  }

  /**
   * Avalia uma regra individual
   */
  private static evaluateRule(
    rule: ConditionalRule, 
    data: ConstructionData
  ): boolean {
    const fieldValue = data[rule.field];

    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      
      case 'notEquals':
        return fieldValue !== rule.value;
      
      case 'greaterThan':
        return Number(fieldValue) > Number(rule.value);
      
      case 'includes':
        if (Array.isArray(rule.value)) {
          return rule.value.includes(fieldValue);
        }
        return false;
      
      default:
        return false;
    }
  }

  /**
   * Filtra subfases aplicáveis aos dados do usuário
   */
  static getApplicableSubPhases(
    phase: Phase,
    data: ConstructionData
  ): SubPhase[] {
    return phase.subPhases
      .filter(subPhase => this.evaluate(subPhase.condition, data))
      .sort((a, b) => a.order - b.order);
  }

  /**
   * Calcula valor financeiro de uma subfase
   */
  static calculateSubPhaseValue(
    subPhase: SubPhase,
    phaseTotal: number
  ): number {
    return (phaseTotal * subPhase.estimatedPercentage) / 100;
  }
}
```

### 3.2 Mapeamento de Inferências Determinísticas

| Condição | Campo(s) | Regra | Exemplo de Uso |
|----------|----------|-------|----------------|
| **Existe subsolo** | `subsoilArea` | `> 0` | Exibir "Estrutura do Subsolo" |
| **Existe pavimento superior** | `upperFloorArea` | `> 0` | Exibir "Estrutura Pavimento Superior" |
| **Terreno não é plano** | `topography` | `!== 'plano'` | Exibir "Cortes e Aterros" |
| **Método tradicional** | `constructionMethod` | `=== 'tradicional'` | Exibir "Alvenaria de Vedação" |
| **Steel/Wood Frame** | `constructionMethod` | `includes(['steel-frame', 'wood-frame'])` | Exibir "Fechamento em Drywall" |
| **Condomínio** | `siteType` | `includes(['condominio-fechado', 'condominio-aberto'])` | Exibir "Aprovação em Condomínio" |
| **Projeto não aprovado** | `maturity` | `=== 'none'` | Aumentar % fase "Projetos" |
| **Não tem terreno** | `landStatus` | `=== 'no'` | Adicionar fase "Aquisição de Terreno" |

---

## 4. Gerenciamento de Estado

### 4.1 Hook Customizado

Criar arquivo: `src/hooks/useExpandablePhases.ts`

```typescript
import { useState, useMemo, useCallback } from 'react';
import { ConstructionData } from '@/types';
import { Phase, SubPhase, ExpandedPhaseState } from '@/types/phases';
import { PHASES_SCHEMA } from '@/data/phasesSchema';
import { PhaseEvaluator } from '@/utils/phaseEvaluator';

interface UseExpandablePhasesResult {
  phases: Phase[];
  expandedPhases: ExpandedPhaseState;
  togglePhase: (phaseId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  getApplicableSubPhases: (phase: Phase) => SubPhase[];
  getSubPhaseValue: (subPhase: SubPhase, phaseValue: number) => number;
}

export function useExpandablePhases(
  data: ConstructionData,
  phasesResults: PhaseBreakdown[]
): UseExpandablePhasesResult {
  
  // Estado de expansão (objeto com phaseId: boolean)
  const [expandedPhases, setExpandedPhases] = useState<ExpandedPhaseState>({});

  // Filtra fases aplicáveis (memoizado)
  const phases = useMemo(() => {
    return PHASES_SCHEMA.filter(phase => {
      // Aqui você pode adicionar lógica para ocultar fases inteiras
      // Ex: se landStatus === 'owned', não mostrar fase de aquisição
      return true;
    });
  }, [data]);

  // Toggle expansão de uma fase
  const togglePhase = useCallback((phaseId: string) => {
    setExpandedPhases(prev => ({
      ...prev,
      [phaseId]: !prev[phaseId]
    }));
  }, []);

  // Expandir todas
  const expandAll = useCallback(() => {
    const allExpanded = phases.reduce((acc, phase) => {
      acc[phase.id] = true;
      return acc;
    }, {} as ExpandedPhaseState);
    setExpandedPhases(allExpanded);
  }, [phases]);

  // Colapsar todas
  const collapseAll = useCallback(() => {
    setExpandedPhases({});
  }, []);

  // Obter subfases aplicáveis para uma fase
  const getApplicableSubPhases = useCallback((phase: Phase) => {
    return PhaseEvaluator.getApplicableSubPhases(phase, data);
  }, [data]);

  // Calcular valor de subfase
  const getSubPhaseValue = useCallback((
    subPhase: SubPhase, 
    phaseValue: number
  ) => {
    return PhaseEvaluator.calculateSubPhaseValue(subPhase, phaseValue);
  }, []);

  return {
    phases,
    expandedPhases,
    togglePhase,
    expandAll,
    collapseAll,
    getApplicableSubPhases,
    getSubPhaseValue
  };
}
```

### 4.2 Fluxo de Dados

```
ConstructionData (input do usuário)
        ↓
PhaseEvaluator.evaluate() → Filtra subfases aplicáveis
        ↓
useExpandablePhases() → Gerencia estado de expansão
        ↓
PhaseCard (UI) → Renderiza fase e subfases
```

---

## 5. Interface do Usuário

### 5.1 Componente de Fase Expansível

**Localização**: `src/components/Results/PhaseCard.tsx`

**Estrutura visual proposta**:

```
┌─────────────────────────────────────────────────┐
│ [ícone] Fundações e Estrutura          R$ 45.000 │
│         22% do total               [v] Expandir  │
├─────────────────────────────────────────────────┤
│ [CONTEÚDO EXPANSÍVEL - se expandido]            │
│                                                  │
│  ├─ Escavação para Subsolo        R$ 15.750     │
│  │  35% desta fase                              │
│  │                                               │
│  ├─ Estrutura do Subsolo          R$ 13.500     │
│  │  30% desta fase                              │
│  │                                               │
│  ├─ Estrutura Térreo              R$ 15.750     │
│  │  35% desta fase                              │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 5.2 Estados Visuais

| Estado | Comportamento |
|--------|---------------|
| **Colapsado** | Mostra apenas cabeçalho da fase + ícone de expandir |
| **Expandido** | Mostra cabeçalho + lista de subfases aplicáveis |
| **Vazio** | Se nenhuma subfase aplicável, não exibe botão de expandir |
| **Carregando** | Skeleton loader durante cálculos |
| **Hover** | Destaque visual do card completo |

### 5.3 Interações

- **Click no card inteiro**: Expande/colapsa
- **Click no botão específico**: Expande/colapsa (redundância intencional para acessibilidade)
- **Animação**: Transição suave de altura (300ms ease-in-out)
- **Scroll**: Se expandir muitas fases, scroll suave até a fase clicada

### 5.4 Acessibilidade

```typescript
// Atributos ARIA recomendados
<button
  role="button"
  aria-expanded={isExpanded}
  aria-controls={`phase-content-${phase.id}`}
  aria-label={`Expandir detalhes da fase ${phase.name}`}
>
  {/* Conteúdo do botão */}
</button>

<div
  id={`phase-content-${phase.id}`}
  role="region"
  aria-labelledby={`phase-header-${phase.id}`}
  hidden={!isExpanded}
>
  {/* Subfases */}
</div>
```

---

## 6. Performance e Otimização

### 6.1 Estratégias de Otimização

#### Memoização de Cálculos

```typescript
// Evitar recálculo de subfases a cada render
const applicableSubPhases = useMemo(
  () => PhaseEvaluator.getApplicableSubPhases(phase, data),
  [phase, data]
);
```

#### Virtualização (se necessário)

- **Quando aplicar**: Se houver >20 fases simultaneamente expandidas
- **Biblioteca sugerida**: `react-window` ou `@tanstack/react-virtual`
- **Implementação**: Virtualizar lista de fases, não subfases (subfases são poucas)

#### Lazy Loading de Valores

```typescript
// Calcular valores de subfases apenas quando expandido
const subPhaseValues = useMemo(() => {
  if (!isExpanded) return null;
  return applicableSubPhases.map(sub => 
    PhaseEvaluator.calculateSubPhaseValue(sub, phaseValue)
  );
}, [isExpanded, applicableSubPhases, phaseValue]);
```

### 6.2 Estimativa de Impacto

| Métrica | Antes | Depois | Impacto |
|---------|-------|--------|---------|
| **Componentes renderizados** | 7 fases | 7 fases + ~35 subfases (média) | +500% componentes |
| **Tamanho do bundle** | ~50KB | ~65KB (+schema) | +30% |
| **Tempo de render inicial** | ~50ms | ~80ms | +60% (aceitável) |
| **Memória (heap)** | ~2MB | ~3MB | +50% (aceitável) |
| **Interação (toggle)** | N/A | <16ms (60fps) | Imperceptível |

**Conclusão**: Impacto aceitável para aplicação de uso não intensivo.

---

## 7. Manutenibilidade e Escalabilidade

### 7.1 Pontos de Extensão

#### Adicionar Nova Subfase

1. Editar `src/data/phasesSchema.ts`
2. Adicionar objeto `SubPhase` no array `subPhases` da fase pai
3. Definir `condition` com regras claras
4. Testar com diferentes combinações de `ConstructionData`

#### Adicionar Nova Condição

1. Estender tipo `ConditionalRule.operator` em `src/types/phases.ts`
2. Implementar lógica em `PhaseEvaluator.evaluateRule()`
3. Documentar no schema e em comentários

#### Alterar Percentuais

- **Centralizado**: Todos os percentuais estão em `phasesSchema.ts`
- **Validação**: Criar script de CI que valida soma de `estimatedPercentage` ≈ 100%

### 7.2 Testabilidade

#### Testes Unitários Recomendados

```typescript
// src/utils/__tests__/phaseEvaluator.test.ts

describe('PhaseEvaluator', () => {
  it('deve retornar true para condição always', () => {
    const condition = { type: 'always' };
    const result = PhaseEvaluator.evaluate(condition, mockData);
    expect(result).toBe(true);
  });

  it('deve filtrar subfases por constructionMethod', () => {
    const data = { constructionMethod: 'steel-frame' };
    const phase = PHASES_SCHEMA[2]; // Estrutura
    const result = PhaseEvaluator.getApplicableSubPhases(phase, data);
    expect(result).toContainEqual(
      expect.objectContaining({ name: 'Montagem Steel Frame' })
    );
  });

  it('deve inferir subsolo quando subsoilArea > 0', () => {
    const data = { subsoilArea: 50 };
    const condition = {
      type: 'conditional',
      rules: [{ field: 'subsoilArea', operator: 'greaterThan', value: 0 }]
    };
    expect(PhaseEvaluator.evaluate(condition, data)).toBe(true);
  });
});
```

#### Testes de Integração

```typescript
// src/components/__tests__/PhaseCard.test.tsx

it('deve expandir e exibir subfases ao clicar', async () => {
  const { getByText, queryByText } = render(
    <PhaseCard phase={mockPhase} data={mockData} />
  );
  
  expect(queryByText('Estrutura do Subsolo')).not.toBeInTheDocument();
  
  fireEvent.click(getByText('Fundações e Estrutura'));
  
  await waitFor(() => {
    expect(getByText('Estrutura do Subsolo')).toBeInTheDocument();
  });
});
```

### 7.3 Versionamento do Schema

```typescript
// src/data/phasesSchema.ts

export const PHASES_SCHEMA_VERSION = '1.0.0';

// Exportar versão junto com schema
export const PHASES_DATA = {
  version: PHASES_SCHEMA_VERSION,
  phases: PHASES_SCHEMA
};

// Validação em runtime (opcional)
function validateSchemaVersion(data: any) {
  if (data.version !== PHASES_SCHEMA_VERSION) {
    console.warn('Schema version mismatch');
  }
}
```

---

## 8. Considerações de Negócio

### 8.1 Decisões de Produto

#### Mostrar Sempre vs. Ocultar Inaplicáveis

**Recomendação**: **Ocultar subfases inaplicáveis**

**Justificativa**:
- ✅ Interface mais limpa e relevante
- ✅ Reduz carga cognitiva do usuário
- ✅ Evita confusão ("por que isso está aqui se não se aplica a mim?")
- ❌ Usuário não vê "todo o escopo possível" (mitigado com documentação)

#### Percentuais Fixos vs. Dinâmicos

**Implementado**: **Percentuais fixos** no schema, recalculados dinamicamente

**Exemplo**:
- Se subfase A vale 30% e subfase B vale 70%, mas B não se aplica
- Recalcular: A passa a valer 100% daquela fase

```typescript
function recalculatePercentages(subPhases: SubPhase[]): SubPhase[] {
  const total = subPhases.reduce((sum, sp) => sum + sp.estimatedPercentage, 0);
  return subPhases.map(sp => ({
    ...sp,
    adjustedPercentage: (sp.estimatedPercentage / total) * 100
  }));
}
```

### 8.2 Casos Extremos

| Cenário | Comportamento |
|---------|---------------|
| **Nenhuma subfase aplicável** | Não exibir botão de expandir, mostrar apenas fase pai |
| **Todas subfases aplicáveis** | Comportamento padrão |
| **Dados incompletos** | Avaliar condições como `false`, ocultar subfase |
| **Schema inválido** | Validação em dev mode, fallback para fases sem subfases |

---

## 9. Cronograma de Implementação (Sugestão)

### Fase 1: Fundação (2-3 dias)
- [ ] Criar tipos TypeScript (`src/types/phases.ts`)
- [ ] Implementar `PhaseEvaluator` com testes unitários
- [ ] Criar `phasesSchema.ts` com 2-3 fases mockadas

### Fase 2: Lógica de Negócio (2-3 dias)
- [ ] Completar `phasesSchema.ts` com todas as 7 fases
- [ ] Implementar hook `useExpandablePhases`
- [ ] Testar todas as combinações de condições

### Fase 3: Interface (3-4 dias)
- [ ] Criar componente `PhaseCard`
- [ ] Implementar animações e transições
- [ ] Ajustar design system (cores, tipografia, espaçamentos)
- [ ] Testes de acessibilidade

### Fase 4: Integração (1-2 dias)
- [ ] Conectar com `Results.tsx` existente
- [ ] Ajustar cálculos de valores financeiros
- [ ] QA manual com diferentes perfis de usuário

### Fase 5: Refinamento (1 dia)
- [ ] Ajustes de performance
- [ ] Documentação de código
- [ ] Testes E2E

**Total estimado**: 9-13 dias úteis

---

## 10. Checklist de Implementação

### Antes de Começar
- [ ] Validar estrutura de `ConstructionData` atual
- [ ] Confirmar que `subsoilArea` e `upperFloorArea` existem
- [ ] Verificar se `PhaseBreakdown` atual tem todos os campos necessários

### Durante Desenvolvimento
- [ ] Cada subfase tem `id` único
- [ ] Todas as condições são testáveis
- [ ] Percentuais de cada fase somam ~100%
- [ ] Nenhuma subfase depende de dados inexistentes
- [ ] Animações funcionam em navegadores-alvo

### Antes de Deploy
- [ ] Testes unitários com >80% de coverage
- [ ] Testes E2E cobrindo os 3 fluxos principais
- [ ] Performance auditada (Lighthouse score >90)
- [ ] Acessibilidade validada (WCAG 2.1 AA)
- [ ] Schema versionado e documentado

---

## 11. Referências Técnicas

### Bibliotecas Sugeridas

| Biblioteca | Uso | Justificativa |
|------------|-----|---------------|
| **Framer Motion** | Animações de expansão | API declarativa, performance nativa |
| **clsx** | Classes CSS condicionais | Leve, type-safe |
| **Lucide React** | Ícones de fases | Consistente com design system |

### Padrões de Código

```typescript
// Nomenclatura recomendada
interface Phase { ... }          // Singular, PascalCase
const PHASES_SCHEMA              // Constante, UPPER_SNAKE_CASE
function evaluateRule()          // Função, camelCase
<PhaseCard />                    // Componente, PascalCase
```

### Estrutura de Arquivos

```
src/
├── types/
│   └── phases.ts                 # Tipos de fases e subfases
├── data/
│   └── phasesSchema.ts           # Schema completo
├── utils/
│   ├── phaseEvaluator.ts         # Engine de condições
│   └── __tests__/
│       └── phaseEvaluator.test.ts
├── hooks/
│   └── useExpandablePhases.ts    # Hook de estado
└── components/
    └── Results/
        ├── PhaseCard.tsx         # Card expansível
        ├── SubPhaseItem.tsx      # Item de subfase
        └── __tests__/
            └── PhaseCard.test.tsx
```

---

## 12. Conclusão

### Principais Benefícios

1. **Transparência**: Usuário vê detalhamento completo e relevante
2. **Confiança**: Informações condizentes com o que foi informado
3. **Educação**: Usuário aprende sobre etapas da construção
4. **Flexibilidade**: Fácil adicionar novas subfases sem refatoração

### Riscos Mitigados

- ✅ Não requer novos inputs do usuário
- ✅ Lógica determinística (sem "chutes")
- ✅ Escalável para novos métodos construtivos
- ✅ Testável e manutenível

### Próximos Passos

1. Validar proposta com stakeholders
2. Criar protótipo visual no Figma (opcional)
3. Iniciar implementação pela Fase 1
4. Iterar com feedback de usuários beta

---

**Documento gerado por**: GitHub Copilot (Claude Sonnet 4.5)  
**Última atualização**: 13/01/2026
