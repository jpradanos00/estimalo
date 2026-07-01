import { type HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export function Card({
  padding = 'md',
  hover = false,
  className = '',
  children,
  ...props
}: CardProps) {
  const paddings: Record<string, string> = {
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 card-shadow ${hover ? 'card-hover' : ''} ${paddings[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
