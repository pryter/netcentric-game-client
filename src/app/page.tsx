"use client"

import { useSearchParams } from "next/navigation";
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
import Link from "next/link";
import { Button } from "@/components/ui/button";




export default function Home() {

  const {user, signOut, signIn} = useClientAccount()
  const [state, setState] = useState<boolean>(false)
  const {isAuthenticated, send, serverUser} = useConnection()
  const [isInElectron, setInElectron] = useState<boolean>(false)
  const router = useRouter()
  const [nickname, setNickname] = useState<string>("")
  const [showHelp, setShowHelp] = useState(false)


  useEffect(() => {
    if (!isAuthenticated()) return

    if (!serverUser?.nickname) {
      setState(true)
    }else{
      setState(false)
    }
  }, [serverUser]);

  useEffect(() => {
    // @ts-ignore
    const isIn = window.navigator.userAgent === "Electron"
    setInElectron(isIn)
  }, []);

  const sendUserName = () => {
    if (!nickname) return
    send(new MsgPayload({group: "client-action", name: "set-nickname", data: {nickname: nickname}}))
  }

  return (
    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="flex flex-col items-end h-screen relative w-full">

      {isAuthenticated() && (
        <button
          aria-label="How to play"
          onClick={() => setShowHelp(true)}
          className="absolute top-10 left-10 z-[300] rounded-2xl outline-none
           transition-transform duration-200 hover:scale-105
           active:scale-95 hover:drop-shadow-[0_0_8px_#FACC15]"
        >
          <Image
            src="/assets/question-box.png"
            alt="How to play"
            width={55}
            height={55}
            priority
            unoptimized
            className="block select-none"
          />
        </button>
      )}

      {isAuthenticated() && (
        <button
          aria-label="Leaderboard"
          onClick={() => router.push("/leaderboard")}
          className="absolute top-9 right-9 z-[300] rounded-2xl outline-none
           transition-transform duration-200 hover:scale-105
           active:scale-95 hover:drop-shadow-[0_0_8px_#FACC15]"
        >
          <Image
            src="/assets/trophy.png"
            alt="Leaderboard"
            width={65}
            height={65}
            priority
            unoptimized
            className="block select-none"
          />
        </button>
      )}


      <Modal state={showHelp}>
        <div className="flex flex-col relative bg-gradient-to-br from-cyan-900/90 to-teal-900/90 backdrop-blur-md border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.4)] rounded-2xl min-w-[320px] max-w-[90vw] py-4 px-6">
          <div className="flex items-start justify-between gap-4">
            <h2 className="text-white font-black text-2xl text-shadow-sm text-shadow-yellow-600">How to Play</h2>
            <Button
              aria-label="Close"
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-white/90 hover:text-white hover:bg-white/10"
              onClick={() => setShowHelp(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.3 1.4L10.6 13.4 4.3 19.7 3 18.3 9.3 12 3 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/>
              </svg>
            </Button>
          </div>

          <ol className="list-decimal pl-5 mt-6 space-y-2 font-medium text-md leading-6 text-white">
            <li>Create or join a room from the home screen.</li>
            <li>Wait in the Waiting Room until everyone is ready.</li>
            <li>Answer prompts quickly and correctly to score points.</li>
            <li>Total points across rounds decide the winner.</li>
          </ol>

          <p className="mt-3 text-xs text-white/80">
            Tip: You can check rankings on the Leaderboard (trophy icon).
          </p>

          <div className="mt-6 self-endZ text-white">
            <GameButton className="py-1.5 px-4 text-md w-full font-semibold rounded-xl" onClick={() => setShowHelp(false)}>
              Got it
            </GameButton>
          </div>
        </div>
      </Modal>

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
      {!isInElectron && <div className="fixed bottom-0 left-0 p-6">
        <h1 className="text-white font-semibold text-xl">Download now</h1>
        <div className="flex flex-row space-x-2 mt-2">
          <Link href={"https://github.com/pryter/netcentric-game-client/releases/download/0.0.1/iq180-game-arm64.dmg"}
                target="_blank">
            <GameButton color="amber" className="flex flex-col items-center justify-center size-[90px] rounded-2xl">
              <div>
                <svg className="size-12 mx-auto" fill="#fff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                </svg>
                <span className="text-lg font-semibold mt-1 text-white">MacOS</span>
              </div>
            </GameButton>
          </Link>
          <Link href={"https://github.com/pryter/netcentric-game-client/releases/download/0.0.1/iq180-game-win64.exe"}
                target="_blank">
            <GameButton color="amber" className="flex flex-col items-center justify-center size-[90px] rounded-2xl">
              <div>
                <svg className="size-12 mx-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <title>microsoft_windows</title>
                  <rect width="24" height="24" fill="none"/>
                  <path fill="#fff"
                        d="M3,12V6.75L9,5.43v6.48L3,12M20,3v8.75L10,11.9V5.21L20,3M3,13l6,.09V19.9L3,18.75V13m17,.25V22L10,20.09v-7Z"/>
                </svg>
                <span className="text-lg font-semibold mt-1 text-white">Windows</span>
              </div>
            </GameButton>
          </Link>
        </div>
      </div>}
      {isAuthenticated() && <div className="fixed bottom-0 right-0 p-6">
          <div className="flex flex-row space-x-4 rounded-[16px] px-4">
              <img className="rounded-full shadow-sm z-1 p-1 w-[70px] h-[70px] bg-yellow-600" src={user?.photoURL ?? "/assets/placeholder_profile.jpg"} alt={"logo"}
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
