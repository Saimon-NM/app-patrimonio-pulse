import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AccountCard from './AccountCard';

describe('AccountCard', () => {
  const account = {
    id: 'acc-1',
    name: 'Test',
    desc: 'Desc',
    balance: 1000,
    rate: 10,
    monthly: 83.33,
  };

  it('shows ETF action and emits new rate', () => {
    const onAccountChange = vi.fn();
    render(
      <AccountCard
        providerId="prov-1"
        account={account}
        onAccountChange={onAccountChange}
        highlightColor="#123456"
        etfYieldRate={15}
      />
    );

    const button = screen.getByRole('button', { name: /Usar rendimiento ETFs/i });
    fireEvent.click(button);
    expect(onAccountChange).toHaveBeenCalledWith('prov-1', 'acc-1', 'rate', 15);
    expect(screen.getByText('$83.33')).toBeInTheDocument();
  });
});
