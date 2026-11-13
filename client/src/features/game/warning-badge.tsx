import { LONE_REJECTION_WARNINGS, POINTS, formatPoints } from "@/shared/game";
import InfoBadge from "./info-badge";

/** Lone rejections counted on the badge: 2/3 is the warning, 3/3 means points are being taken. */
export const LONE_REJECTION_LIMIT = LONE_REJECTION_WARNINGS + 1;

/** "2/3" or "3/3"; stays at 3/3 after more lone rejections. */
export function strikeLabel(count: number): string {
  return `${Math.min(count, LONE_REJECTION_LIMIT)}/${LONE_REJECTION_LIMIT}`;
}

/** The warning triangle (public/icons/warning.svg), the same on every device. */
export function WarningIcon({ className = "" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- tiny static icon; next/image adds nothing here
  return <img src="/icons/warning.svg" alt="" aria-hidden width={14} height={14} className={`inline-block ${className}`} />;
}

/** Explanation for a player's warning, about someone else (`name`) or the viewer (`null`). */
export function warningText(count: number, name: string | null): string {
  const who = name ?? "Kamu";
  const penalty = `${formatPoints(POINTS.loneRejection)} poin`;
  if (count <= LONE_REJECTION_WARNINGS) {
    return `${who} sudah ${count}× menolak sendirian jawaban yang tetap lolos. Sekali lagi dianggap sengaja: ${penalty}.`;
  }
  return `${who} sudah ${count}× menolak sendirian jawaban yang tetap lolos, dianggap sengaja. Setiap tolakan sendirian berikutnya ${penalty}.`;
}

/** Warning next to a player who rejected alone at least twice in this game. */
export default function WarningBadge({ count, name }: { count: number; name: string }) {
  if (count < LONE_REJECTION_WARNINGS) return null;
  return (
    <InfoBadge
      label={`Peringatan ${name}: ${strikeLabel(count)}`}
      explanation={warningText(count, name)}
      className="text-chalk-yellow"
    >
      <WarningIcon />
      {strikeLabel(count)}
    </InfoBadge>
  );
}
