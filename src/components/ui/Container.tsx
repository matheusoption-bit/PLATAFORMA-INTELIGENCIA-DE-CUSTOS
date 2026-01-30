import React from 'react';
import { cn } from '../../lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Container: React.FC<ContainerProps> = ({ className, children, ...props }) => {
  return (
    <div
      className={cn(
        "w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};