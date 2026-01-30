import { useId, useMemo } from 'react';

/**
 * Hook para gerar IDs únicos e seguros para elementos SVG (Gradients, Masks, Clips).
 * 
 * Problema resolvido:
 * 1. O useId() do React retorna strings com colons (ex: ":r1:"), que quebram seletores url(#...) em alguns browsers.
 * 2. Math.random() causa descasamento no StrictMode e erros de hidratação.
 * 
 * @param prefix Prefixo opcional para facilitar debug
 * @returns ID sanitizado garantido único por instância do componente
 */
export const useChartId = (prefix: string = 'chart') => {
  const rawId = useId();
  
  const cleanId = useMemo(() => {
    // Remove colons e caracteres especiais que invalidam IDs em url(#id)
    const sanitized = rawId.replace(/[^a-zA-Z0-9-_]/g, '');
    return `${prefix}-${sanitized}`;
  }, [rawId, prefix]);

  return cleanId;
};