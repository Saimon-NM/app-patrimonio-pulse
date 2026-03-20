import type { FC } from 'react';

interface AllocationMeterItem {
  name: string;
  percent: number;
  color: string;
}

interface AllocationMeterProps {
  items: AllocationMeterItem[];
}

const AllocationMeter: FC<AllocationMeterProps> = ({ items }) => (
  <div className="rounded-full bg-white/10 p-1">
    <div className="flex overflow-hidden rounded-full">
      {items.map((item) => (
        <span
          key={item.name}
          className="h-3"
          style={{ width: `${item.percent}%`, background: item.color }}
        />
      ))}
    </div>
  </div>
);

export default AllocationMeter;
