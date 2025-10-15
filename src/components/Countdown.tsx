import {useFrameController} from "@/hooks/useFrameController";
import {OriginalRoomFrame} from "@/lib/types";

export function Countdown() {

  const {currentFrame} = useFrameController<OriginalRoomFrame>()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-b from-cyan-400 to-emerald-400">
      <h1 className="text-6xl font-bold text-yellow-300 drop-shadow-[0_4px_20px_rgba(253,224,71,0.8)]">Countdown</h1>
      <p className="text-2xl text-white font-semibold mt-4 drop-shadow-lg">{Math.round(currentFrame?.breakTimer ?? 0)}</p>
    </div>
  )
}



  