"use client"
import {useFrameController} from "@/hooks/useFrameController";

import {useGameController} from "@/hooks/useGameController";

const Page = () => {

  const {sendAction} = useGameController()
  const {currentFrame} = useFrameController()

  return <div>
    <button onClick={() => {
      sendAction("start-sp", {}).then((r) => {
      })
    }}>start</button>
    {currentFrame?.tick}
  </div>
}

export default Page