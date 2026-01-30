/**
 * ══════════════════════════════════════════════════════════════════════════════
 * TABELA EXPANSÍVEL DE FASES MACRO
 * ══════════════════════════════════════════════════════════════════════════════
 * 
 * Substitui a tabela de 19 fases por 6 fases macro com subfases expansíveis.
 * Mantém a estrutura visual e colunas originais:
 * - Fase da Obra | Tipo | Período | Timeline | Admin | Valor
 * 
 * Implementa accordion behavior nas linhas da tabela.
 */

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { ProjectData } from '../../types';
import { DetailedPhase } from '../../utils/calculationEngine';
import { formatCurrency } from '../../utils/formatting';
import { MACRO_PHASES_SCHEMA } from '../../data/phasesSchema';
import { PhaseEvaluator } from '../../utils/phaseEvaluator';
import { Phase, ProcessedSubPhase } from '../../types/phases';

// ══════════════════════════════════════════════════════════════════════════════
// UTILITÁRIOS E MAPPERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Mapper para humanizar valores técnicos de topografia
 */
const topographyLabels: Record<string, string> = {
  'plano': 'Plano',
  'aclive': 'Aclive', 
  'declive': 'Declive',
  'irregular': 'Irregular',
  'slope_light': 'Aclive Suave',
  'slope_medium': 'Aclive Médio',
  'slope_heavy': 'Aclive Acentuado',
  'flat': 'Plano'
};

/**
 * Mapper para humanizar métodos construtivos
 */
const constructionMethodLabels: Record<string, string> = {
  'masonry': 'Alvenaria',
  'steelFrame': 'Steel Frame',
  'woodFrame': 'Wood Frame', 
  'container': 'Container',
  'eps': 'EPS (Isopor)'
};

/**
 * Converte string técnica para label humanizado
 */
function humanizeLabel(value: string, type: 'topography' | 'method' | 'general' = 'general'): string {
  if (!value) return 'Não informado';
  
  switch (type) {
    case 'topography':
      return topographyLabels[value.toLowerCase()] || toTitleCase(value);
    case 'method':
      return constructionMethodLabels[value.toLowerCase()] || toTitleCase(value);
    default:
      return toTitleCase(value);
  }
}

/**
 * Converte string para Title Case
 */
