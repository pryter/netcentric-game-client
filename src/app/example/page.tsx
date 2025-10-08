"use client"
import {useFrameController} from "@/hooks/useFrameController";

import {useGameController} from "@/hooks/useGameController";
import {useConnection} from "@/hooks/useConnection";

const Page = () => {

  const {useGuard} = useConnection()

  useGuard("/")
  // try using these two hooks to get frame, status and send action to the server
  //  Sadly, it cannot be tested yet due to the game server is not ready
  const {sendAction} = useGameController()
  const {currentFrame} = useFrameController()

  const start = async () => {
    // send action can be await for its response
    // visit the api docs to see what how action will be responded.
    // note: some actions will not have responses and it will be shown as action timeout
    const r = await sendAction("start-example", {})
    console.log("response", r)
  }

  return <div>
    <button className="rounded-lg px-2 py-1 border" onClick={start}>start</button>
    {currentFrame?.tick}
  </div>
}

export default Page