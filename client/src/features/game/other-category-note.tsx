import { categoryName } from "@/shared/game";

/**
 * An answer from another category's word list ("Jepang" in Hewan): failed by the word lists, not by
 * a vote, so it says which list it came from in the teacher's red pen.
 */
export default function OtherCategoryNote({ category }: { category: string }) {
  return <span className="block font-hand text-base leading-snug text-redpen">Bukan kategori ({categoryName(category)})</span>;
}
