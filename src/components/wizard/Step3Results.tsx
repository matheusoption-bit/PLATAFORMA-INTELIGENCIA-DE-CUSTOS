import React, { useMemo } from 'react';
import { useWizard } from '../../context/WizardContext';
import { calculateConstructionCost, generateDetailedSchedule, DetailedPhase, ScheduleOptions } from '../../utils/calculationEngine';
import { formatCurrency } from '../../utils/formatting';
import { Download, RefreshCw, TrendingUp, HardHat, FileText, PiggyBank, Calendar, Info, Briefcase, Receipt, Wrench } from 'lucide-react';
import { DisbursementChart } from './DisbursementChart';
import { ExpandablePhasesTable } from './ExpandablePhasesTable';
import { ScenarioRiskAlert } from './ScenarioRiskAlert';

// --- EXPERIMENTAL TOGGLE: CHANGE TO TRUE TO TEST HYPOTHESIS H1 ---
const DEBUG_DISABLE_RESULTS_ANIMATION = false; 

export const Step3Results: React.FC = () => {
  const { state, resetWizard } = useWizard();
  const { areas, deadlineMonths, maturity } = state.data;

  // Realizar cálculos (Memoized)
  const calculation = useMemo(() => {
    return calculateConstructionCost(state.data);
  }, [state.data]);

  // Gerar cronograma com opções de cenário (multiplicador de prazo)
  const detailedSchedule = useMemo(() => {
    const scheduleOptions: ScheduleOptions = {
      scheduleMultiplier: calculation.scenario.scheduleMultiplier,
      phaseMultipliers: {
        foundations: calculation.scenario.id.includes('slope') ? 1.4 : 1.0,
        structure: calculation.scenario.id.includes('subfloor') ? 1.2 : 1.0,
      }
    };
    return generateDetailedSchedule(calculation.totalCost, deadlineMonths, calculation.hardCost, scheduleOptions);
  }, [calculation.totalCost, calculation.hardCost, calculation.scenario, deadlineMonths]);

  const totalArea = areas.ground + areas.upper + areas.subfloor;
  // Usar o custo total calculado pelo engine, já que ele compõe Hard + Soft
  const totalInvest = calculation.totalCost; 
  const isPreliminary = maturity !== 'project';

  // Conditional Class for H1 Test
  const containerClass = DEBUG_DISABLE_RESULTS_ANIMATION 
    ? "space-y-8" 
    : "space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700";

  return (
    <div className={containerClass}>
      
      {/* Header Resumo */}
      <div className="text-center mb-8 relative">
        <h2 className="text-3xl font-bold text-slate-900">Estimativa Finalizada</h2>
        
        {isPreliminary && (
          <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mt-2 mb-2">
            <Info size={12} />
            ESTIMATIVA PRELIMINAR (ÍNDICES DE MERCADO)
          </div>
        )}
        
        <p className="text-slate-500 mt-2">
          Custo estimado para <span className="font-semibold text-indigo-600">{totalArea}m²</span> em{' '}
          {calculation.adjustedDeadlineMonths !== deadlineMonths ? (
            <>
              <span className="line-through text-slate-400">{deadlineMonths}</span>
              {' → '}
              <span className="font-semibold text-amber-600">{calculation.adjustedDeadlineMonths} meses</span>
              <span className="text-xs text-amber-500 ml-1">(ajustado pelo cenário)</span>
            </>
          ) : (
            <span>{deadlineMonths} meses</span>
          )}.
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Base CUB: {formatCurrency(calculation.cubUsed)}
          {calculation.scenario.costMultiplier > 1 && (
            <span className="ml-2">
              • Multiplicador de cenário: <span className="font-semibold">{calculation.scenario.costMultiplier.toFixed(2)}x</span>
            </span>
          )}
        </p>
      </div>

      {/* KPI Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label="Investimento Total" 
          value={formatCurrency(totalInvest)} 
          subValue="Já corrigido por inflação"
          icon={<PiggyBank className="text-white" />}
          highlight
        />
        <KpiCard 
          label="Custo por m²" 
          value={formatCurrency(totalInvest / (totalArea || 1))} 
          subValue="Média Global Corrigida"
          icon={<TrendingUp className="text-slate-600" />}
        />
        <KpiCard 
          label="Custo de Obra (Hard)" 
          value={formatCurrency(calculation.hardCost)} 
          subValue="Base Nominal"
          icon={<HardHat className="text-slate-600" />}
        />
        <KpiCard 
          label="Taxas e Projetos (Soft)" 
          value={formatCurrency(calculation.softCost + calculation.projectFees + calculation.administrationFee)} 
          subValue="Legalização + Arq/Eng + Admin"
          icon={<FileText className="text-slate-600" />}
        />
      </div>

      {/* Alerta de Risco do Cenário */}
      <ScenarioRiskAlert
        topography={state.data.topography}
        hasSubfloor={state.data.areas.subfloor > 0}
        totalCost={totalInvest}
      />

      {/* Gráfico de Desembolso - Integração Corrigida */}
      <DisbursementChart 
        phases={detailedSchedule} 
        calculation={calculation} 
        deadlineMonths={deadlineMonths} 
      />

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SEÇÃO: DETALHAMENTO DE CUSTOS (LAYOUT EXPANDIDO) */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      
      {/* Primeira linha: Projetos + Composição da Obra */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: Projetos Técnicos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
            <h4 className="font-bold text-blue-900 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600" />
              Estimativa de Custo dos Projetos Técnicos
            </h4>
            <p className="text-[10px] text-blue-600 mt-0.5">Contratação na fase pré-obra • Valores por m² construído</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {calculation.projectDetails.map((project, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2">
                  <span className="text-slate-600 whitespace-nowrap">{project.name}</span>
                  <span className="font-mono font-semibold text-slate-800 whitespace-nowrap">
                    {formatCurrency(project.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase">Total Projetos</span>
              <span className="font-mono font-bold text-lg text-blue-700">
                {formatCurrency(calculation.projectFees)}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Custo Estimado da Obra */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-emerald-50 px-5 py-3 border-b border-emerald-100">
            <h4 className="font-bold text-emerald-900 flex items-center gap-2">
              <Wrench size={16} className="text-emerald-600" />
              Custo Estimado da Obra
            </h4>
            <p className="text-[10px] text-emerald-600 mt-0.5">Distribuição do custo de execução</p>
          </div>
          <div className="p-5">
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-slate-700">Mão de Obra</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">
                  {formatCurrency(calculation.costComposition.laborCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-slate-700">Materiais/Insumos</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">
                  {formatCurrency(calculation.costComposition.materialsCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-slate-700">Aluguel de Equipamentos</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">
                  {formatCurrency(calculation.costComposition.equipmentCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-slate-700">Administração de Obra</span>
                </div>
                <span className="font-mono font-semibold text-slate-800">
                  {formatCurrency(calculation.costComposition.administrationCost)}
                </span>
              </div>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600 uppercase">Total Obra + Admin</span>
              <span className="font-mono font-bold text-lg text-emerald-700">
                {formatCurrency(calculation.hardCost + calculation.administrationFee)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segunda linha: Taxas e Impostos (largura total) */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-amber-50 px-5 py-3 border-b border-amber-100">
          <h4 className="font-bold text-amber-900 flex items-center gap-2">
            <Receipt size={16} className="text-amber-600" />
            Taxas e Impostos
          </h4>
          <p className="text-[10px] text-amber-600 mt-0.5">Pagamentos obrigatórios por fase da obra</p>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 font-semibold text-slate-500 text-xs uppercase tracking-wider">Descrição</th>
                <th className="text-center py-2 font-semibold text-slate-500 text-xs uppercase tracking-wider w-32">Fase</th>
                <th className="text-right py-2 font-semibold text-slate-500 text-xs uppercase tracking-wider w-36">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calculation.taxDetails.map((tax, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-2.5 text-slate-700">{tax.name}</td>
                  <td className="py-2.5 text-center">
                    <Badge type={tax.phase} />
                  </td>
                  <td className="py-2.5 text-right font-mono font-semibold text-slate-800">
                    {formatCurrency(tax.value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-amber-50/50">
                <td className="py-3 font-bold text-slate-700 uppercase text-xs">Total Taxas e Impostos</td>
                <td></td>
                <td className="py-3 text-right font-mono font-bold text-lg text-amber-700">
                  {formatCurrency(calculation.softCost)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Cronograma Profissional de Engenharia - AGORA COM 6 FASES MACRO EXPANSÍVEIS */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Calendar className="text-indigo-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">Cronograma Financeiro Detalhado</h3>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded uppercase tracking-wider">
            Inflação Setorial: 0.85% a.m.
          </span>
        </div>
        <div className="p-4">
          <ExpandablePhasesTable
            projectData={state.data}
            detailedSchedule={detailedSchedule}
            hardCost={calculation.hardCost}
            totalCost={totalInvest}
            administrationFee={calculation.administrationFee}
            deadlineMonths={deadlineMonths}
          />
        </div>
      </div>

      {/* Ações Finais */}
      <div className="flex justify-center gap-4 pt-4">
        <button 
          onClick={resetWizard}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={20} />
          Nova Simulação
        </button>
        <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all">
          <Download size={20} />
          Exportar Orçamento (PDF)
        </button>
      </div>
    </div>
  );
};

const TimelineBar: React.FC<{ phase: DetailedPhase, totalMonths: number }> = ({ phase, totalMonths }) => {
  const totalUnits = totalMonths + 1;
  const left = (phase.startMonth / totalUnits) * 100;
  const width = ((phase.endMonth - phase.startMonth + 1) / totalUnits) * 100;

  const bgColors: Record<string, string> = {
    pre: 'bg-blue-500',
    construction: 'bg-emerald-500',
    post: 'bg-orange-500',
    admin: 'bg-purple-500',
  };

  return (
    <div 
      className={`absolute h-full ${bgColors[phase.type]} rounded-full transition-all duration-1000 ease-out shadow-sm`}
      style={{ left: `${left}%`, width: `${width}%` }}
    />
  );
};

const Badge: React.FC<{ type: 'pre' | 'construction' | 'post' | 'admin' }> = ({ type }) => {
  const styles: Record<string, string> = {
    pre: 'bg-blue-50 text-blue-700 border-blue-200',
    construction: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    post: 'bg-orange-50 text-orange-700 border-orange-200',
    admin: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const labels: Record<string, string> = {
    pre: 'Pré-Obra',
    construction: 'Execução',
    post: 'Pós-Obra',
    admin: 'Administração',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-tighter ${styles[type]}`}>
      {labels[type]}
    </span>
  );
};

// Badge compacto para exibir fase no card de taxas
const PhaseBadge: React.FC<{ phase: 'Pré-Obra' | 'Pós-Obra' }> = ({ phase }) => {
  const isPre = phase === 'Pré-Obra';
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${
      isPre ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
    }`}>
      {phase}
    </span>
  );
};

const KpiCard: React.FC<{ label: string; value: string; subValue?: string; icon: React.ReactNode; highlight?: boolean }> = ({ 
  label, value, subValue, icon, highlight 
}) => (
  <div className={`p-6 rounded-xl border flex flex-col justify-between h-32 relative overflow-hidden transition-all duration-300 hover:shadow-md ${highlight ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-200'}`}>
    <div className="z-10">
      <p className={`text-[10px] font-bold uppercase tracking-widest ${highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{label}</p>
      <h3 className={`text-2xl font-bold mt-1 ${highlight ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      {subValue && <p className={`text-[10px] mt-1 font-medium ${highlight ? 'text-indigo-200' : 'text-slate-400'}`}>{subValue}</p>}
    </div>
    <div className={`absolute -right-4 -bottom-4 p-4 rounded-full opacity-10 ${highlight ? 'bg-white text-white' : 'bg-slate-900'}`}>
      <div className="scale-150 transform">
        {icon}
      </div>
    </div>
  </div>
);