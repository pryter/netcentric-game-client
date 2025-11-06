"use client"
import {useFrameController} from "@/hooks/useFrameController";

import {useGameController} from "@/hooks/useGameController";
import {OriginalRoomFrame} from "@/lib/types";
import {Suspense, useEffect, useState} from "react";
import Image from "next/image";
import {useConnection} from "@/hooks/useConnection";
import {GameBoard} from "@/components/GameBoard";
import {WaitingRoom} from "@/components/WaitingRoom";
import {useParams, usePathname, useRouter, useSearchParams} from "next/navigation";
import {Countdown} from "@/components/Countdown";
import {Scoreboard} from "@/components/Scoreboard";

// ui done
const Page = () => {

    const {serverUser} = useConnection();
    const searchParams = useSearchParams()
    const pname = usePathname()
    const {currentFrame ,rawFrameStream} = useFrameController<OriginalRoomFrame>()
    const {sendAction} = useGameController()
    const router = useRouter()

    useEffect(() => {
        if (!serverUser) {
            return;
        }

        if (rawFrameStream.isStreamEnd) {
            if (currentFrame?.state === "resolved") {
                return
            }
            if (searchParams.get("code")) {
                const code = searchParams.get("code")
                sendAction("join-og-game", {code: code}).then(p => {
                    if (!p || p.getStatus() !== 0) {
                        router.push(`/mode`)
                    }
                })
                return
            }
            router.push("/mode")
        }

        return () => {
            console.log("ee")
        }
    }, [rawFrameStream.isStreamEnd, serverUser])

    useEffect(() => {
        console.log(pname)
    }, [pname]);

    if (!currentFrame){
        return    <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="">
            <h1>Room Not found</h1>
        </div>
    }

    return (
        <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="">
            <Countdown isHidden={!currentFrame || currentFrame?.state !== "next-round-countdown"}/>
            {(currentFrame?.state === "waiting" || currentFrame?.state === "lobby-countdown") && <WaitingRoom roomId={searchParams.get("code") as string}/>}
            {currentFrame?.state === "running" && <GameBoard/>}
            {currentFrame?.state === "resolved" && <Scoreboard/>}
        </div>
    )
}

export default Page