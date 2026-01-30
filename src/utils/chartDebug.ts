/**
 * DIAGNOSTIC UTILITY - DO NOT USE IN PRODUCTION
 * Helper functions to isolate chart rendering issues.
 */

export const ChartDebug = {
  // Gera um ID curto aleatório para rastrear instâncias do componente
  getInstanceId: () => Math.random().toString(36).substring(2, 7),

  // H2: Valida se existem NaNs ou Infinitos nos dados
  assertFiniteSeries: (data: any[], keys: string[], contextLabel: string) => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn(`[CHART_DEBUG][${contextLabel}] ⚠️ Data array is empty or null.`);
      return false;
    }

    let hasError = false;
    data.forEach((row, index) => {
      keys.forEach(key => {
        const val = row[key];
        if (typeof val !== 'number' || !Number.isFinite(val)) {
          console.error(`[CHART_DEBUG][${contextLabel}] 🚨 DATA PANIC at row ${index}, key "${key}":`, val);
          hasError = true;
        }
      });
    });
    
    if (!hasError) console.log(`[CHART_DEBUG][${contextLabel}] ✅ Data integrity OK (${data.length} rows).`);
    return !hasError;
  },

  // H1: Loga dimensões físicas reais
  logRect: (el: HTMLElement | null, label: string) => {
    if (!el) {
      console.log(`[CHART_DEBUG][${label}] Element is null`);
      return;
    }
    const r = el.getBoundingClientRect();
    console.log(`[CHART_DEBUG][${label}] Rect: ${Math.round(r.width)}w x ${Math.round(r.height)}h | Top: ${Math.round(r.top)}`);
  },

  // H1/H5: Loga estilos computados que podem ocultar o elemento
  logComputedStyles: (el: HTMLElement | null, label: string) => {
    if (!el) return;
    const style = window.getComputedStyle(el);
    console.log(`[CHART_DEBUG][${label}] Styles -> Display: ${style.display}, Opacity: ${style.opacity}, Visibility: ${style.visibility}, Height: ${style.height}`);
  },

  // H4: Checa colisão de IDs no DOM
  checkDuplicateIds: (id: string) => {
    const count = document.querySelectorAll(`#${id}`).length;
    if (count > 1) {
      console.error(`[CHART_DEBUG][ID_COLLISION] 🚨 Found ${count} elements with ID "#${id}". SVG Gradients will break.`);
    } else {
      console.log(`[CHART_DEBUG][ID_CHECK] ID "#${id}" count: ${count}`);
    }
  }
};