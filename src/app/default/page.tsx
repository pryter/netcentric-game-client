"use client"
import {useFrameController} from "@/hooks/useFrameController";

import {useGameController} from "@/hooks/useGameController";
import {OriginalRoomFrame} from "@/lib/types";
import {useEffect, useState} from "react";
import Image from "next/image";
import {useConnection} from "@/hooks/useConnection";

const Page = () => {

  const {useGuard} = useConnection()

  useGuard("/")
  const {sendAction} = useGameController()
  const {currentFrame} = useFrameController<OriginalRoomFrame>()

  const [myRoomId, setMyRoomID] = useState("")
  const [jid, setJid] = useState("")

  return <div>
    <button onClick={() => {
      sendAction("create-og-game", {}).then((r) => {
        if (r)
        setMyRoomID(r.getData().roomId)
      })
    }}>Create room</button>
    <h2>{myRoomId}</h2>
    <input value={jid} onChange={(e) => setJid(e.target.value)} className="border"/>
    <button onClick={() => {
      sendAction("join-og-game", {roomId: jid}).then((r) => {
        console.log(r)
      })
    }}>Join</button>

    <br/>

    <button className="py-1 px-2 border rounded-lg" onClick={() => {
      sendAction("ready", true).then((r) => {
        console.log(r)
      })
    }}>Ready</button>

    <div className="flex space-x-2">
      {Object.values(currentFrame?.players ?? {}).map((v) => {
        return <div className="flex items-center flex-col" key={v.id}>
          <Image src={v.avatarUri} alt={"profile"} width={"60"} height={"60"} className="size-16 bg-yellow-500 p-1 rounded-full"/>
          <h1>{v.displayName}</h1>
          <p className="text-xs font-medium text-gray-600">{v.isDisconnected ? "disconnected" : !v.isReady ? "waiting" : "ready"}</p>
        </div>
      })}
    </div>
    <div>
      {Object.entries(currentFrame ?? {}).map(([key, value]) => {
        if (key === "players") {
          return <div className="flex flex-col space-x-2" key={key}>
            <h2 className="font-semibold">{key}</h2>
            <pre className="bg-gray-100 w-[300px] overflow-auto text-xs p-2 rounded-lg">{JSON.stringify(value, null, 2)}</pre>
          </div>
        }
        return <div className="flex items-center space-x-2" key={key}>
          <h2 className="font-semibold">{key}:</h2>
          <pre>{JSON.stringify(value, null, 2)}</pre>
        </div>
      })}
    </div>
  </div>
}

export default Page