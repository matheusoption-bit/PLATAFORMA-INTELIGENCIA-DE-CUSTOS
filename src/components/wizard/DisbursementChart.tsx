import React, { useMemo, useState } from 'react';
import { 
  LineChart, Line, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, 
  ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import { DetailedPhase, ConstructionCostResult } from '../../utils/calculationEngine';
import { formatCurrency, formatPercent } from '../../utils/formatting';
import { AlertCircle, Activity, DollarSign, Layers } from 'lucide-react';
import { getPhaseProfile, getWeights, distributeByWeights } from '../../utils/curveProfiles';

// --- TYPES & INTERFACES ---

interface DisbursementChartProps {
  phases?: DetailedPhase[];
  calculation: ConstructionCostResult;
  deadlineMonths: number;
}

interface FinancialTimePoint {
  month: number;
  label: string;
  monthlyValue: number;
  accumulatedValue: number;
  accumulatedPct: number;
  hardCost: number;
  softCost: number;
  isPeak: boolean;
}

// --- HELPER: Suavização para curva S ---
/**
 * Aplica suavização média móvel simples para criar transições mais suaves
 * Típico de fluxo de caixa real em obras.
 */
const smoothTimeline = (values: number[], windowSize: number = 3): number[] => {
  if (values.length <= 2) return values;
  
  const result: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);
  
  for (let i = 0; i < values.length; i++) {
    let sum = 0;
    let count = 0;
    
    for (let j = i - halfWindow; j <= i + halfWindow; j++) {
      if (j >= 0 && j < values.length) {
        sum += values[j];
        count++;
      }
    }
    
    result.push(sum / count);
  }
  
  // Preservar totais: normalizar para manter soma original
  const originalSum = values.reduce((a, b) => a + b, 0);
  const smoothedSum = result.reduce((a, b) => a + b, 0);
  
  if (smoothedSum > 0 && originalSum > 0) {
    const factor = originalSum / smoothedSum;
    return result.map(v => v * factor);
  }
  
  return result;
};

/**
 * Gera distribuição base em curva S (sigmóide) para fallback quando não há fases detalhadas.
 * Parâmetros calibrados para obras residenciais típicas:
 * - Início lento (mobilização)
 * - Pico no meio (estrutura/alvenaria)
 * - Desaceleração no final (acabamentos)
 */
const generateSCurveDistribution = (months: number): number[] => {
  if (months <= 0) return [];
  if (months === 1) return [1];
  
  const weights: number[] = [];
  
  for (let i = 0; i < months; i++) {
    // Posição normalizada (0 a 1)
    const t = i / (months - 1);
    
    // Curva S usando função logística modificada
    // Pico aproximado em 40-60% do prazo
    const steepness = 6; // Quanto maior, mais acentuada a curva
    const midpoint = 0.45; // Onde ocorre o pico (45% do prazo)
    
    // Derivada da função logística (forma de sino assimétrica)
    const sigmoid = 1 / (1 + Math.exp(-steepness * (t - midpoint)));
    const derivative = steepness * sigmoid * (1 - sigmoid);
    
    weights.push(derivative);
  }
  
  // Normalizar para soma = 1
  const sum = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => w / sum);
};

