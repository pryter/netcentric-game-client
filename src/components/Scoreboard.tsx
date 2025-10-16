"use client";

import { useMemo } from "react";
import { useGameController } from "@/hooks/useGameController";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, Sparkles, Home, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import {OriginalRoomFrame} from "@/lib/types";
import {useFrameController} from "@/hooks/useFrameController";
import {useConnection} from "@/hooks/useConnection";
import {useRouter} from "next/navigation";
import {GameButton} from "@/components/Button";

type Player = {
  id: string;
  nickname?: string;
  displayName?: string;
  score?: number;
  isReady?: boolean;
};

type Frame = {
  state?: string;
  me?: string;
  players?: Record<string, Player> | Player[];
};

export function Scoreboard() {
  const {currentFrame} = useFrameController<OriginalRoomFrame>()
  const {serverUser} = useConnection()
  const { sendAction } = useGameController();
  const router = useRouter()

  const currentMyId = serverUser?.uid
  // normalize players to array
  const players = useMemo(() => {
    const p = currentFrame?.players;
    if (!p) return [];
    return Object.values(p)
  }, [currentFrame]);

  const ranked = [...players].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const winner = ranked[0];
  const isWinner = winner?.id === currentMyId;

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

  const getName = (p: Player) => p ? p.nickname ?? p.displayName ?? p.id : "";

  const handlePlayAgain = () => {
    sendAction("create-og-game").then(r => {
      if (r?.getData().code) {
        router.push(`/default2?code=${r.getData().code}`)
      }
    })
  }
  const handleLeaveRoom = () => {
    router.push("/mode")
  }

  return (
    <div
      className="min-h-screen relative flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 backdrop-blur-sm bg-black/10 z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-xl"
      >
        <Card className="py-6 bg-gradient-to-br from-cyan-900/90 to-teal-900/90 backdrop-blur-md border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.4)] rounded-2xl overflow-hidden">
          <CardHeader className="text-center space-y-2 pb-4 pt-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
            </motion.div>

            <CardTitle className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 drop-shadow-[0_2px_8px_rgba(234,179,8,0.8)]">
              Game Over!
            </CardTitle>

            {winner && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-2xl font-bold text-white"
              >
                <span className="text-yellow-400">{getName(winner)}</span> wins!
                {isWinner && (
                  <span className="ml-2 text-emerald-300 text-sm font-semibold">
                    🎉 You’re the champion!
                  </span>
                )}
              </motion.p>
            )}
          </CardHeader>

          <CardContent className="space-y-4 px-6 pb-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="bg-black/40 rounded-xl p-4 border-2 border-cyan-500/30 shadow-inner"
            >
              <h3 className="font-black text-lg text-yellow-400 mb-3 text-center flex items-center justify-center gap-2">
                <Trophy className="w-5 h-5" />
                Final Scores
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

                    {/* Nickname only */}
                    <div className="flex-1">
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
                      {index < 3 && (
                        <span className="text-xl">
                          {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                        </span>
                      )}
                      <span className="text-2xl font-black text-yellow-400 tabular-nums">
                        {p.score ?? 0}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex gap-3"
            >
              <GameButton
                onClick={handlePlayAgain}
                className="flex items-center justify-center w-1/2 gap-3 py-2 text-white font-semibold rounded-xl"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </GameButton>

              <GameButton
                onClick={handleLeaveRoom}
                color={"cyan"}
                className="flex items-center justify-center w-1/2 gap-3 py-2 text-white font-semibold rounded-xl"  >
                <Home className="w-4 h-4" />
                Leave Room
              </GameButton>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
