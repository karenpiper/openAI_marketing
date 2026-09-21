"use client";
import { createContext, useContext, useState } from "react";
export type SaveResult = { ok: boolean; message: string };
export const SaveContext = createContext<{
  save: () => SaveResult;
  revision: unknown;
  error: string;
} | null>(null);
export default function SaveFooter() {
  const context = useContext(SaveContext);
  const [saved, setSaved] = useState<{
    revision: unknown;
    result: SaveResult;
  } | null>(null);
  if (!context) return null;
  const current = saved?.revision === context.revision;
  return (
    <div className="save-footer">
      <button
        type="button"
        onClick={() =>
          setSaved({ revision: context.revision, result: context.save() })
        }
      >
        Save
      </button>
      <span role="status" aria-live="polite">
        {context.error
          ? context.error
          : current
            ? saved?.result.message
            : "Autosave is on · saved in this browser"}
      </span>
    </div>
  );
}