function toTitleCase(str: string): string {
  return str
    .replace(/[_-]/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Gera label e tooltip para subfases condicionais
 */
function getConditionalInfo(projectData: ProjectData): { label: string; tooltip: string } {
  // Analisar condições por prioridade
  const hasSubsoil = projectData.areas.subfloor && projectData.areas.subfloor > 0;
  const hasTopography = projectData.topography && projectData.topography !== 'flat';
  const hasSpecialMethod = projectData.constructionMethod && ['steelFrame', 'woodFrame', 'container'].includes(projectData.constructionMethod);
  
  // Prioridade: subsolo > topografia > método > projeto
  if (hasSubsoil) {
    return {
      label: 'Depende do subsolo',
      tooltip: 'Aparece quando existe área de subsolo (subsolo > 0m²)'
    };
  }
  
  if (hasTopography) {
    return {
      label: 'Depende do terreno', 
      tooltip: 'Aparece quando a topografia não é plana'
    };
  }
  
  if (hasSpecialMethod) {
    return {
      label: 'Depende do projeto',
      tooltip: `Aparece com método construtivo ${humanizeLabel(projectData.constructionMethod, 'method')}`
    };
  }
  
  // Fallback para outras condições
  return {
    label: 'Depende do projeto',
    tooltip: 'Aparece conforme características específicas do projeto'
  };
}

/**
 * Verifica se percentuais são muito similares (diferença <= 2%)
 */
function hasEqualPercentages(percentages: number[]): boolean {
  if (percentages.length <= 1) return false;
  
  const min = Math.min(...percentages);
  const max = Math.max(...percentages);
  
  return (max - min) <= 2;
}

/**
 * Gera frase explicativa detalhada para a fase (do schema ou dinâmica)
 */
function getDetailedPhaseExplanation(phase: Phase, projectData: ProjectData): string | null {
  // Se a fase tem uma explicação detalhada definida, usar ela
  if (phase.detailedExplanation) {
    return phase.detailedExplanation;
  }
  
  // Fallback para frases dinâmicas baseadas no projeto
  const hasSubsoil = projectData.areas.subfloor && projectData.areas.subfloor > 0;
  const hasTopography = projectData.topography && projectData.topography !== 'flat';
  const hasSpecialMethod = projectData.constructionMethod && ['steelFrame', 'woodFrame', 'container'].includes(projectData.constructionMethod);
  
  if (hasSubsoil) {
    return 'Subsolo aumenta escavação, contenções e impermeabilização.';
  }
  
  if (hasTopography) {
    return 'Topografia exige mais movimentação de terra, contenções e drenagem.';
  }
  
  if (hasSpecialMethod) {
    return 'Método construtivo altera ritmo e distribuição de custos na estrutura.';
  }
  
  return null;
}

// ══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ══════════════════════════════════════════════════════════════════════════════

interface ExpandablePhasesTableProps {
  projectData: ProjectData;
  detailedSchedule: DetailedPhase[];
  hardCost: number;
  totalCost: number;
  administrationFee: number;
  deadlineMonths: number;
}

interface MacroPhaseData {
  phase: Phase;
  type: 'pre' | 'construction' | 'post';
  startMonth: number;
  endMonth: number;
  baseValue: number;
  adminShare: number;
  inflatedValue: number;
  applicableSubPhases: ProcessedSubPhase[];
  originalPhasesCount: number;
}

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ══════════════════════════════════════════════════════════════════════════════

export const ExpandablePhasesTable: React.FC<ExpandablePhasesTableProps> = ({
  projectData,
  detailedSchedule,
  hardCost,
  totalCost,
  administrationFee,
  deadlineMonths
}) => {
  // Estado de expansão para cada fase macro
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set());
  
  // Estado para controlar visibilidade da coluna Admin
  const [showAdminColumn, setShowAdminColumn] = useState<boolean>(false);

  // Processar fases macro com valores calculados
  const macroPhaseData = useMemo(() => {
    const context = PhaseEvaluator.extractContext(projectData);
    const nonAdminPhases = detailedSchedule.filter(p => p.type !== 'admin');
    const totalNonAdminValue = nonAdminPhases.reduce((sum, p) => sum + p.inflatedValue, 0);
    
    // Calcular posição temporal baseada em durationPercentage acumulativo
    let accumulatedDuration = 0;
    
    return MACRO_PHASES_SCHEMA.map((macroPhase): MacroPhaseData => {
      // Encontrar fases originais que pertencem a esta fase macro
      const originalIds = macroPhase.originalPhaseId?.split(',') || [];
      const matchingSchedulePhases = nonAdminPhases.filter(sp => 
        originalIds.some(id => sp.id.toLowerCase().includes(id.toLowerCase()) || 
                               sp.name.toLowerCase().includes(id.toLowerCase()))
      );
      
      // Se não encontrou pelo ID, usar peso percentual como fallback
      let baseValue = 0;
      
      if (matchingSchedulePhases.length > 0) {
        baseValue = matchingSchedulePhases.reduce((sum, p) => sum + p.inflatedValue, 0);
      } else {
        // Fallback: usar percentual base da fase
        baseValue = (macroPhase.basePercentage / 100) * hardCost;
      }
      
      // ═══════════════════════════════════════════════════════════════════════
      // CÁLCULO DE PERÍODO USANDO durationPercentage (TIMELINE VEROSSÍMIL)
      // ═══════════════════════════════════════════════════════════════════════
      const phaseDurationPct = macroPhase.durationPercentage || (macroPhase.basePercentage * 0.8);
      const phaseDurationMonths = Math.max(1, Math.round((phaseDurationPct / 100) * deadlineMonths));
      
      let startMonth: number;
      let endMonth: number;
      
      if (macroPhase.phaseType === 'pre') {
        // Pré-obra: meses 0 a 1 (antes do início físico)
        startMonth = 0;
        endMonth = Math.max(1, Math.round((phaseDurationPct / 100) * deadlineMonths));
      } else if (macroPhase.phaseType === 'post') {
        // Pós-obra: últimos meses do projeto (CORRIGIDO - Fase 6 agora aparece)
        startMonth = Math.max(1, deadlineMonths - phaseDurationMonths + 1);
        endMonth = deadlineMonths;
      } else {
        // Fases de construção: distribuídas proporcionalmente
        startMonth = Math.max(1, Math.round((accumulatedDuration / 100) * deadlineMonths) + 1);
        endMonth = Math.min(deadlineMonths, startMonth + phaseDurationMonths - 1);
      }
      
      // Acumular duração para próxima fase
      accumulatedDuration += phaseDurationPct;
      
      // Calcular admin proporcional
      const adminShare = totalNonAdminValue > 0 
        ? (baseValue / totalNonAdminValue) * administrationFee 
        : 0;
      
      // Processar subfases aplicáveis usando PhaseEvaluator estático
      const processedPhase = PhaseEvaluator.processPhase(macroPhase, context, baseValue);
      
      return {
        phase: macroPhase,
        type: macroPhase.phaseType as 'pre' | 'construction' | 'post',
        startMonth,
        endMonth,
        baseValue,
        adminShare,
        inflatedValue: baseValue + adminShare,
        applicableSubPhases: processedPhase.applicableSubPhases,
        originalPhasesCount: originalIds.length
      };
    });
  }, [projectData, detailedSchedule, hardCost, administrationFee, deadlineMonths]);

  // Toggle expansão
  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => {
      const next = new Set(prev);
      if (next.has(phaseId)) {
        next.delete(phaseId);
      } else {
        next.add(phaseId);
      }
      return next;
    });
  };

  // Expandir/colapsar todas
  const expandAll = () => {
    setExpandedPhases(new Set(MACRO_PHASES_SCHEMA.map(p => p.id)));
  };

  const collapseAll = () => {
    setExpandedPhases(new Set());
  };

  const allExpanded = expandedPhases.size === MACRO_PHASES_SCHEMA.length;

  return (
    <div>
      {/* Controles do header */}
      <div className="flex justify-between items-center mb-2">
        {/* Toggle para coluna Admin */}
        <button
          onClick={() => setShowAdminColumn(!showAdminColumn)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition-colors"
        >
          <span className={`w-3 h-3 rounded border-2 flex items-center justify-center transition-colors ${
            showAdminColumn ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'
          }`}>
            {showAdminColumn && <span className="text-white text-[8px] font-bold">✓</span>}
          </span>
          Mostrar custos administrativos
        </button>
        
        {/* Controle de expansão */}
        <button
          onClick={allExpanded ? collapseAll : expandAll}
          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
        >
          {allExpanded ? 'Colapsar Todas' : 'Expandir Todas'}
        </button>
      </div>

      <div className="lg:-mx-4 xl:-mx-6">
        <table className="w-full text-left text-sm text-slate-600 table-fixed min-w-[800px]">
          <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px] tracking-widest">
            <tr>
              <th className={`px-4 py-4 ${showAdminColumn ? 'w-[30%] lg:w-[40%] xl:w-[45%]' : 'w-[35%] lg:w-[45%] xl:w-[50%]'}`}>Fase da Obra</th>
              <th className={`px-3 py-4 ${showAdminColumn ? 'w-[12%] lg:w-[10%] xl:w-[10%]' : 'w-[14%] lg:w-[12%] xl:w-[12%]'}`}>Tipo</th>
              <th className={`px-3 py-4 ${showAdminColumn ? 'w-[12%] lg:w-[10%] xl:w-[10%]' : 'w-[14%] lg:w-[12%] xl:w-[12%]'}`}>Período</th>
              <th className={`px-3 py-4 ${showAdminColumn ? 'w-[18%] lg:w-[15%] xl:w-[12%]' : 'w-[20%] lg:w-[16%] xl:w-[14%]'}`}>Timeline</th>
              {showAdminColumn && (
                <th className="px-3 py-4 text-right w-[12%] lg:w-[10%] xl:w-[8%]">Admin.</th>
              )}
              <th className={`px-4 py-4 text-right ${showAdminColumn ? 'w-[16%] lg:w-[15%] xl:w-[15%]' : 'w-[17%] lg:w-[15%] xl:w-[12%]'}`}>Valor Estimado</th>
            </tr>
          </thead>
        <tbody className="divide-y divide-slate-100">
          {macroPhaseData.map((data, index) => (
            <MacroPhaseRow
              key={data.phase.id}
              data={data}
              index={index}
              isExpanded={expandedPhases.has(data.phase.id)}
              onToggle={() => togglePhase(data.phase.id)}
              totalMonths={deadlineMonths}
              projectData={projectData}
              showAdminColumn={showAdminColumn}
            />
          ))}
        </tbody>
        <tfoot className="bg-slate-50 font-black text-slate-900 border-t-2 border-slate-200">
          <tr>
            <td colSpan={showAdminColumn ? 4 : 4} className="px-4 py-4 text-right uppercase tracking-wider text-xs">
              Total de Investimento:
            </td>
            {showAdminColumn && (
              <td className="px-3 py-4 text-right text-sm text-indigo-600 font-bold">
                {formatCurrency(administrationFee)}
              </td>
            )}
            <td className="px-4 py-4 text-right text-lg text-indigo-700">
              {formatCurrency(totalCost)}
            </td>
          </tr>
        </tfoot>
      </table>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LINHA DA FASE MACRO (EXPANSÍVEL)
// ══════════════════════════════════════════════════════════════════════════════

interface MacroPhaseRowProps {
  data: MacroPhaseData;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  totalMonths: number;
  projectData: ProjectData;
  showAdminColumn: boolean;
}

const MacroPhaseRow: React.FC<MacroPhaseRowProps> = ({
  data,
  index,
  isExpanded,
  onToggle,
  totalMonths,
  projectData,
  showAdminColumn
}) => {
  const { phase, type, startMonth, endMonth, adminShare, inflatedValue, applicableSubPhases } = data;
  const hasSubPhases = applicableSubPhases.length > 0;
  const hasCriticalItems = applicableSubPhases.some(sp => sp.isCritical);
  
  // Obter frase explicativa detalhada da fase
  const detailedExplanation = getDetailedPhaseExplanation(phase, projectData);

  return (
    <>
      {/* Linha principal da fase macro */}
      <tr 
        className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isExpanded ? 'bg-indigo-50/50' : ''}`}
        onClick={onToggle}
        role="button"
        aria-expanded={isExpanded}
        aria-controls={`subphases-${phase.id}`}
      >
        <td className="px-4 py-3 font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
          <div className="flex items-start gap-2">
            {/* Indicador de expansão */}
            {hasSubPhases ? (
              <span className="text-slate-400 group-hover:text-indigo-500 transition-colors mt-0.5 flex-shrink-0">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            ) : (
              <span className="w-4 flex-shrink-0" />
            )}
            
            {/* Número e nome - alinhados verticalmente */}
            <div className="flex items-baseline gap-1.5 flex-1 min-w-0">
              <span className="text-indigo-500 font-semibold flex-shrink-0">{index + 1}.</span>
              <div className="flex-1 min-w-0">
                <div className="truncate lg:truncate lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis" title={phase.name}>
                  <span className="font-semibold">{phase.name}</span>
                </div>
                {/* Frase explicativa detalhada - só aparece quando expandido */}
                {isExpanded && detailedExplanation && (
                  <div className="text-xs text-slate-500 mt-1 font-normal leading-relaxed max-w-lg">
                    {detailedExplanation}
                  </div>
                )}
              </div>
            </div>
            
            {/* Badge de itens críticos */}
            {hasCriticalItems && (
              <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                <AlertTriangle size={10} />
                Atenção
              </span>
            )}
            
            {/* Contador de subfases */}
            {hasSubPhases && !isExpanded && (
              <span className="text-[10px] text-slate-400 font-normal flex-shrink-0">
                ({applicableSubPhases.length} itens)
              </span>
            )}
          </div>
        </td>
        <td className="px-3 py-3">
          <Badge type={type} />
        </td>
        <td className="px-3 py-3 text-slate-500 font-medium whitespace-nowrap">
          {startMonth === endMonth 
            ? `Mês ${startMonth}` 
            : `Mês ${startMonth}-${endMonth}`}
        </td>
        <td className="px-3 py-3">
          <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <TimelineBar 
              startMonth={startMonth} 
              endMonth={endMonth} 
              type={type} 
              totalMonths={totalMonths} 
            />
          </div>
        </td>
        {showAdminColumn && (
          <td className="px-3 py-3 text-right font-mono text-slate-500 text-xs">
            {adminShare > 0 ? formatCurrency(adminShare) : '—'}
          </td>
        )}
        <td className="px-4 py-3 text-right font-mono font-bold text-slate-700">
          {formatCurrency(inflatedValue)}
        </td>
      </tr>

      {/* Linhas das subfases (colapsáveis) */}
      {isExpanded && applicableSubPhases.map((subPhase, subIndex) => {
        // Verificar se deve mostrar percentual ou peso equivalente
        const allPercentages = applicableSubPhases.map(sp => sp.estimatedPercentage);
        const showPercentages = !hasEqualPercentages(allPercentages);
        
        return (
          <SubPhaseRow
            key={subPhase.id}
            subPhase={subPhase}
            parentValue={data.baseValue}
            isLast={subIndex === applicableSubPhases.length - 1}
            projectData={projectData}
            showPercentage={showPercentages}
            showAdminColumn={showAdminColumn}
          />
        );
      })}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// LINHA DA SUBFASE
// ══════════════════════════════════════════════════════════════════════════════

interface SubPhaseRowProps {
  subPhase: ProcessedSubPhase;
  parentValue: number;
  isLast: boolean;
  projectData: ProjectData;
  showPercentage: boolean;
  showAdminColumn: boolean;
}

const SubPhaseRow: React.FC<SubPhaseRowProps> = ({ 
  subPhase, 
  parentValue, 
  isLast, 
  projectData, 
  showPercentage,
  showAdminColumn
}) => {
  // Calcular valor estimado da subfase baseado no percentual
  const estimatedValue = (subPhase.estimatedPercentage / 100) * parentValue;
  
  // Obter ícone dinamicamente com type assertion segura
  const IconComponent = subPhase.icon 
    ? (LucideIcons as unknown as Record<string, React.FC<{ size?: number; className?: string }>>)[subPhase.icon] 
    : null;

  // Gerar badge condicional humanizado
  const renderConditionalBadge = () => {
    if (subPhase.condition?.type !== 'conditional') return null;
    
    const { label, tooltip } = getConditionalInfo(projectData);
    
    return (
      <span 
        className="inline-flex items-center px-2 py-1 rounded-full text-[8px] bg-amber-100 text-amber-800 ml-2"
        title={tooltip}
      >
        {label}
      </span>
    );
  };

  // Renderizar peso/percentual
  const renderWeight = () => {
    if (showPercentage) {
      return (
        <span className="font-mono text-[10px]">
          {subPhase.estimatedPercentage.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <div className="flex items-center">
          <div className="w-8 h-1.5 bg-slate-200 rounded-full mr-1">
            <div className="h-1.5 bg-indigo-400 rounded-full" style={{ width: '100%' }} />
          </div>
          <span className="text-[8px] text-slate-500">Equiv.</span>
        </div>
      );
    }
  };

  return (
    <tr 
      className={`bg-slate-50/80 text-xs hover:bg-slate-100 transition-colors ${isLast ? '' : 'border-b border-slate-100/50'}`}
    >
      {/* Nome da subfase com badges - ocupa 2 colunas */}
      <td colSpan={2} className="px-4 py-2 pl-12 text-slate-600">
        <div className="flex items-center gap-2">
          {/* Conector visual */}
          <span className="text-slate-300 mr-1">└</span>
          
          {/* Ícone da subfase */}
          {IconComponent && (
            <IconComponent size={12} className="text-slate-400" />
          )}
          
          {/* Nome */}
          <span className="flex-1">{subPhase.name}</span>
          
          {/* Badge crítico */}
          {subPhase.isCritical && (
            <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 text-[8px] font-bold px-1 py-0.5 rounded">
              <AlertTriangle size={8} />
              Crítico
            </span>
          )}
          
          {/* Badge condicional humanizado */}
          {renderConditionalBadge()}
        </div>
      </td>
      
      {/* Peso/Percentual */}
      <td className="px-3 py-2 text-slate-500">
        {renderWeight()}
      </td>
      
      {/* Mini timeline da subfase */}
      <td className="px-3 py-2">
        <div className="relative h-1 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`absolute left-0 top-0 h-full rounded-full ${subPhase.isCritical ? 'bg-amber-400' : 'bg-indigo-300'}`}
            style={{ width: `${Math.min(100, subPhase.estimatedPercentage)}%` }}
          />
        </div>
      </td>
      
      {/* Admin - só exibe quando ativado */}
      {showAdminColumn && (
        <td className="px-3 py-2 text-right text-slate-400 text-[10px]">
          —
        </td>
      )}
      
      {/* Valor estimado da subfase */}
      <td className="px-4 py-2 text-right font-mono text-slate-500">
        {formatCurrency(estimatedValue)}
      </td>
    </tr>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ══════════════════════════════════════════════════════════════════════════════

const TimelineBar: React.FC<{ 
  startMonth: number; 
  endMonth: number; 
  type: 'pre' | 'construction' | 'post';
  totalMonths: number;
}> = ({ startMonth, endMonth, type, totalMonths }) => {
  const totalUnits = totalMonths + 1;
  const left = (startMonth / totalUnits) * 100;
  const width = ((endMonth - startMonth + 1) / totalUnits) * 100;

  const bgColors: Record<string, string> = {
    pre: 'bg-blue-500',
    construction: 'bg-emerald-500',
    post: 'bg-orange-500',
  };

  return (
    <div 
      className={`absolute h-full ${bgColors[type]} rounded-full transition-all duration-300 ease-out shadow-sm`}
      style={{ left: `${Math.max(0, left)}%`, width: `${Math.min(100, width)}%` }}
    />
  );
};

const Badge: React.FC<{ type: 'pre' | 'construction' | 'post' }> = ({ type }) => {
  const styles: Record<string, string> = {
    pre: 'bg-blue-50 text-blue-700 border-blue-200',
    construction: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    post: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  const labels: Record<string, string> = {
    pre: 'Pré-Obra',
    construction: 'Execução',
    post: 'Pós-Obra',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

export default ExpandablePhasesTable;
