/** Every page is written on the same notebook sheet; content stays in a phone-to-tablet column. */
export default function GameLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="paper flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center py-6 pr-4 pl-10 sm:py-10 sm:pr-8 sm:pl-20">
        {children}
      </div>
    </main>
  );
}
