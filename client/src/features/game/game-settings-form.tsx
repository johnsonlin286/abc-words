"use client";

import { useState } from "react";
import {
  CATEGORIES,
  CUSTOM_CATEGORY_MAX,
  LANGUAGES,
  MAX_ROUNDS,
  type GameSettings,
} from "@/shared/game";
import { useRoomStore } from "@/stores/room-store";
import { chalkFont } from "./fonts";

const optionClass = (selected: boolean) =>
  `cursor-pointer rounded-full border px-3 py-1 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-chalk-yellow ${
    selected
      ? "border-chalk-yellow bg-chalk-yellow font-medium text-board-deep"
      : "border-chalk-dim/50 text-chalk group-enabled:hover:border-chalk"
  } group-disabled:cursor-default`;

const stepperClass =
  "h-8 w-8 rounded-full border border-chalk-dim/50 text-lg leading-none text-chalk hover:border-chalk disabled:opacity-30 disabled:hover:border-chalk-dim/50";

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
      className="mt-2 w-full rounded-md border border-chalk-dim/50 bg-board-deep px-3 py-1.5 text-sm text-chalk placeholder:text-chalk-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk-yellow"
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
      <h2 id="settings-heading" className={`${chalkFont.className} text-2xl text-chalk`}>
        Aturan main
      </h2>
      {!isHost && <p className="text-xs text-chalk-dim">Host yang mengatur bagian ini.</p>}

      <div className="mt-2 space-y-4">
        <fieldset disabled={!isHost} className="group">
          <legend className="mb-1.5 text-sm text-chalk-dim">Kategori</legend>
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
          <fieldset disabled={!isHost} className="group">
            <legend className="mb-1.5 text-sm text-chalk-dim">Bahasa jawaban</legend>
            <div className="flex gap-2">
              {LANGUAGES.map((l) => (
                <label key={l.id} className={optionClass(settings.language === l.id)}>
                  <input
                    type="radio"
                    name="language"
                    className="sr-only"
                    checked={settings.language === l.id}
                    onChange={() => save({ language: l.id })}
                  />
                  {l.label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset disabled={!isHost}>
            <legend className="mb-1.5 text-sm text-chalk-dim">Jumlah ronde</legend>
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
              <output className="w-6 text-center text-xl font-medium text-chalk tabular-nums">
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

        {error && <p className="text-sm text-chalk-yellow">{error}</p>}
      </div>
    </section>
  );
}
