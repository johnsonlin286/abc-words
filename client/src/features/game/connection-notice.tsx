"use client";

import { useEffect, useState } from "react";
import { notice } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";

/** A normal, quick reconnect doesn't flash the notice. */
const SHOW_AFTER_MS = 800;

/**
 * Says the game server isn't reachable, right in the room (same as the app). On phones the chat
 * (where this used to show) is a closed sheet, so a dropped connection went unnoticed.
 */
export default function ConnectionNotice() {
  const offline = useRoomStore((s) => s.connection === "reconnecting" || s.connection === "connecting");
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!offline) return;
    const timer = setTimeout(() => setShown(true), SHOW_AFTER_MS);
    return () => {
      clearTimeout(timer);
      setShown(false);
    };
  }, [offline]);

  if (!offline || !shown) return null;
  return (
    <p role="status" className={notice}>
      Menghubungkan ulang ke server…
    </p>
  );
}
