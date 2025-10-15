"use client"
import {useFrameController} from "@/hooks/useFrameController";

import {useGameController} from "@/hooks/useGameController";
import {OriginalRoomFrame} from "@/lib/types";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useConnection} from "@/hooks/useConnection";
import {GameBoard} from "@/components/GameBoard";
import {WaitingRoom} from "@/components/WaitingRoom";
import {useParams, useSearchParams} from "next/navigation";
import {Countdown} from "@/components/Countdown";
import {Scoreboard} from "@/components/Scoreboard";

// ui done
const Page = () => {

  const searchParams = useSearchParams()
  const {currentFrame} = useFrameController<OriginalRoomFrame>()

  if (!currentFrame){
    return    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="">
      <h1>Room Not found</h1>
    </div>
  }

  return (
    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="">
      {currentFrame?.state === "lobby-countdown" || currentFrame?.state === "next-round-countdown" && <Countdown/>}
      {currentFrame?.state === "waiting" && <WaitingRoom roomId={searchParams.get("code") as string}/>}
      {currentFrame?.state === "running" && <GameBoard/>}
      {currentFrame?.state === "resolved" && <Scoreboard/>}
    </div>
  )
}

export default Page