// --- LOGIC: DATA BUILDER ---
const buildFinancialTimeline = (
  totalCost: number,
  deadlineMonths: number,
  phases?: DetailedPhase[]
): FinancialTimePoint[] => {
  // Guardrail de entrada: Validar números
  const safeTotalCost = (Number.isFinite(totalCost) && totalCost > 0) ? totalCost : 0;
  const safeDeadline = (Number.isFinite(deadlineMonths) && deadlineMonths > 0) 
    ? Math.max(1, Math.floor(deadlineMonths)) 
    : 12;

  if (safeTotalCost === 0) return [];

  const timeline: FinancialTimePoint[] = Array.from({ length: safeDeadline }, (_, i) => ({
    month: i + 1,
    label: `M${i + 1}`,
    monthlyValue: 0,
    accumulatedValue: 0,
    accumulatedPct: 0,
    hardCost: 0,
    softCost: 0,
    isPeak: false
  }));

  if (phases && phases.length > 0) {
    phases.forEach(phase => {
      const val = phase.inflatedValue;
      if (!Number.isFinite(val) || val <= 0) return;

      let start = Math.max(1, Math.min(phase.startMonth, safeDeadline));
      let end = Math.max(start, Math.min(phase.endMonth, safeDeadline));
      if (phase.startMonth <= 0) start = 1; 

      const duration = end - start + 1;
      // Soft costs: pré-obra + administração
      const isSoft = phase.type === 'pre' || phase.type === 'admin';

      // ══════════════════════════════════════════════════════════
      // Distribuição ponderada por perfil de fase (não-linear)
      // Regra de Ouro: custos de obra têm picos e vales
      // ══════════════════════════════════════════════════════════
      const profile = getPhaseProfile(phase.name, phase.type);
      const weights = getWeights(profile, duration);
      const monthlyValues = distributeByWeights(val, weights);

      // Aplicar valores no timeline
      for (let i = 0; i < duration; i++) {
        const monthIndex = (start - 1) + i;
        if (monthIndex >= 0 && monthIndex < timeline.length) {
          const monthValue = monthlyValues[i];
          if (Number.isFinite(monthValue)) {
            timeline[monthIndex].monthlyValue += monthValue;
            if (isSoft) {
              timeline[monthIndex].softCost += monthValue;
            } else {
              timeline[monthIndex].hardCost += monthValue;
            }
          }
        }
      }
    });
  } else {
    // Fallback: Distribuição em curva S típica de obra (não linear)
    const sCurveWeights = generateSCurveDistribution(safeDeadline);
    timeline.forEach((t, i) => {
      t.monthlyValue = safeTotalCost * sCurveWeights[i];
      t.hardCost = t.monthlyValue * 0.85; // ~85% obra física
      t.softCost = t.monthlyValue * 0.15; // ~15% soft costs
    });
  }

  // ══════════════════════════════════════════════════════════
  // Suavização: Remover saltos abruptos entre meses
  // Cria uma curva mais natural e realista
  // ══════════════════════════════════════════════════════════
  const rawValues = timeline.map(t => t.monthlyValue);
  const smoothedValues = smoothTimeline(rawValues, 3);
  
  // Aplicar valores suavizados mantendo proporção hard/soft
  timeline.forEach((t, i) => {
    if (t.monthlyValue > 0) {
      const ratio = smoothedValues[i] / t.monthlyValue;
      t.monthlyValue = smoothedValues[i];
      t.hardCost *= ratio;
      t.softCost *= ratio;
    } else {
      t.monthlyValue = smoothedValues[i];
    }
  });

  // Normalização e Acumulado
  let runningTotal = 0;
  let maxVal = 0;
  
  timeline.forEach(t => {
    t.monthlyValue = Number.isFinite(t.monthlyValue) ? t.monthlyValue : 0;
    runningTotal += t.monthlyValue;
    if (t.monthlyValue > maxVal) maxVal = t.monthlyValue;
  });

  const factor = runningTotal > 0 ? safeTotalCost / runningTotal : 0;
  let accumulated = 0;

  return timeline.map(t => {
    const v = t.monthlyValue * factor;
    accumulated += v;
    return {
      month: t.month,
      label: t.label,
      monthlyValue: v,
      hardCost: t.hardCost * factor,
      softCost: t.softCost * factor,
      accumulatedValue: accumulated,
      accumulatedPct: safeTotalCost > 0 ? (accumulated / safeTotalCost) * 100 : 0,
      isPeak: v > 0 && v >= (maxVal * factor * 0.99)
    };
  });
};

