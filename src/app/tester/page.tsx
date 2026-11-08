"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSocketStore, type ConnectionStatus } from "@/stores/socket-store";

const statusColor: Record<ConnectionStatus, string> = {
  connected: "bg-emerald-500",
  connecting: "bg-amber-500",
  disconnected: "bg-zinc-400",
  error: "bg-red-500",
};

// TanStack Query example: hits the Engine.IO handshake endpoint over HTTP
// to check whether a Socket.IO server is reachable at the given URL.
async function pingServer(url: string) {
  const started = performance.now();
  const res = await fetch(`${url.replace(/\/$/, "")}/socket.io/?EIO=4&transport=polling`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return { ms: Math.round(performance.now() - started), body: text.slice(0, 200) };
}

export default function Home() {
  const { url, status, socketId, error, logs, setUrl, connect, disconnect, emit, clearLogs } =
    useSocketStore();
  const [event, setEvent] = useState("message");
  const [payload, setPayload] = useState('{ "text": "hello" }');

  const ping = useQuery({
    queryKey: ["socket-ping", url],
    queryFn: () => pingServer(url),
    enabled: false,
  });

  const handleEmit = () => {
    const raw = payload.trim();
    if (!raw) return emit(event);
    try {
      emit(event, JSON.parse(raw));
    } catch {
      emit(event, raw); // not JSON: send as plain string
    }
  };

  const connected = status === "connected";

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Socket.IO Tester</h1>
        <p className="text-sm text-zinc-500">
          Next.js · TypeScript · Zustand · Socket.IO client · TanStack Query · Tailwind
        </p>
      </header>

      {/* Connection */}
      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-sm">
          <span className={`h-2.5 w-2.5 rounded-full ${statusColor[status]}`} />
          <span className="font-medium capitalize">{status}</span>
          {socketId && <span className="font-mono text-zinc-500">id: {socketId}</span>}
          {error && <span className="text-red-500">— {error}</span>}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="flex-1 rounded border border-zinc-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-zinc-700"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={status === "connected" || status === "connecting"}
            placeholder="http://localhost:3001"
          />
          {connected || status === "connecting" ? (
            <button className="rounded bg-zinc-800 px-4 py-2 text-sm text-white" onClick={disconnect}>
              Disconnect
            </button>
          ) : (
            <button className="rounded bg-emerald-600 px-4 py-2 text-sm text-white" onClick={connect}>
              Connect
            </button>
          )}
          <button
            className="rounded border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
            onClick={() => ping.refetch()}
          >
            {ping.isFetching ? "Pinging…" : "HTTP ping"}
          </button>
        </div>
        {(ping.data || ping.error) && (
          <p className="font-mono text-xs text-zinc-500">
            {ping.error ? `ping failed: ${ping.error.message}` : `ping ${ping.data?.ms}ms → ${ping.data?.body}`}
          </p>
        )}
      </section>

      {/* Emit */}
      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h2 className="font-medium">Emit event</h2>
        <input
          className="w-full rounded border border-zinc-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-zinc-700"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder="event name"
        />
        <textarea
          className="h-24 w-full rounded border border-zinc-300 bg-transparent px-3 py-2 font-mono text-sm dark:border-zinc-700"
          value={payload}
          onChange={(e) => setPayload(e.target.value)}
          placeholder="JSON payload (or plain text, or empty)"
        />
        <button
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-40"
          onClick={handleEmit}
          disabled={!connected || !event}
        >
          Emit
        </button>
        {!connected && (
          <p className="text-xs text-amber-600">
            Klik <b>Connect</b> di atas dulu — Emit aktif setelah status &quot;connected&quot;.
          </p>
        )}
      </section>

      {/* Logs */}
      <section className="space-y-3 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Event log ({logs.length})</h2>
          <button className="text-xs text-zinc-500 hover:underline" onClick={clearLogs}>
            clear
          </button>
        </div>
        <ul className="max-h-96 space-y-1 overflow-auto font-mono text-xs">
          {logs.length === 0 && <li className="text-zinc-400">No events yet.</li>}
          {logs.map((l) => (
            <li key={l.id} className="flex gap-2 border-b border-zinc-100 py-1 dark:border-zinc-900">
              <span className="text-zinc-400">{new Date(l.at).toLocaleTimeString()}</span>
              <span
                className={
                  l.direction === "in"
                    ? "text-emerald-600"
                    : l.direction === "out"
                      ? "text-blue-600"
                      : "text-zinc-500"
                }
              >
                {l.direction === "in" ? "←" : l.direction === "out" ? "→" : "•"} {l.event}
              </span>
              {l.payload !== undefined && (
                <span className="break-all text-zinc-700 dark:text-zinc-300">
                  {JSON.stringify(l.payload)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
