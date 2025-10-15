"use client";
import { useEffect } from "react";

type Screen = "Waiting" | "Countdown" | "Running" | "Resolved";

export default function PreviewBar({
  value,
  onChange,
}: {
  value: Screen | null;
  onChange: (s: Screen | null) => void;
}) {
  // Hotkeys: 1/2/3/4 and 0 to clear
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "1") onChange("Waiting");
      if (e.key === "2") onChange("Countdown");
      if (e.key === "3") onChange("Running");
      if (e.key === "4") onChange("Resolved");
      if (e.key === "0") onChange(null); // follow real frame.state again
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onChange]);

  return (
    <div className="fixed top-4 right-4 z-[100] rounded-xl border border-cyan-400/30 bg-slate-900/70 backdrop-blur px-2 py-2 shadow">
      <div className="text-[10px] mb-1 text-cyan-300/80 font-semibold">
        preview (1-4, 0=auto)
      </div>
      <div className="flex gap-1">
        {(["Waiting","Countdown","Running","Resolved"] as Screen[]).map(s => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-2 py-1 rounded text-xs border ${
              value === s ? "bg-primary text-primary-foreground" : "border-cyan-500/40 text-cyan-200"
            }`}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => onChange(null)}
          className="px-2 py-1 rounded text-xs border border-slate-500/40 text-slate-200"
          title="Follow server state"
        >
          Auto
        </button>
      </div>
    </div>
  );
}
