import { useFrameController } from "@/hooks/useFrameController";
import { OriginalRoomFrame } from "@/lib/types";
import { useMemo } from "react";
import classNames from "classnames";

export function Countdown({ isHidden }: { isHidden: boolean }) {
  const { currentFrame } = useFrameController<OriginalRoomFrame>();

  // --- TIMER DISPLAY LOGIC (with decimals) ---
  const formatted = useMemo(() => {
    const t = currentFrame?.breakTimer ?? 0;
    if (t > 4) return "Get ready!";
    if (t > 1) return t.toFixed(2); // shows decimals
    return "Go!";
  }, [currentFrame]);

  return (
    <div
      className={classNames(
        isHidden ? "hidden" : "flex",
        "flex-col items-center justify-center min-h-screen w-full text-center",
        "bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400",
        "animate-[flash_1s_infinite_alternate]"
      )}
    >
      {/* Move header upward slightly */}
      <div className="flex flex-col items-center -mt-16">
        <h1 className="text-5xl font-extrabold text-white tracking-widest drop-shadow-[0_4px_18px_rgba(255,255,255,0.8)]">
          NEXT QUESTION IN
        </h1>

        <p
          className={classNames(
            "mt-8 font-extrabold drop-shadow-[0_4px_12px_rgba(253,224,71,0.9)]",
            formatted === "Go!"
              ? "text-6xl text-green-300 animate-bounce"
              : "text-5xl text-yellow-300 animate-pulse"
          )}
        >
          {formatted}
        </p>

      </div>

      {/* Flash animation definition */}
      <style jsx>{`
        @keyframes flash {
          0% {
            background-position: 0% 50%;
            filter: brightness(1);
          }
          100% {
            background-position: 100% 50%;
            filter: brightness(1.4);
          }
        }
      `}</style>
    </div>
  );
}
