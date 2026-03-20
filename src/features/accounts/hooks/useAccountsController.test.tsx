import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { useAccountsController } from './useAccountsController';
import type { Provider } from '@/features/accounts/model/provider.types';

describe('useAccountsController', () => {
  it('sanitizes values and updates derived monthly gain', () => {
    const providers: Provider[] = [
      {
        id: 'p1',
        name: 'Provider',
        average: 0,
        total: '$0 MXN',
        accent: '#000',
        accentLabel: '#000',
        accounts: [
          {
            id: 'a1',
            name: 'Account',
            desc: '',
            balance: 1000,
            rate: 12,
            monthly: 0,
            checklist: [],
            notes: '',
          },
        ],
      },
    ];

    const updateAccount = vi.fn();
    const updateProvider = vi.fn();
    const addAccount = vi.fn();
    const removeAccount = vi.fn();
    const removeProvider = vi.fn();
    const addProvider = vi.fn();

    let controller: ReturnType<typeof useAccountsController> | null = null;
    const Test = () => {
      controller = useAccountsController({
        providers,
        updateAccount,
        updateProvider,
        addAccount,
        removeAccount,
        removeProvider,
        addProvider,
        defaultAnnualRate: 8,
      });
      return null;
    };

    render(<Test />);
    expect(controller).not.toBeNull();

    controller!.onAccountChange('p1', 'a1', 'balance', 2000);
    expect(updateAccount).toHaveBeenCalledTimes(1);
    expect(updateAccount).toHaveBeenCalledWith('p1', 'a1', expect.objectContaining({ balance: 2000, monthly: 20 }));

    updateAccount.mockClear();
    controller!.onAccountChange('p1', 'a1', 'rate', 6);
    expect(updateAccount).toHaveBeenCalledWith('p1', 'a1', expect.objectContaining({ rate: 6, monthly: 5 }));
  });

  it('confirms destructive actions', () => {
    const providers: Provider[] = [];
    const updateAccount = vi.fn();
    const updateProvider = vi.fn();
    const addAccount = vi.fn();
    const removeAccount = vi.fn();
    const removeProvider = vi.fn();
    const addProvider = vi.fn();

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    let controller: ReturnType<typeof useAccountsController> | null = null;
    const Test = () => {
      controller = useAccountsController({
        providers,
        updateAccount,
        updateProvider,
        addAccount,
        removeAccount,
        removeProvider,
        addProvider,
        defaultAnnualRate: 8,
      });
      return null;
    };

    render(<Test />);
    controller!.confirmAndRemoveAccount('p1', 'a1');
    controller!.confirmAndRemoveProvider('p1');

    expect(removeAccount).toHaveBeenCalledWith('p1', 'a1');
    expect(removeProvider).toHaveBeenCalledWith('p1');

    confirmSpy.mockRestore();
  });
});

