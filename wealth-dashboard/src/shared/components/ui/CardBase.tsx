import type { FC, ReactNode, HTMLAttributes } from 'react';
import { cn } from '@/shared/utils/cn';

interface CardBaseProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
  label?: string;
}

const CardBase: FC<CardBaseProps> = ({ children, className, as = 'div', label, ...rest }) => {
  const Component = as;
  return (
    <Component
      aria-label={label}
      className={cn('rounded-3xl border border-white/10 bg-black/40 shadow-2xl transition-all duration-300', className)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default CardBase;
