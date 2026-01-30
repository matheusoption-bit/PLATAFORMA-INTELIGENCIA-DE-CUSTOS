import React from 'react';
import { AlertTriangle, Shield, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { 
  getScenarioId, 
  getScenarioInfo, 
  getRiskColorClasses,
  type RiskLevel 
} from '../../data/marketData';
import type { TopographyType } from '../../types';

interface ScenarioRiskAlertProps {
  topography: TopographyType;
  hasSubfloor: boolean;
  totalCost: number;
}

export const ScenarioRiskAlert: React.FC<ScenarioRiskAlertProps> = ({
  topography,
  hasSubfloor,
  totalCost,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  const scenarioId = getScenarioId(topography, hasSubfloor);
  const scenario = getScenarioInfo(scenarioId);
  const { risk } = scenario;
  const colorClasses = getRiskColorClasses(risk.level);
  
  // Calcular valor da contingência recomendada
  const contingencyValue = totalCost * (risk.contingencyPercent / 100);
  
  // Ícone baseado no nível de risco
  const RiskIcon = {
    baixo: Shield,
    medio: Info,
    alto: AlertCircle,
    critico: AlertTriangle,
  }[risk.level];
  
  // Se o risco for baixo, mostrar versão compacta
  if (risk.level === 'baixo') {
    return (
      <div className={`rounded-xl border ${colorClasses.border} ${colorClasses.bg} p-4`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-green-100`}>
            <Shield size={20} className="text-green-600" />
          </div>
          <div>
            <p className={`font-semibold ${colorClasses.text}`}>
              Cenário de Baixa Complexidade
            </p>
            <p className="text-sm text-green-600/80">
              {scenario.label} • Contingência recomendada: {risk.contingencyPercent}% 
              ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contingencyValue)})
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`rounded-xl border-2 ${colorClasses.border} ${colorClasses.bg} overflow-hidden`}>
      {/* Header do Alerta */}
      <div 
        className={`p-4 cursor-pointer transition-colors hover:brightness-95`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              risk.level === 'critico' ? 'bg-red-100' :
              risk.level === 'alto' ? 'bg-orange-100' :
              'bg-yellow-100'
            }`}>
              <RiskIcon size={24} className={colorClasses.text} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold ${colorClasses.text} text-lg`}>
                  {risk.label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  risk.level === 'critico' ? 'bg-red-200 text-red-800' :
                  risk.level === 'alto' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {scenario.label}
                </span>
              </div>
              <p className={`text-sm ${colorClasses.text} opacity-80 mt-0.5`}>
                {scenario.description}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className={`text-xs ${colorClasses.text} opacity-70`}>Contingência Recomendada</p>
              <p className={`font-bold ${colorClasses.text}`}>
                {risk.contingencyPercent}% ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contingencyValue)})
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp size={20} className={colorClasses.text} />
            ) : (
              <ChevronDown size={20} className={colorClasses.text} />
            )}
          </div>
        </div>
      </div>
      
      {/* Detalhes Expandidos */}
      {isExpanded && (
        <div className={`px-4 pb-4 border-t ${colorClasses.border} bg-white/50`}>
          <div className="pt-4 space-y-4">
            {/* Contingência Mobile */}
            <div className="sm:hidden">
              <p className={`text-xs ${colorClasses.text} opacity-70`}>Contingência Recomendada</p>
              <p className={`font-bold ${colorClasses.text}`}>
                {risk.contingencyPercent}% ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contingencyValue)})
              </p>
            </div>
            
            {/* Multiplicadores */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Multiplicador de Custo</p>
                <p className={`font-bold text-lg ${colorClasses.text}`}>
                  {scenario.totalCostMultiplier.toFixed(2)}x
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Multiplicador de Prazo</p>
                <p className={`font-bold text-lg ${colorClasses.text}`}>
                  {scenario.scheduleMultiplier.toFixed(2)}x
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Fundações</p>
                <p className={`font-bold text-lg text-slate-700`}>
                  {scenario.phaseMultipliers.foundations.toFixed(2)}x
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-slate-100">
                <p className="text-xs text-slate-500">Terraplanagem</p>
                <p className={`font-bold text-lg text-slate-700`}>
                  {scenario.phaseMultipliers.earthwork.toFixed(2)}x
                </p>
              </div>
            </div>
            
            {/* Notas de Risco */}
            <div>
              <p className={`text-xs font-semibold ${colorClasses.text} mb-2 uppercase tracking-wider`}>
                Pontos de Atenção
              </p>
              <ul className="space-y-1.5">
                {risk.notes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      risk.level === 'critico' ? 'bg-red-500' :
                      risk.level === 'alto' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`} />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Aviso de Ação */}
            {(risk.level === 'alto' || risk.level === 'critico') && (
              <div className={`p-3 rounded-lg border ${
                risk.level === 'critico' ? 'bg-red-100/50 border-red-200' : 'bg-orange-100/50 border-orange-200'
              }`}>
                <p className={`text-sm font-medium ${
                  risk.level === 'critico' ? 'text-red-800' : 'text-orange-800'
                }`}>
                  {risk.level === 'critico' 
                    ? '⚠️ Recomendamos contratar laudo de sondagem de solo e projeto estrutural especializado antes de iniciar a obra.'
                    : '⚠️ Recomendamos consultar um engenheiro estrutural para validar a viabilidade do projeto.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
