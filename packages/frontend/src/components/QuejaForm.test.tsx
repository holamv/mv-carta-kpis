import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuejaForm } from './QuejaForm';

vi.mock('@/lib/api', () => ({
  ApiClientError: class extends Error {},
  quejasApi: { crear: vi.fn().mockResolvedValue({ id: 1 }) },
}));

import { quejasApi } from '@/lib/api';

describe('QuejaForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra errores de validacion cuando el formulario esta vacio', async () => {
    const user = userEvent.setup();
    render(<QuejaForm />);

    await user.click(screen.getByRole('button', { name: /enviar queja/i }));

    expect(
      await screen.findByText(/al menos 2 caracteres/i),
    ).toBeInTheDocument();
    expect(quejasApi.crear).not.toHaveBeenCalled();
  });

  it('envia la queja cuando los datos son validos', async () => {
    const user = userEvent.setup();
    render(<QuejaForm />);

    await user.type(screen.getByLabelText(/nombre/i), 'Ana Perez');
    await user.type(screen.getByLabelText(/^email/i), 'ana@example.com');
    await user.type(
      screen.getByLabelText(/mensaje/i),
      'Mi pedido llego tarde y frio.',
    );
    await user.click(screen.getByRole('button', { name: /enviar queja/i }));

    expect(
      await screen.findByText(/recibimos tu queja/i),
    ).toBeInTheDocument();
    expect(quejasApi.crear).toHaveBeenCalledOnce();
  });
});
