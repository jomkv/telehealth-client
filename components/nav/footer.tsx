export function Footer() {
  return (
    <footer className="mt-24 bg-[#141413] px-6 py-16 text-white sm:px-12 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="max-w-2xl text-3xl sm:text-4xl text-white">
          Care that meets you where you are.
        </h2>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-white/60">
          <span>© {new Date().getFullYear()} Medra</span>
          <span>v0.1 · prototype</span>
        </div>
      </div>
    </footer>
  );
}
