import type { FC } from 'react';

interface AllocationBarProps {
  items: { name: string; percent: number; color: string }[];
}

const AllocationBar: FC<AllocationBarProps> = ({ items }) => {
  const totalPercent = items.reduce((sum, item) => sum + item.percent, 0) || 100;
  let offset = 0;

  return (
    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-white/10" aria-hidden="true">
      {items.map((item, index) => {
        const segmentWidth = (item.percent / totalPercent) * 100;
        const width = index === items.length - 1 ? 100 - offset : segmentWidth;
        const bar = (
          <span
            key={`${item.name}-${index}`}
            className="absolute inset-y-0 rounded-full transition-all duration-300"
            style={{
              left: `${offset}%`,
              width: `${width}%`,
              backgroundColor: item.color,
            }}
          />
        );
        offset += width;
        return bar;
      })}
    </div>
  );
};

export default AllocationBar;
