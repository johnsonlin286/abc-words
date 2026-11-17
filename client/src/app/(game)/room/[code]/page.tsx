import { Suspense } from "react";
import ConnectingNotice from "@/components/connecting-notice";
import { SignedOutInvite } from "@/components/room-invite";
import RoomRoute from "@/components/room-route";
import SessionGate from "@/components/session-gate";

export default function RoomPage() {
  // Room codes are only known at request time, so reading them needs a Suspense boundary.
  return (
    <SessionGate
      signedOut={
        <Suspense fallback={<ConnectingNotice />}>
          <SignedOutInvite />
        </Suspense>
      }
    >
      <Suspense fallback={<ConnectingNotice />}>
        <RoomRoute />
      </Suspense>
    </SessionGate>
  );
}
