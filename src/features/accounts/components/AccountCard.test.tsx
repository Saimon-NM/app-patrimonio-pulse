import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AccountCard from './AccountCard';

describe('features/accounts AccountCard', () => {
  it('does not emit balance/rate update when numeric input is temporarily empty', () => {
    const onAccountChange = vi.fn();
    render(
      <AccountCard
        providerId="p1"
        account={{
          id: 'a1',
          name: 'Cuenta',
          desc: 'Desc',
          balance: 1000,
          rate: 8,
          monthly: 6.67,
          checklist: [],
          notes: '',
        }}
        onAccountChange={onAccountChange}
        highlightColor="#22c55e"
        etfYieldRate={10}
      />
    );

    fireEvent.change(screen.getByLabelText('Cuenta saldo'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Cuenta tasa anual'), { target: { value: '' } });

    expect(onAccountChange).not.toHaveBeenCalled();
  });
});
