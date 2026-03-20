import type { FC, ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';

interface BadgeProps {
  children: ReactNode;
  className?: string;
  textColor?: string;
  borderColor?: string;
  dotColor?: string;
}

const Badge: FC<BadgeProps> = ({
  children,
  className,
  textColor,
  borderColor,
  dotColor,
}) => {
  const resolvedTextColor = textColor ?? 'currentColor';
  const resolvedBorderColor = borderColor ?? resolvedTextColor;
  const resolvedDotColor = dotColor ?? resolvedTextColor;

  return (
    <span
      className={cn('inline-flex items-center gap-2 border font-semibold', className)}
      style={{ color: resolvedTextColor, borderColor: resolvedBorderColor }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: resolvedDotColor }}
      />
      {children}
    </span>
  );
};

export default Badge;
