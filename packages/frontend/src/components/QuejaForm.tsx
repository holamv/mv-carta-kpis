'use client';

import { useState } from 'react';
import {
  TIPOS_QUEJA,
  ETIQUETAS_TIPO,
  crearQuejaSchema,
  type CrearQuejaInput,
} from '@mv-quejas/shared';
import { quejasApi, ApiClientError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type Errores = Partial<Record<keyof CrearQuejaInput, string>>;

const inicial: CrearQuejaInput = {
  nombre: '',
  email: '',
  telefono: '',
  tipo: 'producto',
  pedidoId: '',
  mensaje: '',
};

export function QuejaForm() {
  const [form, setForm] = useState<CrearQuejaInput>(inicial);
  const [errores, setErrores] = useState<Errores>({});
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState(false);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  function actualizar<K extends keyof CrearQuejaInput>(
    campo: K,
    valor: CrearQuejaInput[K],
  ) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorGeneral(null);

    const parsed = crearQuejaSchema.safeParse(form);
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      const next: Errores = {};
      for (const key of Object.keys(flat) as (keyof CrearQuejaInput)[]) {
        next[key] = flat[key]?.[0];
      }
      setErrores(next);
      return;
    }

    setErrores({});
    setEnviando(true);
    try {
      await quejasApi.crear(parsed.data);
      setExito(true);
      setForm(inicial);
    } catch (err) {
      setErrorGeneral(
        err instanceof ApiClientError
          ? err.message
          : 'No pudimos enviar tu queja. Intenta de nuevo.',
      );
    } finally {
      setEnviando(false);
    }
  }

  if (exito) {
    return (
      <Card className="text-center">
        <h2 className="font-heading text-xl font-bold text-mv-green-dark">
          ¡Recibimos tu queja!
        </h2>
        <p className="mt-2 text-mv-gray-600">
          Gracias por contarnos. Nuestro equipo la revisara pronto.
        </p>
        <Button
          variant="secondary"
          className="mt-6"
          onClick={() => setExito(false)}
        >
          Enviar otra queja
        </Button>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Campo
          label="Nombre"
          id="nombre"
          value={form.nombre}
          onChange={(v) => actualizar('nombre', v)}
          error={errores.nombre}
          required
        />
        <Campo
          label="Email"
          id="email"
          type="email"
          value={form.email}
          onChange={(v) => actualizar('email', v)}
          error={errores.email}
          required
        />
        <Campo
          label="Telefono (opcional)"
          id="telefono"
          value={form.telefono ?? ''}
          onChange={(v) => actualizar('telefono', v)}
          error={errores.telefono}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="tipo" className="text-sm font-semibold text-mv-gray-700">
            Tipo de queja <span className="text-mv-error">*</span>
          </label>
          <select
            id="tipo"
            value={form.tipo}
            onChange={(e) =>
              actualizar('tipo', e.target.value as CrearQuejaInput['tipo'])
            }
            className="rounded-lg border border-mv-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {TIPOS_QUEJA.map((t) => (
              <option key={t} value={t}>
                {ETIQUETAS_TIPO[t]}
              </option>
            ))}
          </select>
        </div>

        <Campo
          label="Numero de pedido (opcional)"
          id="pedidoId"
          value={form.pedidoId ?? ''}
          onChange={(v) => actualizar('pedidoId', v)}
          error={errores.pedidoId}
        />

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="mensaje"
            className="text-sm font-semibold text-mv-gray-700"
          >
            Mensaje <span className="text-mv-error">*</span>
          </label>
          <textarea
            id="mensaje"
            value={form.mensaje}
            onChange={(e) => actualizar('mensaje', e.target.value)}
            rows={5}
            maxLength={2000}
            className="rounded-lg border border-mv-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Cuentanos que paso..."
          />
          {errores.mensaje && (
            <p className="text-xs text-mv-error">{errores.mensaje}</p>
          )}
        </div>

        {errorGeneral && (
          <p
            role="alert"
            className="rounded-lg bg-mv-orange-50 px-3 py-2 text-sm text-mv-orange"
          >
            {errorGeneral}
          </p>
        )}

        <Button type="submit" disabled={enviando} className="mt-2">
          {enviando ? 'Enviando...' : 'Enviar queja'}
        </Button>
      </form>
    </Card>
  );
}

interface CampoProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
}

function Campo({
  label,
  id,
  value,
  onChange,
  error,
  type = 'text',
  required,
}: CampoProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-mv-gray-700">
        {label} {required && <span className="text-mv-error">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-mv-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      {error && <p className="text-xs text-mv-error">{error}</p>}
    </div>
  );
}
