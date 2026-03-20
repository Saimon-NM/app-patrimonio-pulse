import { render } from '@testing-library/react';
import { useSavingStatus } from './useSavingStatus';

describe('useSavingStatus', () => {
  it('derives palette and percentages', () => {
    let result = null as ReturnType<typeof useSavingStatus> | null;

    const Test = () => {
      result = useSavingStatus(1000, 300);
      return null;
    };

    render(<Test />);
    expect(result).not.toBeNull();
    expect(result?.savingPercent).toBeCloseTo(30);
    expect(result?.savingStatus).toBe('Excelente');
    expect(result?.savingMessage).toContain('Gran ritmo');
    expect(result?.savingPalette.trackColor).toBe('#22c55e');
    expect(result?.targetStatement).toContain('$1,000.00');
  });
});
