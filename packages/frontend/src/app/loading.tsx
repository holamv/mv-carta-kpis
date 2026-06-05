export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div
        className="h-10 w-10 animate-spin rounded-full border-4 border-mv-gray-200 border-t-primary"
        role="status"
        aria-label="Cargando"
      />
    </main>
  );
}
