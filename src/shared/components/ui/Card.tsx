import type { FC, ReactNode } from 'react';
import CardBase from './CardBase';
import { cn } from '@/shared/utils/cn';

interface CardProps {
  children: ReactNode;
  className?: string;
  as?: 'section' | 'div' | 'article';
  label?: string;
}

const Card: FC<CardProps> = ({ children, className = '', as = 'div', label }) => (
  <CardBase as={as} label={label} className={cn('glass p-5', className)}>
    {children}
  </CardBase>
);

export default Card;
