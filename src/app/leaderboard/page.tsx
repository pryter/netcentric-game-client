"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GameButton } from "@/components/Button";
import { useRouter } from "next/navigation";
import { useClientAccount } from "@/hooks/useClientAccount"; // includes Google photoURL etc.

// === 1. Type definition ===
type LeaderboardEntry = {
  id: string;
  name: string;
  profileUrl?: string;
  score: number;
  ranking: number;
};

// === 2. Mock data for now ===
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: "1",
    name: "Mint",
    profileUrl: "/assets/placeholder_profile.jpg",
    score: 1250,
    ranking: 1,
  },
  {
    id: "2",
    name: "Aimmy",
    profileUrl: "/assets/placeholder_profile.jpg",
    score: 1080,
    ranking: 2,
  },
  {
    id: "3",
    name: "Peter",
    profileUrl: "/assets/placeholder_profile.jpg",
    score: 980,
    ranking: 3,
  },
  {
    id: "4",
    name: "Papang",
    profileUrl: "/assets/placeholder_profile.jpg",
    score: 900,
    ranking: 4,
  },
];

// === 3. Leaderboard Page ===
export default function LeaderboardPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const { user } = useClientAccount(); // this has user.photoURL

  // === 4. Load mock data now, plug API later ===
  useEffect(() => {
    setPlayers(MOCK_LEADERBOARD);
  }, []);

  // === 5. Fallback chain ===
  // Each player can have:
  // - their own profileUrl (from DB)
  // - or fallback to current signed-in user photo
  // - or fallback to placeholder
  const getProfileUrl = (player: LeaderboardEntry) => {
    return (
      player.profileUrl ||
      user?.photoURL ||
      "/assets/placeholder_profile.jpg"
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-purple-900 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Image
          src="/assets/trophy.png"
          alt="Leaderboard Trophy"
          width={56}
          height={56}
          priority
          unoptimized
          className="drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]"
        />
        <h1 className="text-5xl font-black text-yellow-400">Leaderboard</h1>
      </motion.div>

      {/* Table */}
      <div className="w-full max-w-xl bg-black/40 border-4 border-yellow-400/70 rounded-2xl backdrop-blur-md p-4 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
        {players.map((player, idx) => (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.06 }}
            className={`flex items-center justify-between px-3 py-2 rounded-lg mb-2 ${
              player.ranking === 1
                ? "bg-yellow-600/40 border-2 border-yellow-400"
                : player.ranking === 2
                ? "bg-gray-600/40 border-2 border-gray-300"
                : player.ranking === 3
                ? "bg-amber-700/40 border-2 border-amber-400"
                : "bg-white/10 border border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Rank */}
              <span className="text-lg font-bold text-yellow-300 w-6 text-center">
                {player.ranking}
              </span>

              {/* Profile Picture (same fallback logic as waiting room) */}
              <Image
                src={getProfileUrl(player)}
                alt={player.name}
                width={36}
                height={36}
                unoptimized
                onError={(e) =>
                  (e.currentTarget.src = "/assets/placeholder_profile.jpg")
                }
                className="rounded-full bg-yellow-700/30"
              />

              {/* Name */}
              <span className="font-semibold text-white">{player.name}</span>
            </div>

            {/* Score */}
            <span className="text-yellow-400 font-black text-xl tabular-nums">
              {player.score}
            </span>
          </motion.div>
        ))}
      </div>

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
