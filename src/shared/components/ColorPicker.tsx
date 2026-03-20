import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  label?: string;
  onSelect: (color: string) => void;
}

const ColorPicker: FC<ColorPickerProps> = ({ colors, selectedColor, label, onSelect }) => {
  const normalizedSelected = selectedColor?.toLowerCase() ?? '';
  const [customColor, setCustomColor] = useState(selectedColor);
  useEffect(() => {
    setCustomColor(selectedColor);
  }, [selectedColor]);
  return (
    <div className="space-y-2">
      {label && <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/50">{label}</p>}
      <div className="flex flex-wrap items-center gap-2">
        {colors.map((color) => {
          const isSelected = normalizedSelected === color.toLowerCase();
          return (
            <button
              key={color}
              type="button"
              aria-pressed={isSelected}
              aria-label={`Seleccionar color ${color}`}
              onClick={() => {
                const normalized = color.toLowerCase();
                setCustomColor(normalized);
                onSelect(normalized);
              }}
              className={`h-8 w-8 rounded-full border transition focus:outline-none ${
                isSelected
                  ? 'border-white/90 shadow-[0_0_0_3px_rgba(255,255,255,0.6)]'
                  : 'border-white/20'
              }`}
              style={{ backgroundColor: color }}
            />
          );
        })}
      </div>
      <label className="mt-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/50">
        <span>Otro color</span>
        <input
          type="color"
          value={customColor ?? normalizedSelected ?? '#38bdf8'}
          onChange={(event) => {
            const value = event.target.value;
            setCustomColor(value);
            onSelect(value);
          }}
          className="h-8 w-8 rounded-full border border-white/20 p-0"
        />
      </label>
    </div>
  );
};

export default ColorPicker;
