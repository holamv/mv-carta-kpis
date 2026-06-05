import type { ApiResponse, CrearQuejaInput, Queja } from '@mv-quejas/shared';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

class ApiClientError extends Error {
  constructor(
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const body = (await res.json()) as ApiResponse<T>;

  if (!res.ok || !body.success) {
    const message = body.success
      ? 'Error desconocido'
      : body.error.message;
    const details = body.success ? undefined : body.error.details;
    throw new ApiClientError(message, details);
  }

  return body.data;
}

export const quejasApi = {
  crear: (input: CrearQuejaInput) =>
    request<Queja>('/quejas', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  listar: () => request<Queja[]>('/quejas'),

  obtener: (id: number) => request<Queja>(`/quejas/${id}`),
};

export { ApiClientError };
