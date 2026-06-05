import { describe, it, expect } from 'vitest';
import { crearQuejaSchema } from '@mv-quejas/shared';

describe('crearQuejaSchema', () => {
  const valido = {
    nombre: 'Ana Perez',
    email: 'ana@example.com',
    tipo: 'entrega' as const,
    mensaje: 'Mi pedido llego tarde y frio.',
  };

  it('acepta una queja valida', () => {
    const result = crearQuejaSchema.safeParse(valido);
    expect(result.success).toBe(true);
  });

  it('rechaza email invalido', () => {
    const result = crearQuejaSchema.safeParse({ ...valido, email: 'no-email' });
    expect(result.success).toBe(false);
  });

  it('rechaza mensaje demasiado corto', () => {
    const result = crearQuejaSchema.safeParse({ ...valido, mensaje: 'corto' });
    expect(result.success).toBe(false);
  });

  it('rechaza tipo no permitido', () => {
    const result = crearQuejaSchema.safeParse({ ...valido, tipo: 'invalido' });
    expect(result.success).toBe(false);
  });

  it('permite telefono y pedidoId vacios', () => {
    const result = crearQuejaSchema.safeParse({
      ...valido,
      telefono: '',
      pedidoId: '',
    });
    expect(result.success).toBe(true);
  });
});
