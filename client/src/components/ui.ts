/**
 * Shared class names for the "buku tulis" look. Kept as strings (not components) so forms can
 * mix them with layout utilities freely.
 */

const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen";

/** The one main action on a card: a highlighter stroke with a pen outline. */
export const buttonPrimary = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-highlight px-5 py-2.5 text-base font-semibold text-ink shadow-[3px_3px_0_var(--color-ink)] transition-[transform,box-shadow] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_var(--color-ink)] disabled:cursor-not-allowed disabled:border-ink-faint disabled:bg-paper disabled:text-ink-faint disabled:shadow-none ${focus}`;

/** Secondary actions: plain card stock. */
export const buttonSecondary = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-5 py-2.5 text-base font-semibold text-ink hover:bg-highlight-soft disabled:cursor-not-allowed disabled:border-ink-faint disabled:text-ink-faint ${focus}`;

/** Text-only links and small actions. */
export const linkButton = `font-semibold text-ink underline decoration-2 decoration-highlight underline-offset-4 hover:decoration-ink ${focus} rounded-sm`;

/** Text fields: white, pen outline, red when invalid. */
export const input = `w-full rounded-xl border-2 border-ink bg-white px-3.5 py-2.5 text-base font-medium text-ink placeholder:font-normal placeholder:text-ink-faint aria-invalid:border-redpen focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-highlight`;

export const label = "block text-sm font-semibold text-ink";

export const hint = "block text-sm font-normal text-ink-soft";

/** Inline error in the teacher's red pen. */
export const errorText = "text-sm font-semibold text-redpen";

/** A short message pinned to a card (room closed, reconnecting, ...). */
export const notice = "rounded-xl border-2 border-dashed border-ink-soft bg-highlight-soft px-3.5 py-2.5 text-sm font-medium text-ink";

/** A quiet action next to a primary one: no card, just ink on the paper. */
export const buttonGhost = `inline-flex items-center justify-center gap-2 rounded-xl border-2 border-transparent px-4 py-2.5 text-base font-semibold text-ink hover:border-ink hover:bg-white ${focus}`;
