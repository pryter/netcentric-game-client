"use client"
import {useConnection} from "@/hooks/useConnection";
import {useEffect, useMemo, useState} from "react";
import {useClientAccount} from "@/hooks/useClientAccount";
import {useRouter} from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {router} from "next/client";
import {Modal} from "@/components/Modal";
import {MsgPayload} from "@/lib/Payload";
import {GameButton, RoundedButton, SquareButton} from "@/components/Button";

export default function Home() {

  const {user, signOut, signIn} = useClientAccount()
  const [state, setState] = useState<boolean>(false)
  const {isAuthenticated, send, serverUser} = useConnection()
  const router = useRouter()
  const [nickname, setNickname] = useState<string>("")

  useEffect(() => {
    if (!isAuthenticated()) return

    if (!serverUser?.nickname) {
      setState(true)
    }else{
      setState(false)
    }
  }, [serverUser]);

  const sendUserName = () => {
    if (!nickname) return
    send(new MsgPayload({group: "client-action", name: "set-nickname", data: {nickname: nickname}}))
  }

  return (
    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%);"}} className="flex flex-col items-end h-screen relative w-full">
      <Modal state={state}>
        <div className="flex flex-col bg-gradient-to-br from-cyan-900/90 to-teal-900/90 backdrop-blur-md border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.4)] rounded-2xl min-w-[300px] py-4 px-6 z-100">
          <h1 className="text-white font-black text-[20px] text-shadow-sm text-shadow-yellow-600">Welcome</h1>
          <p className="text-white font-semibold text-shadow-sm text-shadow-yellow-600">Please set your nickname!</p>
          <input placeholder="nickname" value={nickname} onChange={(e) => {setNickname(e.target.value)}} className="bg-yellow-700 font-semibold border-4 text-white rounded-xl border-yellow-600 py-2 px-4 mt-4 mb-4"/>
          <GameButton onClick={sendUserName} className="py-2 text-white font-semibold rounded-xl">
            Submit
          </GameButton>
        </div>
      </Modal>
      <div className="h-[50vh] w-full flex items-center justify-center">
        <h1 className="text-[140px] font-black text-white text-shadow-lg text-shadow-yellow-600">IQ180</h1>
      </div>
      {
        !isAuthenticated() && <div className="flex w-full flex-col items-center grow space-y-6 h-[50vh] justify-start">
              <GameButton color={"blue"} onClick={signIn} >
                  Sign In With Google
              </GameButton>
              <GameButton color={"blue"} >
                  Sign In With Facebook
              </GameButton>
          </div>
      }
      {
        isAuthenticated() && <div className="flex w-full flex-col items-center space-y-4 grow h-[50vh] justify-start">
              <GameButton onClick={() => {
                router.push("/mode")
              }} className="py-3 px-6 text-white font-black rounded-2xl text-shadow-sm  text-shadow-[rgba(0,0,0,0.3)] text-3xl">
                  Enter the game
              </GameButton>
          </div>
      }
      {isAuthenticated() && <div className="fixed bottom-0 right-0 p-6">
          <div className="flex flex-row space-x-4 rounded-[16px] px-4">
              <Image className="rounded-full shadow-sm z-1 p-1 w-[70px] h-[70px] bg-yellow-600" src={user?.photoURL ?? "/assets/placeholder_profile.jpg"} alt={"logo"}
                     width={64} height={64}/>
              <div className="space-y-1 z-1">
                  <h2 className="text-lg text-yellow-50 font-semibold text-shadow-sm text-shadow-yellow-600">{serverUser?.nickname}</h2>
                  <GameButton onClick={() => {
                    signOut()
                  }} className="text-sm py-1.5 px-4 text-white rounded-xl">
                      Logout
                  </GameButton>
              </div>
          </div>
      </div>}
    </div>
  )
}