export const DisbursementChart: React.FC<DisbursementChartProps> = ({ 
  phases, 
  calculation, 
  deadlineMonths 
}) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'cumulative'>('monthly');

  // Gradiente removido para evitar problemas de StrictMode/ID

  // Memoized Data Construction
  const data = useMemo(() => {
    const timeline = buildFinancialTimeline(calculation.totalCost, deadlineMonths, phases);
    
    // Fallback: nunca retorna array vazio
    if (!timeline || timeline.length === 0) {
      return Array.from({ length: Math.max(6, deadlineMonths || 6) }, (_, i) => ({
        month: i + 1,
        label: `M${i + 1}`,
        monthlyValue: 0,
        hardCost: 0,
        softCost: 0,
        accumulatedValue: 0,
        accumulatedPct: 0,
        isPeak: false
      }));
    }
    return timeline;
  }, [calculation.totalCost, deadlineMonths, phases]);

  // Derived Statistics
  const avgMonthly = deadlineMonths > 0 ? calculation.totalCost / deadlineMonths : 0;
  const peakMonth = data.find(d => d.isPeak);

  // Pie Chart Data Construction - Agora com 3 categorias
  const categoryData = useMemo(() => {
    const hard = Number(calculation.hardCost) || 0;
    const adminFee = Number(calculation.administrationFee) || 0;
    // Soft costs: taxas + projetos (SEM admin que agora é separado)
    const soft = (Number(calculation.softCost) || 0) + (Number(calculation.projectFees) || 0);
    
    // Fallback visual se os dados forem 0 ou NaN para não quebrar o Pie
    if (!Number.isFinite(hard) || !Number.isFinite(soft) || hard + soft + adminFee <= 0) return [];
    
    return [
      { name: 'Obra Física', value: hard, color: '#4f46e5' },
      { name: 'Taxas & Projetos', value: soft, color: '#f59e0b' },
      { name: 'Administração', value: adminFee, color: '#8b5cf6' },
    ].filter(item => Number.isFinite(item.value) && item.value > 0);
  }, [calculation]);

  // --- DATA GUARD / FALLBACK UI ---
  // Se os dados essenciais estiverem zerados ou inválidos, mostra fallback.
  // Isso previne renderizar um gráfico vazio/branco que confunde o usuário.
  const isInvalidData = !data || data.length === 0 || calculation.totalCost <= 0;

  // Nunca retorna vazio, sempre mostra gráfico (mesmo que tudo zero)

  return (
    <div className="space-y-8">
      {/* 1. SEÇÃO PRINCIPAL: FLUXO DE CAIXA */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Activity className="text-indigo-600" size={20} />
              Fluxo Financeiro
            </h3>
            <p className="text-sm text-slate-500">
              {viewMode === 'monthly' ? 'Desembolso previsto mês a mês.' : 'Evolução acumulada do investimento.'}
            </p>
          </div>
          
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-bold">
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Mensal
            </button>
            <button
              onClick={() => setViewMode('cumulative')}
              className={`px-4 py-2 rounded-md transition-all ${viewMode === 'cumulative' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Acumulado
            </button>
          </div>
        </div>

        {/* GRÁFICO PRINCIPAL */}
        <div style={{ width: '100%', height: '320px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          {viewMode === 'monthly' ? (
            <LineChart width={800} height={300} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value: number) => [formatCurrency(value), 'Desembolso']}
              />
              <Line type="monotone" dataKey="monthlyValue" stroke="#818cf8" strokeWidth={3} dot={{ fill: '#4f46e5', r: 3 }} />
              <ReferenceLine y={avgMonthly} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Média', position: 'right', fontSize: 10, fill: '#f59e0b' }} />
            </LineChart>
          ) : (
            <AreaChart width={800} height={300} data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} dy={10} />
              <YAxis tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} width={60} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                formatter={(value: number, _name: string, props: { payload?: FinancialTimePoint }) => [
                  `${formatCurrency(value)} (${props.payload?.accumulatedPct?.toFixed(0) || 0}%)`,
                  'Acumulado'
                ]}
              />
              {/* Linhas de referência nos marcos de 25%, 50%, 75% */}
              <ReferenceLine y={calculation.totalCost * 0.25} stroke="#94a3b8" strokeDasharray="3 3" />
              <ReferenceLine y={calculation.totalCost * 0.50} stroke="#94a3b8" strokeDasharray="3 3" />
              <ReferenceLine y={calculation.totalCost * 0.75} stroke="#94a3b8" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="accumulatedValue" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={0.15}
                fill="#4f46e5"
              />
            </AreaChart>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
           {viewMode === 'monthly' ? (
             <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Desembolso Mensal
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Média: {formatCurrency(avgMonthly)}
                </div>
             </>
           ) : (
             <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Valor Acumulado (Curva S)
                </div>
                <div className="flex items-center gap-2">
                   <span className="w-4 h-0.5 bg-slate-400"></span> Marcos: 25%, 50%, 75%
                </div>
             </>
           )}
        </div>
      </div>

      {/* 2. GRIDS SECUNDÁRIOS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Gráfico de Barras Empilhadas (Hard vs Soft) */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
             <Layers size={16} className="text-indigo-600"/> Distribuição Cronológica
           </h4>
           <div style={{ width: '100%', height: '200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <LineChart width={550} height={180} data={data}>
               <CartesianGrid vertical={false} stroke="#f1f5f9" />
               <XAxis dataKey="month" tickFormatter={(v) => `M${v}`} tick={{fontSize: 10}} axisLine={false} tickLine={false} />
               <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} width={35}/>
               <Tooltip formatter={(val: number) => formatCurrency(val)} />
               <Line type="monotone" dataKey="softCost" stroke="#f59e0b" strokeWidth={2} name="Soft Costs" />
               <Line type="monotone" dataKey="hardCost" stroke="#10b981" strokeWidth={2} name="Hard Costs" />
             </LineChart>
           </div>
        </div>

        {/* Gráfico de Pizza (Pie) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
           <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
             <DollarSign size={16} className="text-indigo-600"/> Distribuição Total
           </h4>
           <div className="h-[180px] relative" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             {categoryData.length > 0 ? (
               <PieChart width={250} height={180}>
                 <Pie 
                   data={categoryData} 
                   cx={125}
                   cy={90}
                   innerRadius={45} 
                   outerRadius={65} 
                   dataKey="value" 
                   paddingAngle={4}
                   stroke="none"
                 >
                   {categoryData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
                 <Tooltip formatter={(v: number) => formatCurrency(v)} />
               </PieChart>
             ) : (
               <div className="flex h-full items-center justify-center text-xs text-slate-400">
                 Dados insuficientes
               </div>
             )}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400">Total</span>
             </div>
           </div>
           
           <div className="mt-2 space-y-1">
              {categoryData.map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">
                     {calculation.totalCost > 0 ? `${((item.value / calculation.totalCost) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};