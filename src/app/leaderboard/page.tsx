"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GameButton } from "@/components/Button";
import {usePathname, useRouter} from "next/navigation";
import { useClientAccount } from "@/hooks/useClientAccount";
import {useGameController} from "@/hooks/useGameController";
import {useConnection} from "@/hooks/useConnection"; // includes Google photoURL etc.

type LeaderboardEntry = {
  uid: string;
  nickname: string;
  avatar?: string;
  score: number;
  ranking: string;
  level?: number;
};


export default function LeaderboardPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const {sendAction} = useGameController()
  const {state} = useConnection()


  useEffect(() => {
    if (state === "authenticated") {
      sendAction("get-leaderboard").then((r) => {
        if (r && !r.isError()) {
          const data = r.getData()
          setPlayers(data.leaderboard ?? [])
        }
      })
    }
  }, [state]);


  const getProfileUrl = (player: LeaderboardEntry) => {
    return (
      player.avatar ||
      "/assets/placeholder_profile.jpg"
    );
  };

  const cleanRank = (rank: string) => {
    return parseInt(rank.replace("=", ""))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Image
          src="/assets/trophy.png"
          alt="Leaderboard Trophy"
          referrerPolicy={"no-referrer"}
          width={56}
          height={56}
          priority
          unoptimized
          className="drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]"
        />
        <h1 className="text-5xl font-black text-yellow-400">Leaderboard</h1>
      </motion.div>

      {/* Table */}
      <motion.div layout={true} className="w-full max-w-xl bg-black/40 border-4 border-yellow-400/70 rounded-2xl backdrop-blur-md p-4 min-h-[200px] max-h-[400px] overflow-y-auto shadow-[0_0_40px_rgba(234,179,8,0.3)]">
        {players.length > 0 ? players.map((player, idx) => (
          <motion.div
            key={player.uid}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 ${
              cleanRank(player.ranking) === 1
                ? "bg-yellow-600/40 border-2 border-yellow-400"
                : cleanRank(player.ranking) === 2
                ? "bg-gray-600/40 border-2 border-gray-300"
                : cleanRank(player.ranking) === 3
                ? "bg-amber-700/40 border-2 border-amber-400"
                : "bg-white/10 border border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-lg font-bold text-yellow-300 w-6 text-center">
                {player.ranking}
              </span>

              <Image
                src={getProfileUrl(player)}
                alt={player.nickname}
                referrerPolicy={"no-referrer"}
                width={36}
                height={36}
                unoptimized
                className="rounded-full bg-yellow-700/30"
              />

              {/* Name */}
              <span className="font-semibold text-white">{player.nickname}</span>
            </div>

            {/* Score */}
            <span className="text-yellow-400 font-black text-xl tabular-nums">
              {player.score}
            </span>
          </motion.div>
        )) : <h1 className="text-white font-semibold w-full text-center text-xl py-2 my-auto">Leaderboard is empty</h1>}
      </motion.div>

      {/* Footer */}
      <GameButton
        onClick={() => router.push("/")}
        className="mt-6 px-6 py-2 text-white font-semibold rounded-xl"
      >
        Back to Home
      </GameButton>
    </div>
  );
}
