// Funções utilitárias de formatação

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

export const formatPercent = (value: number): string => {
  const percent = (value - 1) * 100;
  const sign = percent > 0 ? '+' : '';
  return `${sign}${percent.toFixed(1)}%`;
};