import { QuejaForm } from '@/components/QuejaForm';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-8 px-4 py-12">
      <header className="text-center">
        <h1 className="font-heading text-3xl font-bold text-mv-green-dark">
          Quejas y Reclamos
        </h1>
        <p className="mt-2 text-mv-gray-600">
          En Manzana Verde queremos mejorar. Cuentanos que paso y te
          responderemos pronto.
        </p>
      </header>

      <QuejaForm />

      <footer className="text-center text-xs text-mv-gray-400">
        Manzana Verde &middot; Tu queja nos ayuda a crecer
      </footer>
    </main>
  );
}
