"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { useFrameController } from "@/hooks/useFrameController"
import { OriginalRoomFrame } from "@/lib/types"
import Image from "next/image"
import classNames from "classnames"

export function TurnCountdown({ isHidden }: { isHidden?: boolean }) {
    const { currentFrame } = useFrameController<OriginalRoomFrame>()

    // Identify the active player (their turn) + other players
    const { currentPlayer, others } = useMemo(() => {
        if (!currentFrame?.players)
            return { currentPlayer: null, others: [] as any[] }

        const allPlayers = Object.values(currentFrame.players)
        const active = allPlayers.find((p) => p.id === currentFrame.currentPlayerId)
        const others = allPlayers.filter((p) => p.id !== currentFrame.currentPlayerId)

        return { currentPlayer: active ?? null, others }
    }, [currentFrame])

    // Use the actual timer from frame
    const remaining = currentFrame?.timer ?? 0
    const progress = Math.max(0, Math.min(remaining / 60, 1)) // normalize 0–1

    return (
        <div
            className={classNames(
                isHidden ? "hidden" : "flex",
                "fixed z-[20] top-0 left-0 flex-col items-center justify-center min-h-screen w-full text-center",
                "bg-[radial-gradient(50%_50%_at_50%_50%,_#A659FE_0%,_#6F53FD_100%)]",
                "animate-[smoothGlow_10s_ease-in-out_infinite]"
            )}
        >
            {/* --- Header --- */}
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl font-extrabold text-white tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
            >
                PLEASE WAIT
            </motion.h1>

            <motion.p
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="mt-6 text-2xl font-semibold text-yellow-300 drop-shadow-[0_0_14px_rgba(253,224,71,0.8)]"
            >
                {currentPlayer
                    ? `${currentPlayer.displayName} is taking their turn...`
                    : "Waiting for other players..."}
            </motion.p>

            {/* --- Progress Bar --- */}
            <div className="w-2/3 h-3 mt-10 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-yellow-300 rounded-full shadow-[0_0_16px_rgba(253,224,71,0.8)]"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                />
            </div>

            <p className="mt-3 text-white/80 text-sm font-medium tracking-wider">
                {Math.ceil(remaining)}s remaining
            </p>

            {/* --- Player List --- */}
            <div className="mt-10 flex flex-wrap justify-center gap-6 px-6 max-w-2xl">
                {others?.map((p) => (
                    <motion.div
                        key={p.id}
                        whileHover={{ scale: 1.05 }}
                        className="flex flex-col items-center"
                    >
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white/40 shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                            {p.avatarUri ? (
                                <Image
                                    src={p.avatarUri}
                                    alt={p.displayName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-white/20 flex items-center justify-center text-white text-lg font-bold">
                                    {p.displayName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-white mt-2 font-medium opacity-80">
                            {p.displayName}
                        </p>
                    </motion.div>
                ))}
            </div>

            <style jsx>{`
        @keyframes smoothGlow {
          0% {
            filter: brightness(1);
            background-position: 0% 50%;
          }
          50% {
            filter: brightness(1.2);
            background-position: 100% 50%;
          }
          100% {
            filter: brightness(1);
            background-position: 0% 50%;
          }
        }
      `}</style>
        </div>
    )
}
