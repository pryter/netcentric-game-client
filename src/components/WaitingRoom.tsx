"use client";

import {useMemo, useState} from "react";
import {useGameController} from "@/hooks/useGameController";
import {Card} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Loader2, Users, Check, Clock, Copy, Link as LinkIcon} from "lucide-react";
import {OriginalRoomFrame} from "@/lib/types";
import {useFrameController} from "@/hooks/useFrameController";
import {useConnection} from "@/hooks/useConnection";


export type WaitingRoomProps = {
  roomId: string
}
export function WaitingRoom({roomId}: WaitingRoomProps) {

  const {serverUser} = useConnection()
  const {sendAction} = useGameController();
  const {currentFrame} = useFrameController<OriginalRoomFrame>();
  const [isTogglingReady, setIsTogglingReady] = useState(false);
  const [copied, setCopied] = useState<"code" | "link" | null>(null);

  // Fallbacks for local preview
  const players = useMemo(() => {
    const p = currentFrame?.players ?? [];
    return Object.values(p)
  }, [currentFrame]);

  const myself = useMemo(
    () => {
      const myId = serverUser?.uid
      return players.find((p) => p.id === (myId ?? players[0]?.id))
    },
    [players, serverUser]
  );

  const isReady = !!myself?.isReady;

  const readyCount = players.filter((p) => p.isReady).length;
  const allReady = players.length >= 2 && readyCount === players.length;

  async function handleToggleReady() {
    if (!myself) return;
    setIsTogglingReady(true);
    try {
      await sendAction("ready", !isReady);
    } catch (e) {
      console.error("[waiting-room] toggle-ready failed:", e);
    }
    setIsTogglingReady(false);
  }

  function statusOf(p: any) {
    if (p.isReady) {
      return {text: "Ready", Icon: Check, color: "text-green-400", chip: "bg-green-500/20"};
    }
    return {text: "Waiting", Icon: Clock, color: "text-yellow-400", chip: "bg-yellow-500/20"};
    // maybe add a disconnected state if frame exposes it (?)
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied("code");
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  }
  async function copyInviteLink() {
    try {
      const url = `${location.origin}/?room=${encodeURIComponent(roomId)}`;
      await navigator.clipboard.writeText(url);
      setCopied("link");
      setTimeout(() => setCopied(null), 1200);
    } catch {}
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/loading_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card className="w-full max-w-md bg-cyan-900/90 rounded-xl backdrop-blur-md border-4 border-yellow-500/80 shadow-[0_0_40px_rgba(234,179,8,0.4)] p-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-black text-yellow-400 drop-shadow-[0_4px_12px_rgba(234,179,8,0.8)] tracking-wider mb-2">
            IQ180
          </h1>

          <Loader2 className={`w-16 h-16 mx-auto ${allReady ? "text-yellow-400" : "text-green-400"} animate-spin`} />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              {allReady ? "All Players Ready" : "Waiting for Players"}
            </h2>

            {!!roomId && (
              <div className="flex items-center justify-center gap-2 text-cyan-200 text-sm">
                <span>
                  Room Code: <span className="font-mono font-bold text-yellow-300">{roomId}</span>
                </span>
                <button
                  onClick={copyCode}
                  className="inline-flex items-center gap-1 text-yellow-300 hover:text-yellow-200"
                  title="Copy code"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-cyan-200">
              <Users className="w-5 h-5" />
              <span className="font-semibold">
                {players.length} Players
              </span>
            </div>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={copyInviteLink}
                className="inline-flex items-center gap-2 border-cyan-400 text-cyan-200 bg-cyan-900/40 hover:bg-cyan-800/70"
              >
                <LinkIcon className="w-4 h-4" />
                {copied === "link" ? "Invite Link Copied" : "Copy Invite Link"}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-6">
            {players.map((p) => {
              const {text, Icon, color, chip} = statusOf(p);
              const isMe = p.id === serverUser?.uid;
              const name = p.displayName;

              return (
                <div
                  key={p.id}
                  className={`bg-black/50 rounded-lg px-4 py-3 flex items-center gap-3 border-2 transition-all ${
                    p.isReady
                      ? "border-green-500/50 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
                      : "border-yellow-500/30"
                  } ${isMe ? "ring-2 ring-cyan-400" : ""}`}
                >
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{name}</span>
                      {isMe && (
                        <span className="text-[10px] bg-cyan-500 text-white px-2 py-0.5 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Icon className={`w-3 h-3 ${color}`} />
                      <span className={`text-xs font-semibold ${color}`}>{text}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${chip} text-white`}>
                    {text.toUpperCase()}
                  </span>
                </div>
              );
            })}

          </div>

          <Button
            onClick={handleToggleReady}
            disabled={isTogglingReady || !myself}
            className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-lg ${
              isReady
                ? "bg-yellow-500 hover:bg-yellow-600 text-black shadow-[0_4px_0_0_rgba(202,138,4,1)] hover:shadow-[0_2px_0_0_rgba(202,138,4,1)] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px]"
                : "bg-green-500 hover:bg-green-600 text-white shadow-[0_4px_0_0_rgba(21,128,61,1)] hover:shadow-[0_2px_0_0_rgba(21,128,61,1)] active:shadow-none hover:translate-y-[2px] active:translate-y-[4px]"
            }`}
          >
            {isTogglingReady ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isReady ? (
              <>
                <Clock className="w-5 h-5 mr-2" />
                Not Ready
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                I’m Ready!
              </>
            )}
          </Button>

          
          <p className="text-xs text-cyan-200/70 mt-2 h-4">
            {copied === "code" ? "Room code copied." : copied === "link" ? "Invite link copied." : "\u00A0"}
          </p>

          <div className="flex gap-2 justify-center mt-4">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
            <div
              className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(74,222,128,0.6)]"
              style={{animationDelay: "0.1s"}}
            />
            <div
              className="w-3 h-3 bg-green-400 rounded-full animate-bounce shadow-[0_0_8px_rgba(74,222,128,0.6)]"
              style={{animationDelay: "0.2s"}}
            />
          </div>

          <p className="text-sm text-cyan-200/70 mt-2">
            Game starts automatically when everyone is ready.
          </p>
        </div>
      </Card>
    </div>
  );
}
