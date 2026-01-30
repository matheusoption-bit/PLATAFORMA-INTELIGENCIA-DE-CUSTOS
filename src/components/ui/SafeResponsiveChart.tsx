import React from 'react';

interface SafeResponsiveChartProps {
  children: React.ReactNode;
  height?: number | string;
  className?: string;
  minHeight?: number;
}

/**
 * SafeResponsiveChart (Simplified Version)
 * 
 * Wrapper estático com height explícito para garantir que o Recharts sempre renderize.
 * Sem gating - sempre mostra children.
 */
export const SafeResponsiveChart: React.FC<SafeResponsiveChartProps> = ({ 
  children, 
  height = 300, 
  className = '',
  minHeight = 0 
}) => {
  const containerStyles: React.CSSProperties = {
    width: '100%',
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: minHeight ? `${minHeight}px` : undefined,
    position: 'relative',
    display: 'block'
  };
  return (
    <div className={className} style={containerStyles}>
      {children}
    </div>
  );
};