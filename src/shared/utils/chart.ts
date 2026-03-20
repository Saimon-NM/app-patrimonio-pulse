export const createPolyline = (
  data: number[],
  max: number,
  height: number,
  width: number
) => {
  if (data.length < 2 || max <= 0) {
    return '';
  }

  const stepX = width / (data.length - 1);

  return data
    .map((value, index) => {
      const x = index * stepX;
      const ratio = Math.min(value / max, 1);
      const y = height - ratio * height;
      return `${x},${y}`;
    })
    .join(' ');
};
