'use client';

import { Button } from '@/components/ui/Button';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-2xl font-bold text-mv-green-dark">
        Algo salio mal
      </h1>
      <p className="text-mv-gray-600">
        Ocurrio un error inesperado. Intenta de nuevo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  );
}
