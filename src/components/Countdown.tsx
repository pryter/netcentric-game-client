import {useFrameController} from "@/hooks/useFrameController";
import {OriginalRoomFrame} from "@/lib/types";
import {JSX, useMemo} from "react";
import classNames from "classnames";

export function Countdown({isHidden}: {isHidden: boolean}) {

  const {currentFrame} = useFrameController<OriginalRoomFrame>()

  const timer = useMemo(() => {
    const tstr = (currentFrame?.breakTimer ?? 0)
    if (tstr > 5) {
      return "Get ready!"
    }
    if (tstr <= 1) {
      return "Go!"
    }
    return tstr.toFixed(2)
  }, [currentFrame])

  return (
    <div className={classNames(isHidden ? "hidden" : "flex" ,"flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-cyan-400 to-emerald-400")}>
      <h1 className="text-6xl font-bold text-yellow-300 drop-shadow-[0_4px_20px_rgba(253,224,71,0.8)]">Countdown</h1>
      <p className="text-2xl text-white font-semibold mt-4 drop-shadow-lg">{timer}</p>
    </div>
  )
}



  