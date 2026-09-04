"use client";

export default function KitchenTableError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#fbf5ea] px-6 text-center text-[#2a221b]">
      <section className="max-w-md rounded-[2rem] border border-[#e5d5bf] bg-[#fffdf9] p-8 shadow-sm">
        <p className="text-4xl" aria-hidden="true">🍲</p>
        <h1 className="mt-4 font-serif text-3xl">The table needs a moment.</h1>
        <p className="mt-3 leading-7 text-[#685545]">
          Kitchen Table could not load this page. Your recipes have not been
          changed.
        </p>
        <button type="button" className="primary mt-6" onClick={reset}>
          Try again
        </button>
      </section>
    </main>
  );
}
