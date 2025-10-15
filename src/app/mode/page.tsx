"use client"
import {useConnection} from "@/hooks/useConnection";
import {useEffect, useMemo, useState} from "react";
import {useClientAccount} from "@/hooks/useClientAccount";
import {useRouter} from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {Modal} from "@/components/Modal";
import {MsgPayload} from "@/lib/Payload";
import {useGameController} from "@/hooks/useGameController";
import {Input} from "@/components/ui/input";
import {GameButton} from "@/components/Button";

export default function Home() {

  const [state, setState] = useState<boolean>(false)
  const {isAuthenticated, send, serverUser} = useConnection()
  const {sendAction} = useGameController()
  const router = useRouter();
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) return

    if (!serverUser?.nickname) {
      setState(true)
    }else{
      setState(false)
    }
  }, [serverUser]);

  const createRoom = () => {
    sendAction("create-og-game").then((room) => {
      if (room) {
        const jcode = room.getData().joinCode
        if (jcode) {
          router.push(`/default2?code=${jcode}`)
        }
      }
    })
  }

  const joinRoom = () => {
    sendAction("join-og-game", {code: code}).then((res) => {
      if (res?.getStatus() === 0) {
        router.push(`/default2?code=${code}`)
      }
    })
  }

  return (
    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="flex flex-col items-end h-screen relative w-full">
      <div className="h-[40vh] w-full flex flex-col items-center justify-center">
        <h1 className="text-[80px] font-black text-white text-shadow-lg text-shadow-yellow-600">Select mode</h1>
        <div className="flex space-x-2">
          <input value={code} onChange={(e) => {setCode(e.target.value.toUpperCase())}} placeholder={"# Code"} className="w-[140px] py-1 text-xl font-semibold text-white px-4 border-2 rounded-xl"/>
          <GameButton onClick={joinRoom}>
            Join
          </GameButton>
        </div>
        <div className="mt-16">
        <GameButton onClick={createRoom}>
         Create Default Room
        </GameButton>
          <GameButton color="red">
            test
          </GameButton>
        </div>
      </div>
    </div>
  )
}
