export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 bg-zinc-50 p-4 sm:p-6 dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center">{children}</div>
    </main>
  );
}
