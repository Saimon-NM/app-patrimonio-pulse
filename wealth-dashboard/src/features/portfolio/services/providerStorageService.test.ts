import { describe, expect, it, beforeEach } from 'vitest';
import { readProvidersFromStorage } from './providerStorageService';

const STORAGE_KEY = 'patrimonio-providers';

describe('providerStorageService', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('normalizes malformed checklist entries from storage', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        data: [
          {
            id: 'p1',
            name: 'Provider 1',
            accent: '#fff',
            accentLabel: '#fff',
            average: 0,
            total: '$0 MXN',
            accounts: [
              {
                id: 'a1',
                name: 'Cuenta 1',
                desc: '',
                balance: 1000,
                rate: 10,
                monthly: 0,
                checklist: [
                  { id: 'ok', label: 'Vigilar tasa', done: true },
                  { id: 'no-label', done: false },
                  { label: 'sin id', done: false },
                  null,
                ],
              },
            ],
          },
        ],
      })
    );

    const providers = readProvidersFromStorage();
    expect(providers).toHaveLength(1);
    expect(providers[0].accounts[0].checklist).toEqual([{ id: 'ok', label: 'Vigilar tasa', done: true }]);
  });
});
