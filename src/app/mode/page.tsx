"use client";

import { useConnection } from "@/hooks/useConnection";
import { useGameController } from "@/hooks/useGameController";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Users, Trophy } from "lucide-react";
import { GameButton } from "@/components/Button";
import { ReactNode } from "react";
import Image from "next/image";


export default function ModePage() {
    const [nicknameRequired, setNicknameRequired] = useState(false);
    const { isAuthenticated, serverUser } = useConnection();
    const { sendAction } = useGameController();
    const router = useRouter();
    const [code, setCode] = useState("");

    useEffect(() => {
        if (!isAuthenticated()) return;
        setNicknameRequired(!serverUser?.nickname);
    }, [serverUser]);

    const playSolo = async () => {
        const room = await sendAction("create-og-game");
        if (!room) return;

        const jcode = room.getData().joinCode;
        if (!jcode) return;

        await sendAction("join-og-game", { code: jcode });
        await sendAction("ready", true);

        router.push(`/game?code=${jcode}&mode=solo&localcountdown=1`);

        setTimeout(async () => {
            await sendAction("start-game", { code: jcode });
        }, 4000);
    };

    const createClassicRoom = () => {
        sendAction("create-classic-game").then((room) => {
            if (room) {
                const jcode = room.getData().joinCode;
                if (jcode) router.push(`/game?code=${jcode}&mode=classic`);
            }
        });
    };

    const joinOrCreateCompetitiveRoom = () => {
        if (code.trim()) {
            sendAction("join-og-game", { code }).then((res) => {
                if (res?.getStatus() === 0)
                    router.push(`/game?code=${code}&mode=competitive`);
            });
        } else {
            sendAction("create-og-game").then((room) => {
                if (room) {
                    const jcode = room.getData().joinCode;
                    if (jcode)
                        router.push(`/game?code=${jcode}&mode=competitive`);
                }
            });
        }
    };

    return (
        <div
            style={{
                background:
                    "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)",
            }}
            className="flex flex-col items-center justify-center min-h-screen w-full text-white px-6"
        >
            <h1 className="text-[110px] font-black text-white text-shadow-lg text-shadow-yellow-600 tracking-wide mb-20">
                Select Mode
            </h1>

            <div className="flex flex-col md:flex-row gap-10 md:gap-14 items-center justify-center">
                {/* Solo */}
                <ModeCard
                    icon={
                        <div>
                            <Image
                                src="/assets/wizard-hat.png"
                                alt="icon"
                                width={90}
                                height={90}
                                priority
                                unoptimized
                                className="block select-none drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                            />
                        </div>
                    }
                    title="Single Mode"
                    desc="Practice alone and sharpen your skills."
                    buttonText="Play Solo"
                    onClick={playSolo}
                />


                {/* Classic */}
                <ModeCard
                    icon={
                        <div>
                            <Image
                                src="/assets/potion.png"
                                alt="icon"
                                width={90}
                                height={90}
                                priority
                                unoptimized
                                className="block select-none drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                            />
                        </div>
                    }
                    title="Classic Mode"
                    desc="Take turns solving questions with friends."
                    buttonText="Play Classic"
                    onClick={createClassicRoom}
                />

                {/* Competitive */}
                <ModeCard
                    icon={
                        <div className="mt-14 font-bold">
                            <Image
                                src="/assets/fireball.png"
                                alt="icon"
                                width={90}
                                height={90}
                                priority
                                unoptimized
                                className="block select-none drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]"
                            />
                        </div>
                    }
                    title="Competitive Mode"
                    desc="Everyone plays the same question simultaneously."
                    buttonText="Create / Join"
                    isCompetitive
                    code={code}
                    setCode={setCode}
                    onClick={joinOrCreateCompetitiveRoom}
                />
            </div>
        </div>
    );
}

function ModeCard({
                      icon,
                      title,
                      desc,
                      buttonText,
                      onClick,
                      isCompetitive = false,
                      code,
                      setCode,
                  }: {
    icon: ReactNode;
    title: string;
    desc: string;
    buttonText: string;
    onClick: () => void;
    isCompetitive?: boolean;
    code?: string;
    setCode?: (v: string) => void;
}) {
    return (

        <div className="flex flex-col justify-between items-center bg-cyan-900/90 backdrop-blur-md border-4 border-yellow-500/80 rounded-xl shadow-[0_0_40px_rgba(234,179,8,0.4)] p-10 text-center w-[340px] h-[500px] hover:scale-105 transition-all duration-300">
            {/* Top Section */}
            <div className="flex flex-col items-center justify-center flex-1 space-y-5">
                {icon}
                <h2 className="text-3xl font-extrabold text-yellow-300 drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]">
                    {title}
                </h2>
                <p className="text-base opacity-90 leading-relaxed max-w-[250px] text-gray-100">
                    {desc}
                </p>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col items-center justify-center w-full mt-6 space-y-3">
                {isCompetitive ? (
                    <>
                        <div className="flex flex-col items-center justify-center space-y-3 w-full">
                            <input
                                value={code}
                                onChange={(e) => setCode?.(e.target.value.toUpperCase())}
                                placeholder="Enter Room Code"
                                className="w-full py-2 text-lg font-semibold text-center text-white bg-transparent border-2 border-white/70 rounded-xl placeholder-white/70 focus:outline-none focus:border-yellow-400 transition-all duration-200"
                            />
                            <GameButton onClick={onClick}>{buttonText}</GameButton>
                        </div>
                    </>
                ) : (
                    <GameButton onClick={onClick}>{buttonText}</GameButton>
                )}
            </div>
        </div>
    );
}
