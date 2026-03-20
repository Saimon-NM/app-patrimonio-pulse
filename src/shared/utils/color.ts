const clampChannel = (value: number) => Math.min(255, Math.max(0, value));

const normalizeHex = (value: string) => {
  if (!value) {
    return '38bdf8';
  }
  const normalized = value.replace('#', '').trim();
  if (/^[0-9a-f]{3}$/i.test(normalized)) {
    return normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (/^[0-9a-f]{6}$/i.test(normalized)) {
    return normalized;
  }
  return '38bdf8';
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return { r, g, b };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

const adjustChannel = (channel: number, factor: number) => {
  if (factor === 0) {
    return channel;
  }
  if (factor > 0) {
    return clampChannel(Math.round(channel + (255 - channel) * factor));
  }
  return clampChannel(Math.round(channel + channel * factor));
};

const adjustColor = (hex: string, factor: number) => {
  const { r, g, b } = hexToRgb(hex);
  return rgbToHex(
    adjustChannel(r, factor),
    adjustChannel(g, factor),
    adjustChannel(b, factor)
  );
};

export const generateColorVariants = (baseColor: string, steps = [0, 0.25, 0.15, -0.15, -0.3]) => {
  const normalized = normalizeHex(baseColor);
  return steps.map((factor) => `#${adjustColor(normalized, factor)}`);
};
