import { Children, type FC, type ReactNode } from 'react';

interface ProvidersMasonryProps {
  children: ReactNode;
  className?: string;
  maxColumns?: number;
}

const ProvidersMasonry: FC<ProvidersMasonryProps> = ({ children, className = '' }) => (
  <section
    className={[
      'grid w-full justify-center gap-8 px-2',
      'grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4',
      className,
    ]
      .join(' ')
      .trim()}
  >
    {Children.toArray(children).map((child, index) => (
      <div key={`provider-${index}`} className="w-full min-w-0">
        {child}
      </div>
    ))}
  </section>
);

export default ProvidersMasonry;
