import React, { useEffect, useState, useMemo, useRef } from 'react';
import { Calendar, AlertCircle, ArrowDownToLine, RefreshCcw, Ruler, ArrowRight } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { BasementIntent } from '../../types';

export const StepDimensionsConceptual: React.FC = () => {
  const { state, updateData, setStepValid } = useWizard();
  const { areas, maturity, basementIntent, recommendedDeadlineMonths, deadlineMonths, deadlineMode } = state.data;
  
  // Calcula área total inicial baseada nos dados salvos ou default
  const initialTotal = (areas.ground + areas.upper + areas.subfloor) || 120;
  const [totalArea, setTotalArea] = useState(initialTotal);
  
  // Estado local para intenção de subsolo (apenas perfil Land)
  const [localBasementIntent, setLocalBasementIntent] = useState<BasementIntent>(basementIntent);
  const [basementAreaInput, setBasementAreaInput] = useState<number | ''>(areas.subfloor > 0 ? areas.subfloor : '');
  
  // Verifica se é perfil Land para exibir opção de subsolo
  const showBasementOption = maturity === 'land';

  // useRef para rastrear última atualização e evitar loop
  const lastUpdateRef = useRef({ ground: 0, upper: 0, subfloor: 0, intent: basementIntent });

  // Calcula as áreas usando useMemo (só recalcula quando dependências mudarem)
  const calculatedAreas = useMemo(() => {
    let ground = 0;
    let upper = 0;
    let subfloor = 0;

    // 1. Definição do Subsolo
    if (showBasementOption && localBasementIntent === 'yes') {
      if (typeof basementAreaInput === 'number' && basementAreaInput > 0) {
        subfloor = basementAreaInput;
      } else {
        subfloor = 30;
      }
    } else {
      subfloor = 0;
    }

    // 2. Distribuição Térreo vs Superior (Heurística)
    if (totalArea <= 160) {
      ground = totalArea;
      upper = 0;
    } else {
      ground = Math.round(totalArea * 0.6);
      upper = totalArea - ground;
    }

    return { ground, upper, subfloor };
  }, [totalArea, localBasementIntent, basementAreaInput, showBasementOption]);

  // Efeito separado para atualizar o contexto (SEM dependências que mudam)
  useEffect(() => {
    const { ground, upper, subfloor } = calculatedAreas;
    
    // Verifica se realmente mudou antes de atualizar
    const hasChanged = 
      lastUpdateRef.current.ground !== ground || 
      lastUpdateRef.current.upper !== upper || 
      lastUpdateRef.current.subfloor !== subfloor ||
      lastUpdateRef.current.intent !== localBasementIntent;

    if (hasChanged) {
      lastUpdateRef.current = { ground, upper, subfloor, intent: localBasementIntent };
      
      updateData({
        areas: {
          ground,
          upper,
          subfloor,
          outdoor: 0
        },
        basementIntent: localBasementIntent
      });
    }
  }, [calculatedAreas, localBasementIntent]);

  // Efeito separado para validação
  useEffect(() => {
    setStepValid(totalArea >= 30);
  }, [totalArea]);

  // Cálculos de limites para o Slider de Prazo
  const minSelectable = Math.max(6, Math.floor(recommendedDeadlineMonths * 0.70));
  const maxSelectable = recommendedDeadlineMonths + 12;

  // Alerta de Risco do Prazo
  const riskThreshold = Math.ceil(recommendedDeadlineMonths * 0.8);
  const isRiskyDeadline = deadlineMonths < riskThreshold;

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-3xl mx-auto pb-10">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 text-center">
        Qual o tamanho aproximado da construção?
      </h2>
      <p className="text-slate-500 mb-10 text-center text-lg">
        Defina a área e veja o impacto direto no prazo estimado.
      </p>

      {/* Card Principal Unificado: Área + Prazo */}
      <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-sm mb-8 overflow-hidden">
        
        {/* Seção Superior: Área */}
        <div className="p-8 pb-6">
          <div className="flex flex-col items-center justify-center">
            {/* Display de Área */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-6xl font-bold text-indigo-600">{totalArea}</span>
              <span className="text-2xl font-medium text-slate-400">m²</span>
            </div>

            {/* Slider de Área */}
            <input
              type="range"
              min="30"
              max="600"
              step="5"
              value={totalArea}
              onChange={(e) => setTotalArea(parseInt(e.target.value))}
              className="w-full h-4 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-500 transition-all mb-6 touch-manipulation"
            />

            {/* Presets de Área */}
            <div className="grid grid-cols-3 gap-3 w-full">
              {[80, 160, 250].map((preset) => (
                <button 
                  key={preset}
                  onClick={() => setTotalArea(preset)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all touch-manipulation active:scale-95 ${totalArea === preset ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 text-slate-500 hover:border-slate-300 active:bg-slate-50'}`}
                >
                  ~{preset}m²
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Divisor com Indicador de Relação */}
        <div className="relative px-8">
          <div className="absolute inset-x-8 top-1/2 h-px bg-slate-200" />
          <div className="relative flex justify-center">
            <div className="bg-white px-4 py-2 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Ruler size={14} className="text-indigo-400" />
              <ArrowRight size={14} className="text-slate-300" />
              <Calendar size={14} className="text-indigo-400" />
            </div>
          </div>
        </div>

        {/* Seção Inferior: Prazo (Integrado) */}
        <div className={`p-6 transition-colors ${isRiskyDeadline ? 'bg-red-50' : 'bg-slate-50'}`}>
          <div className="flex flex-col">
            {/* Header do Prazo */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isRiskyDeadline ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prazo Estimado</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${isRiskyDeadline ? 'text-red-700' : 'text-slate-900'}`}>
                      {deadlineMonths} meses
                    </span>
                    {deadlineMode === 'manual' && (
                      <span className="text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        Manual
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {deadlineMode === 'manual' && (
                <button
                  onClick={() => updateData({ deadlineMode: 'auto' })}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm"
                >
                  <RefreshCcw size={14} /> Recomendado
                </button>
              )}
            </div>

            {/* Slider de Prazo */}
            <div className="mb-3">
              <input
                type="range"
                min={minSelectable}
                max={maxSelectable}
                step={1}
                value={deadlineMonths}
                onChange={(e) => updateData({ deadlineMonths: parseInt(e.target.value) })}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer transition-all ${isRiskyDeadline ? 'bg-red-200 accent-red-600' : 'bg-slate-200 accent-indigo-600'}`}
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>{minSelectable}m</span>
                <span className="text-indigo-500 font-semibold">Recomendado: {recommendedDeadlineMonths}m</span>
                <span>{maxSelectable}m</span>
              </div>
            </div>
            
            {/* Mensagem de Contexto */}
            {isRiskyDeadline ? (
              <div className="flex items-start gap-2 bg-red-100 p-3 rounded-lg animate-in fade-in">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-tight">
                  <strong>Atenção:</strong> Prazo abaixo de {riskThreshold} meses pode exigir equipes extras e aumentar custos.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center">
                Prazo calculado com base na área e produtividade média de mercado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Opção de Subsolo (Apenas Land) - Fora do card principal */}
      {showBasementOption && (
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 animate-in fade-in">
          <div className="flex items-center gap-2 mb-4 text-slate-700 font-semibold">
            <ArrowDownToLine size={20} className="text-indigo-600" />
            <h3>Você pretende construir subsolo?</h3>
          </div>
          
          <div className="flex gap-4 mb-4">
            {(['yes', 'no', 'unknown'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setLocalBasementIntent(opt)}
                className={`flex-1 py-3 px-4 rounded-lg border font-medium text-sm transition-all touch-manipulation active:scale-95
                  ${localBasementIntent === opt 
                    ? 'bg-white border-indigo-600 text-indigo-700 shadow-sm' 
                    : 'bg-transparent border-slate-300 text-slate-500 hover:bg-white active:bg-slate-100'}
                `}
              >
                {opt === 'yes' ? 'Sim' : opt === 'no' ? 'Não' : 'Não sei'}
              </button>
            ))}
          </div>

          {localBasementIntent === 'yes' && (
            <div className="animate-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Área estimada do subsolo (Opcional)
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  value={basementAreaInput}
                  onChange={(e) => setBasementAreaInput(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="Ex: 30"
                  className="w-full p-3 pl-4 pr-12 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <span className="absolute right-4 top-3 text-slate-400 font-medium">m²</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Se deixar em branco, consideraremos 30m² para fins de cálculo.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};