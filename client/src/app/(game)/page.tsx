import LobbyRoute from "@/components/lobby-route";
import SessionGate from "@/components/session-gate";

export default function HomePage() {
  return (
    <SessionGate>
      <LobbyRoute />
    </SessionGate>
  );
}
