"use client";

import { useMemo } from "react";
import { useGameController } from "@/hooks/useGameController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import { OriginalRoomFrame } from "@/lib/types";
import { useFrameController } from "@/hooks/useFrameController";
import { useConnection } from "@/hooks/useConnection";
import { useRouter } from "next/navigation";
import { GameButton } from "@/components/Button";
import Image from "next/image";

type Player = {
    id: string;
    nickname?: string;
    displayName?: string;
    score?: number;
    avatar?: string;
    avatarUri?: string;
};

export function Scoreboard() {
    const { currentFrame } = useFrameController<OriginalRoomFrame>();
    const { serverUser } = useConnection();
    const { sendAction } = useGameController();
    const router = useRouter();

    const currentMyId = serverUser?.uid;

    const players = useMemo(() => {
        const p = currentFrame?.players;
        return p ? Object.values(p) : [];
    }, [currentFrame]);

    const ranked = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    const winner = ranked[0];

    const getProfileUrl = (player?: Player) =>
        player?.avatar || player?.avatarUri || "/assets/placeholder_profile.jpg";

    const getRankIcon = (index: number) =>
        index === 0 ? (
            <Trophy className="w-6 h-6 text-yellow-400" />
        ) : index === 1 ? (
            <Medal className="w-6 h-6 text-gray-300" />
        ) : index === 2 ? (
            <Award className="w-6 h-6 text-amber-600" />
        ) : (
            <div className="w-6 h-6 flex items-center justify-center text-cyan-400 font-bold text-sm">
                #{index + 1}
            </div>
        );

    const getName = (p: Player) => p?.nickname ?? p?.displayName ?? "Player";

    const handlePlayAgain = () => {
        if (currentFrame?.gameType === "classic") {
            sendAction("play-again");
        } else if (currentFrame?.gameType === "solo") {
            sendAction("create-solo-game").then((r) => {
                const code = r?.getData().code;
                if (code) router.push(`/game?code=${code}`);
            });
        } else {
          sendAction("create-og-game").then((r) => {
            const code = r?.getData().code;
            if (code) router.push(`/game?code=${code}`);
          });
        }
    };

    const handleLeaveRoom = () => router.push("/mode");

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{
                background:
                    "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)",
            }}
        >
            {/* Subtle overlay */}
            <div className="absolute inset-0 backdrop-blur-sm bg-black/10 z-0" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 w-full max-w-xl"
            >
                <Card className="bg-gradient-to-br from-cyan-900/90 to-teal-900/90 border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.4)] rounded-2xl overflow-hidden">
                    {/* Header */}
                    <CardHeader className="text-center pt-10 pb-8">
                        <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[0_4px_12px_rgba(234,179,8,0.8)] tracking-wider mb-3">
                            IQ180
                        </h1>
                        <CardTitle className="text-[64px] sm:text-[72px] font-black text-white text-shadow-lg text-shadow-yellow-600 tracking-wide mb-10">
                            Game Over
                        </CardTitle>

                        <div className="flex justify-center items-center">
                            <Image
                                src="/assets/game.png"
                                alt="icon"
                                width={0}
                                height={0}
                                referrerPolicy={"no-referrer"}
                                sizes="(max-width: 640px) 90px, (max-width: 1024px) 110px, 130px"
                                className="w-[90px] sm:w-[110px] md:w-[130px] h-auto select-none drop-shadow-[0_0_16px_rgba(250,204,21,0.6)] mb-6"
                                priority
                                unoptimized
                            />
                        </div>

                        {winner && (
                            <motion.p
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="text-[1.7rem] font-bold text-white"
                            >
                                <span className="text-yellow-400">{getName(winner)}</span> wins!
                            </motion.p>
                        )}
                    </CardHeader>

                    {/* Scoreboard */}
                    <CardContent className="space-y-5 px-6 pb-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.45 }}
                            className="bg-black/40 rounded-xl p-4 border-2 border-cyan-500/30 shadow-inner"
                        >
                            <h3 className="font-black text-lg text-yellow-400 tracking-wide mb-3 text-center flex items-center justify-center gap-2">
                                SCOREBOARD
                            </h3>

                            <div className="space-y-2">
                                {ranked.map((p, index) => (
                                    <motion.div
                                        key={p.id}
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.55 + index * 0.08 }}
                                        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                                            index === 0
                                                ? "bg-gradient-to-r from-yellow-600/40 to-amber-600/40 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20"
                                                : index === 1
                                                    ? "bg-gradient-to-r from-gray-600/30 to-gray-700/30 border-2 border-gray-400"
                                                    : index === 2
                                                        ? "bg-gradient-to-r from-orange-600/30 to-amber-700/30 border-2 border-amber-500"
                                                        : "bg-black/50 border-2 border-cyan-500/30"
                                        } ${p.id === currentMyId ? "ring-2 ring-emerald-400" : ""}`}
                                    >
                                        {/* Rank */}
                                        <div className="w-8 flex justify-center items-center">
                                            {getRankIcon(index)}
                                        </div>

                                        {/* profile image */}
                                        <div className="relative w-9 h-9">
                                            <Image
                                                src={getProfileUrl(p)}
                                                alt={getName(p)}
                                                referrerPolicy={"no-referrer"}
                                                fill
                                                sizes="36px"
                                                unoptimized
                                                className={`rounded-full object-cover bg-yellow-700/30 ${
                                                    index === 0
                                                        ? "ring-2 ring-yellow-400"
                                                        : index === 1
                                                            ? "ring-2 ring-gray-300"
                                                            : index === 2
                                                                ? "ring-2 ring-amber-600"
                                                                : ""
                                                }`}
                                            />
                                        </div>

                                        {/* Name */}
                                        <div className="flex-1 ml-2">
                                            <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white">
                          {getName(p)}
                        </span>
                                                {p.id === currentMyId && (
                                                    <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-semibold">
                            YOU
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-yellow-400 tabular-nums">
                        {p.score ?? 0}
                      </span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="flex flex-col sm:flex-row gap-3"
                        >
                            <GameButton
                                onClick={handlePlayAgain}
                                className="flex items-center justify-center w-full sm:w-1/2 gap-3 py-2 text-white font-semibold rounded-xl"
                            >
                                <RotateCcw className="w-4 h-4" />
                                Play Again
                            </GameButton>

                            <GameButton
                                onClick={handleLeaveRoom}
                                color="cyan"
                                className="flex items-center justify-center w-full sm:w-1/2 gap-3 py-2 text-white font-semibold rounded-xl"
                            >
                                <Home className="w-4 h-4" />
                                Leave Room
                            </GameButton>
                        </motion.div>

                        {/* Leaderboard */}
                        <GameButton
                            onClick={() => router.push("/leaderboard")}
                            color="yellow"
                            className="flex items-center justify-center w-full gap-3 py-2 text-white font-semibold rounded-xl"
                        >
                            <Image
                                src="/assets/trophy.png"
                                alt="Leaderboard"
                                referrerPolicy={"no-referrer"}
                                width={18}
                                height={18}
                                unoptimized
                            />
                            View Leaderboard
                        </GameButton>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
