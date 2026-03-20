import type { FC } from 'react';

interface InfoIconProps {
  label: string;
}

const InfoIcon: FC<InfoIconProps> = ({ label }) => (
  <span
    className="ml-2 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/10 text-[0.55rem] font-semibold leading-none text-white/80"
    aria-label={label}
    title={label}
  >
    i
  </span>
);

export default InfoIcon;
