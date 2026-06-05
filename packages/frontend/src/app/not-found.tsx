import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-heading text-3xl font-bold text-mv-green-dark">404</h1>
      <p className="text-mv-gray-600">No encontramos la pagina que buscas.</p>
      <Link
        href="/"
        className="font-semibold text-primary hover:text-primary-hover"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
