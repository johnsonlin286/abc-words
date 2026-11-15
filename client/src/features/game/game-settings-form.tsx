"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CUSTOM_CATEGORY_MAX,
  MAX_ROUNDS,
  type GameSettings,
} from "@/shared/game";
import { errorText, hint, input } from "@/components/ui";
import { useRoomStore } from "@/stores/room-store";

const optionClass = (selected: boolean) =>
  `cursor-pointer rounded-full border-2 px-3.5 py-1 text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-redpen ${
    selected
      ? "border-ink bg-highlight text-ink"
      : "border-ink/30 bg-white text-ink-soft group-enabled:hover:border-ink group-enabled:hover:text-ink"
  } group-disabled:cursor-default`;

const stepperClass =
  "grid size-9 place-items-center rounded-full border-2 border-ink bg-white text-xl leading-none font-bold text-ink hover:bg-highlight-soft focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-redpen disabled:border-ink/25 disabled:text-ink-faint disabled:hover:bg-white";

function CustomCategoryInput({
  value,
  editable,
  onCommit,
}: {
  value: string;
  editable: boolean;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  return (
    <input
      aria-label="Nama kategori"
      className={`${input} mt-3 read-only:bg-paper`}
      value={editable ? draft : value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => draft !== value && onCommit(draft)}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      maxLength={CUSTOM_CATEGORY_MAX}
      placeholder={editable ? "Mis. nama jajanan" : "Host belum menulis kategori"}
      readOnly={!editable}
    />
  );
}

export default function GameSettingsForm({ settings, isHost }: { settings: GameSettings; isHost: boolean }) {
  const updateSettings = useRoomStore((s) => s.updateSettings);
  const [error, setError] = useState<string | null>(null);

  const save = async (patch: Partial<GameSettings>) => {
    setError(await updateSettings(patch));
  };

  return (
    <section aria-labelledby="settings-heading">
      <h2 id="settings-heading" className="text-xl font-bold">
        Aturan main
      </h2>
      {!isHost && <p className={hint}>Host yang mengatur bagian ini.</p>}

      <div className="mt-3 space-y-5">
        <fieldset disabled={!isHost} className="group">
          <legend className="mb-2 text-sm font-semibold">Kategori</legend>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <label key={c.id} className={optionClass(settings.category === c.id)}>
                <input
                  type="radio"
                  name="category"
                  className="sr-only"
                  checked={settings.category === c.id}
                  onChange={() => save({ category: c.id })}
                />
                {c.label}
              </label>
            ))}
          </div>
          {settings.category === "custom" && (
            <CustomCategoryInput
              key={String(isHost)}
              value={settings.customCategory}
              editable={isHost}
              onCommit={(customCategory) => save({ customCategory })}
            />
          )}
        </fieldset>

        <div className="flex flex-wrap gap-x-8 gap-y-4">
          <fieldset disabled={!isHost}>
            <legend className="mb-2 text-sm font-semibold">Jumlah ronde</legend>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Kurangi ronde"
                className={stepperClass}
                disabled={settings.maxRounds <= 1}
                onClick={() => save({ maxRounds: settings.maxRounds - 1 })}
              >
                −
              </button>
              <output className="w-8 text-center text-2xl font-bold tabular-nums">
                {settings.maxRounds}
              </output>
              <button
                type="button"
                aria-label="Tambah ronde"
                className={stepperClass}
                disabled={settings.maxRounds >= MAX_ROUNDS}
                onClick={() => save({ maxRounds: settings.maxRounds + 1 })}
              >
                +
              </button>
            </div>
          </fieldset>
        </div>

        {error && <p className={errorText}>{error}</p>}
      </div>
    </section>
  );
}
