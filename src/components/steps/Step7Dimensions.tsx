import React, { useEffect } from 'react';
import { Layers, ArrowUpFromLine, ArrowDownToLine, Calendar, AlertTriangle, AlertCircle, RefreshCcw, Ruler, Shield } from 'lucide-react';
import { useWizard } from '../../context/WizardContext';
import { MARKET_DATA } from '../../data/marketData';
import type { SubfloorDepth, ContainmentType } from '../../types';

export const Step7Dimensions: React.FC = () => {
  const { state, updateData, setStepValid } = useWizard();
  const { areas, deadlineMonths, recommendedDeadlineMonths, deadlineMode, maturity, subfloorDepth, topography, containmentType } = state.data;

  // Cálculo da Área Total
  const totalArea = areas.ground + areas.upper + areas.subfloor;

  // Mostrar pergunta de profundidade apenas se:
  // 1. Usuário tem projetos (maturity === 'project')
  // 2. Área de subsolo > 0
  const showSubfloorDepthQuestion = maturity === 'project' && areas.subfloor > 0;

  // Mostrar pergunta de contenção apenas se:
  // 1. Usuário tem projetos (maturity === 'project')
  // 2. Topografia não é plana OU tem subsolo
  const showContainmentQuestion = maturity === 'project' && (topography !== 'flat' || areas.subfloor > 0);

  // Determinar tipos de contenção aplicáveis baseado no cenário
  const getApplicableContainmentTypes = () => {
    const hasSubfloor = areas.subfloor > 0;
    let scenarioKey = '';
    
    if (topography === 'flat') {
      scenarioKey = hasSubfloor ? 'flat_with_subfloor' : 'flat_no_subfloor';
    } else if (topography === 'slope_light' || topography === 'slope_high') {
      // slope_up ou slope_down - usaremos slope_up como referência
      scenarioKey = hasSubfloor ? 'slope_up_with_subfloor' : 'slope_up_no_subfloor';
    }
    
    return Object.entries(MARKET_DATA.containmentTypes)
      .filter(([_, data]) => data.applicable.includes(scenarioKey) || data.applicable.includes(scenarioKey.replace('up', 'down')))
      .map(([key, data]) => ({ key, ...data }));
  };

  const applicableContainmentTypes = getApplicableContainmentTypes();

  // Cálculos de limites para o Slider de Prazo
  const minSelectable = Math.max(6, Math.floor(recommendedDeadlineMonths * 0.70));
  const maxSelectable = recommendedDeadlineMonths + 12;

  // Limite de Risco (80% do recomendado que vem do contexto)
  const riskThreshold = Math.ceil(recommendedDeadlineMonths * 0.8);
  const isRiskyDeadline = deadlineMonths < riskThreshold;

  // Validação: Pelo menos uma área deve ser maior que zero e prazo > 0
  // Se tem subsolo e é project, deve ter profundidade selecionada
  // Se tem topografia não plana e é project, deve ter contenção selecionada
  useEffect(() => {
    const basicValid = totalArea > 0 && deadlineMonths > 0;
    const depthValid = !showSubfloorDepthQuestion || subfloorDepth !== null;
    const containmentValid = !showContainmentQuestion || containmentType !== null;
    const isValid = basicValid && depthValid && containmentValid;
    setStepValid(isValid);
  }, [totalArea, deadlineMonths, showSubfloorDepthQuestion, subfloorDepth, showContainmentQuestion, containmentType]);

  // Handler de inputs
  const handleAreaChange = (key: keyof typeof areas, value: string) => {
    const numValue = parseFloat(value);
    const newVal = isNaN(numValue) ? 0 : numValue;
    
    // Atualiza a área (o context recalcula o prazo se estiver em auto)
    const newAreas = { ...areas, [key]: newVal };
    updateData({ areas: newAreas });
  };

  return (
    <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-700 w-full max-w-6xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 text-center">
        Detalhamento Técnico das Áreas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-12">
        {/* Térreo */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <Layers size={32} />
            <label className="font-semibold text-slate-700 text-xl">Área Térreo</label>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={areas.ground || ''}
              onChange={(e) => handleAreaChange('ground', e.target.value)}
              className="w-full text-4xl font-bold text-slate-900 placeholder-slate-200 outline-none border-b border-slate-100 pb-3 focus:border-indigo-500 transition-colors"
              placeholder="0"
            />
            <span className="absolute right-0 bottom-4 text-slate-400 font-medium text-lg">m²</span>
          </div>
        </div>

        {/* Superior */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <ArrowUpFromLine size={32} />
            <label className="font-semibold text-slate-700 text-xl">Área Superior</label>
          </div>
          <div className="relative">
            <input
              type="number"
              min="0"
              value={areas.upper || ''}
              onChange={(e) => handleAreaChange('upper', e.target.value)}
              className="w-full text-4xl font-bold text-slate-900 placeholder-slate-200 outline-none border-b border-slate-100 pb-3 focus:border-indigo-500 transition-colors"
              placeholder="0"
            />
            <span className="absolute right-0 bottom-4 text-slate-400 font-medium text-lg">m²</span>
          </div>
        </div>

        {/* Subsolo */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6 text-indigo-600">
            <ArrowDownToLine size={32} />
            <label className="font-semibold text-slate-700 text-xl">Subsolo</label>
          </div>
          <div className="relative z-10">
            <input
              type="number"
              min="0"
              value={areas.subfloor || ''}
              onChange={(e) => handleAreaChange('subfloor', e.target.value)}
              className="w-full text-4xl font-bold text-slate-900 placeholder-slate-200 outline-none border-b border-slate-100 pb-3 focus:border-indigo-500 transition-colors"
              placeholder="0"
            />
            <span className="absolute right-0 bottom-4 text-slate-400 font-medium text-lg">m²</span>
          </div>
          
          {areas.subfloor > 0 && (
             <div className="mt-4 flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg text-sm animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
                <p>Atenção: Subsolos encarecem a fundação em aprox. <strong>25%</strong>.</p>
             </div>
          )}
        </div>
      </div>

      {/* Pergunta de Profundidade do Subsolo - APENAS para maturity === 'project' */}
      {showSubfloorDepthQuestion && (
        <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Ruler size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Profundidade do Subsolo</h3>
              <p className="text-sm text-slate-500">Conforme indicado no projeto estrutural</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(MARKET_DATA.subfloorDepth).map(([key, data]) => {
              const isSelected = subfloorDepth === key;
              const multiplierLabel = data.multiplier > 1 
                ? `+${((data.multiplier - 1) * 100).toFixed(0)}% custo`
                : 'Base';
              
              return (
                <button
                  key={key}
                  onClick={() => updateData({ subfloorDepth: key as SubfloorDepth })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`block font-semibold text-sm ${isSelected ? 'text-indigo-700' : 'text-slate-700'}`}>
                    {data.label}
                  </span>
                  <span className={`block text-xs mt-1 ${
                    isSelected ? 'text-indigo-500' : 'text-slate-400'
                  }`}>
                    {multiplierLabel}
                  </span>
                </button>
              );
            })}
          </div>
          
          <p className="text-xs text-slate-400 mt-4 text-center">
            A profundidade do subsolo impacta diretamente nos custos de escavação, escoramento e impermeabilização.
          </p>
        </div>
      )}

      {/* Pergunta de Tipo de Contenção - APENAS para maturity === 'project' E (topografia não plana OU subsolo) */}
      {showContainmentQuestion && (
        <div className="w-full bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Shield size={24} className="text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg">Tipo de Contenção</h3>
              <p className="text-sm text-slate-500">
                {topography !== 'flat' 
                  ? 'Contenção necessária devido à topografia do terreno' 
                  : 'Contenção para o subsolo'}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {applicableContainmentTypes.map(({ key, label, costPerM2 }) => {
              const isSelected = containmentType === key;
              const costLabel = costPerM2 > 0 
                ? `~R$ ${costPerM2}/m²`
                : 'Sem custo adicional';
              
              return (
                <button
                  key={key}
                  onClick={() => updateData({ containmentType: key as ContainmentType })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-100 shadow-md' 
                      : 'border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <span className={`block font-semibold text-sm ${isSelected ? 'text-amber-700' : 'text-slate-700'}`}>
                    {label}
                  </span>
                  <span className={`block text-xs mt-1 ${
                    isSelected ? 'text-amber-600' : 'text-slate-400'
                  }`}>
                    {costLabel}
                  </span>
                </button>
              );
            })}
          </div>
          
          <p className="text-xs text-amber-700 mt-4 text-center bg-amber-100 p-2 rounded-lg">
            💡 O tipo de contenção impacta significativamente o custo de fundações. Consulte o engenheiro estrutural.
          </p>
        </div>
      )}

      {/* Seção de Prazo */}
      <div className={`w-full max-w-lg p-10 rounded-3xl border transition-colors duration-300 ${isRiskyDeadline ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex flex-col items-center">
          
          <div className="flex w-full items-center justify-between mb-6">
             <div className="flex items-center gap-3 text-slate-700">
                <Calendar size={28} className={isRiskyDeadline ? 'text-red-500' : 'text-indigo-600'} />
                <span className="font-semibold text-xl">Prazo de Execução</span>
             </div>
             {deadlineMode === 'manual' && (
                <button
                  onClick={() => updateData({ deadlineMode: 'auto' })}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors bg-white px-3 py-2 rounded-lg border border-indigo-100 shadow-sm"
                >
                  <RefreshCcw size={14} /> Auto
                </button>
             )}
          </div>
          
          <div className="text-center mb-6">
             <span className={`text-6xl font-bold ${isRiskyDeadline ? 'text-red-600' : 'text-slate-900'}`}>{deadlineMonths}</span>
             <span className="text-slate-500 ml-2 font-medium text-xl">meses</span>
          </div>

          <div className="w-full px-2 mb-4">
             <input
               type="range"
               min={minSelectable}
               max={maxSelectable}
               step={1}
               value={deadlineMonths}
               onChange={(e) => updateData({ deadlineMonths: parseInt(e.target.value) })}
               className={`w-full h-3 rounded-lg appearance-none cursor-pointer transition-all ${isRiskyDeadline ? 'bg-red-200 accent-red-600' : 'bg-slate-200 accent-indigo-600'}`}
             />
             <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium px-1">
               <span>{minSelectable} meses</span>
               <span>Recomendado: {recommendedDeadlineMonths}</span>
               <span>{maxSelectable} meses</span>
             </div>
          </div>

          <div className="mt-2 text-center space-y-2 w-full">
             {isRiskyDeadline && (
               <div className="flex items-start gap-2 text-red-600 bg-red-100 p-4 rounded-xl text-sm text-left animate-in fade-in slide-in-from-bottom-2 shadow-sm">
                 <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                 <p>
                   <strong>Risco de Prazo Agressivo:</strong> Tentar construir abaixo de {riskThreshold} meses aumentará drasticamente o custo com mão de obra extra.
                 </p>
               </div>
             )}
             
             {!isRiskyDeadline && (
                 <p className="text-sm text-slate-400">
                    {deadlineMode === 'auto' 
                      ? 'Este prazo é calculado automaticamente conforme o porte da obra.' 
                      : 'Prazo definido manualmente.'}
                 </p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};