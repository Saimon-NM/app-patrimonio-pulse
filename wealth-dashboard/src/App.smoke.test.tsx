import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App smoke flow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.spyOn(window, 'prompt').mockReturnValue('Escenario smoke');
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  it('runs critical financial flow without regressions', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /guardar escenario/i }));
    expect(await screen.findByText(/escenario "escenario smoke" guardado/i)).toBeInTheDocument();

    const amountInput = screen.getByLabelText(/monto a agregar/i);
    fireEvent.change(amountInput, { target: { value: '5000' } });
    fireEvent.click(screen.getByRole('button', { name: /sumar a la posición/i }));
    expect(await screen.findByText(/saldo actualizado/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /registrar snapshot/i }));
    expect(await screen.findByText(/snapshot registrado/i)).toBeInTheDocument();

    expect(screen.getByText(/recomendaciones/i)).toBeInTheDocument();
  });
});
