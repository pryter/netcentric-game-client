"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFrameController } from "@/hooks/useFrameController"
import { useGameController } from "@/hooks/useGameController"
import { useConnection } from "@/hooks/useConnection"
import { Target, Clock } from "lucide-react"
import { GameButton } from "@/components/Button"
import { OriginalRoomFrame } from "@/lib/types"
import { TurnCountdown } from "./TurnCountdown" // 👈 import your waiting screen

const HELPER_TIPS = ["Submit before time's up!"]

function DigitKey({ digit, index, isUsed, isMyTurn, onClick }: any) {
    return (
        <GameButton
            color={isUsed ? "gray" : "blue"}
            className="w-20 h-20 text-2xl font-black rounded-2xl text-white"
            onClick={onClick}
            disabled={!isMyTurn || isUsed}
        >
            {digit}
        </GameButton>
    )
}

function OpKey({ operator, isMyTurn, onClick }: any) {
    return (
        <GameButton
            onClick={onClick}
            className="w-16 h-16 text-2xl text-white font-black rounded-2xl"
            color={"purple"}
            disabled={!isMyTurn}
        >
            {operator}
        </GameButton>
    )
}

export function GameBoard() {
    const { currentFrame } = useFrameController<OriginalRoomFrame>()
    const { serverUser } = useConnection()
    const { sendAction } = useGameController()

    const [expression, setExpression] = useState("")
    const [usedDigitIndices, setUsedDigitIndices] = useState<number[]>([])
    const [feedback, setFeedback] = useState("")
    const [currentTipIndex, setCurrentTipIndex] = useState(0)

    const frame = currentFrame
    const mode = frame?.mode ?? "solo" // "solo" | "classic" | "competitive"
    const digits = frame?.question?.problem || []
    const target = frame?.question?.target || 0
    const me = serverUser
    const myId = me?.uid

    // Identify turn state
    const currentTurnId = frame?.turn
    const isMyTurn =
        mode === "solo" ||
        mode === "competitive" ||
        (mode === "classic" && currentTurnId === myId)

    // Get player info
    const players = Object.values(frame?.players ?? {})
    const mePlayer = players.find((p: any) => p.id === myId)
    const otherPlayers = useMemo(() => {
      return {
        thinking: Object.values(currentFrame?.players ?? {}).filter((p) => p.roundStatus === "thinking"),
        solved: Object.values(currentFrame?.players ?? {}).filter((p) => p.roundStatus === "solved")
      }
    }, [currentFrame])

    // Timer
    const maxTurn = 60
    const timerProgress = useMemo(() => {
        if (!frame) return 0
        return (frame.timer / maxTurn) * 100
    }, [frame])

    const isTimeUp = frame && frame.timer <= 0
    const timeRemaining = Math.round(frame?.timer ?? 0)


    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTipIndex((prev) => (prev + 1) % HELPER_TIPS.length)
        }, 6000)
        return () => clearInterval(interval)
    }, [])

    // Logic
    const handleDigitClick = (digit: number, index: number) => {
        if (!isMyTurn || usedDigitIndices.includes(index)) return
        setExpression((prev) => prev + digit.toString())
        setUsedDigitIndices((prev) => [...prev, index])
        setFeedback("")
    }

    const handleOperatorClick = (op: string) => {
        if (!isMyTurn) return
        setExpression((prev) => prev + op)
        setFeedback("")
    }

    const handleUndo = () => {
        if (!isMyTurn || !expression) return
        const lastChar = expression[expression.length - 1]
        if (!isNaN(Number.parseInt(lastChar))) {
            const digitIndex = digits.findIndex(
                (d: number, i: number) => d.toString() === lastChar && usedDigitIndices.includes(i),
            )
            if (digitIndex !== -1) {
                setUsedDigitIndices((prev) => prev.filter((idx) => idx !== digitIndex))
            }
        }
        setExpression((prev) => prev.slice(0, -1))
        setFeedback("")
    }

    const handleClear = () => {
        setExpression("")
        setUsedDigitIndices([])
        setFeedback("")
    }

    const validateExpression = (expr: string) => {
        if (!expr) return { valid: false, error: "Expression is empty" }

        let balance = 0
        for (const char of expr) {
            if (char === "(") balance++
            if (char === ")") balance--
            if (balance < 0) return { valid: false, error: "Unbalanced parentheses" }
        }
        if (balance !== 0) return { valid: false, error: "Unbalanced parentheses" }
        if (/÷\s*0/.test(expr)) return { valid: false, error: "Cannot divide by zero" }

        return { valid: true }
    }

    const handleSubmit = async () => {
        if (!isMyTurn || !expression || isTimeUp) return
        const validation = validateExpression(expression)
        if (!validation.valid) {
            setFeedback(validation.error || "Invalid expression")
            return
        }

        try {
            const response = await sendAction("submit", expression)
            setFeedback(response ? "Submitted!" : "Submission failed")
        } catch {
            setFeedback("Submission failed")
        }
    }

    // 💡 SHOW WAITING SCREEN if Classic & not my turn
    if (mode === "classic" && !isMyTurn) {
        return <TurnCountdown />
    }

    // --- MAIN GAMEBOARD ---
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{
                backgroundImage: "url('/main_bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="w-full max-w-4xl space-y-6">
                {/* Header Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Timer */}
                    <div className="bg-gradient-to-br from-cyan-700/90 to-cyan-800/90 border-4 border-cyan-400 rounded-2xl p-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="w-6 h-6 text-yellow-400" />
                                <p className="text-sm font-bold text-yellow-400 uppercase tracking-widest">
                                    Time Left
                                </p>
                            </div>
                            <div className="w-full bg-cyan-950/50 rounded-full h-4 overflow-hidden border-2 border-cyan-600">
                                <motion.div
                                    className={`h-full rounded-full ${
                                        timeRemaining <= 10
                                            ? "bg-gradient-to-r from-red-500 to-red-600"
                                            : "bg-gradient-to-r from-green-400 to-emerald-500"
                                    }`}
                                    animate={{ width: `${timerProgress}%` }}
                                    transition={{ duration: 0.1 }}
                                />
                            </div>
                            <p
                                className={`text-center text-3xl font-bold ${
                                    timeRemaining <= 10 ? "text-red-400 animate-pulse" : "text-white"
                                }`}
                            >
                                {timeRemaining}s
                            </p>
                            <p className="text-sm font-bold text-center text-yellow-400 uppercase tracking-widest">
                                My score: {mePlayer?.score ?? 0}
                            </p>
                        </div>
                    </div>

                    {/* Target */}
                    <div className="bg-gradient-to-br from-yellow-500/90 to-orange-500/90 border-4 border-yellow-400 rounded-2xl p-6 text-center">
                        <Target className="w-8 h-8 tracking-wider text-white mx-auto" />
                        <p className="text-xxl font-bold tracking-wider text-white uppercase">Target</p>
                        <p className="text-6xl mt-3 font-black text-white">{target}</p>
                    </div>

                    {/* Players */}
                  <div className="flex flex-col bg-gradient-to-br from-emerald-600/90 to-green-700/90 backdrop-blur-md border-4 border-emerald-400 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Friends</h2>
                    <div className="flex flex-col w-full mt-2">
                      <div className="flex flex-row space-x-4 grow w-full">
                        {otherPlayers.thinking.map((p) => {
                          return <motion.div layout="position" layoutId={`players-${p.id}`} key={p.id}>
                            <img src={p.avatarUri} alt={`profile-${p.id}`} width={32} height={32} className={`rounded-full outline-3 ${p.roundStatus === "solved" ? "outline-green-400" : "outline-gray-400"}`} />
                          </motion.div>
                        })}
                      </div>
                      <h1 className="text-xs font-bold text-white uppercase tracking-wider mt-4">Solved: {otherPlayers.solved.length}</h1>
                      <div className="flex flex-row items-center px-4 space-x-4 mt-2 w-full grow bg-green-800 min-h-[46px] rounded-2xl inset-shadow-2xs inset-shadow-green-900">
                        {otherPlayers.solved.map((p) => {
                          return <motion.div layout="position" layoutId={`players-${p.id}`} key={p.id}>
                            <img src={p.avatarUri} alt={`profile-${p.id}`} width={32} height={32} className={`rounded-full outline-3 ${p.roundStatus === "solved" ? "outline-green-400" : "outline-gray-400"}`} />
                          </motion.div>
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expression */}
                <div>
                    <label className="text-lg font-bold text-white tracking-widest text-center block mb-3 uppercase">
                        Your Expression
                    </label>
                    <div className="flex flex-col bg-gradient-to-br from-emerald-600/90 to-green-700/90 border-4 border-emerald-400 items-center justify-center rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                        <p className="text-2xl text-white text-center break-all font-medium">
                            {expression || "Click digits and operators to build..."}
                        </p>
                    </div>
                </div>

                {/* Digits */}
                <div className="text-center">
                    <p className="text-lg font-bold text-white tracking-widest uppercase mb-3">
                        Available Digits
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        {digits.map((d: number, i: number) => (
                            <DigitKey
                                key={i}
                                digit={d}
                                index={i}
                                isUsed={usedDigitIndices.includes(i)}
                                isMyTurn={isMyTurn}
                                onClick={() => handleDigitClick(d, i)}
                            />
                        ))}
                    </div>

                    <p className="text-lg font-bold text-white tracking-widest uppercase mb-3">Operators</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {["+", "-", "×", "÷", "(", ")"].map((op) => (
                            <OpKey key={op} operator={op} isMyTurn={isMyTurn} onClick={() => handleOperatorClick(op)} />
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-3 gap-4 tracking-widest">
                    <GameButton color="red" onClick={handleClear} disabled={!isMyTurn}>
                        Clear
                    </GameButton>
                    <GameButton color="yellow" onClick={handleUndo} disabled={!isMyTurn || !expression}>
                        Undo
                    </GameButton>
                    <GameButton onClick={handleSubmit} disabled={!isMyTurn || !expression || isTimeUp}>
                        Submit
                    </GameButton>
                </div>

                {/* Feedback */}
                <div className="text-center min-h-[28px]" aria-live="polite">
                    <AnimatePresence mode="wait">
                        {feedback ? (
                            <motion.p
                                key="feedback"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-base text-white font-bold"
                            >
                                {feedback}
                            </motion.p>
                        ) : isTimeUp ? (
                            <motion.p
                                key="timeup"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-base text-red-400 font-bold animate-pulse"
                            >
                                Time&#39;s up!
                            </motion.p>
                        ) : (
                            <motion.p
                                key={`tip-${currentTipIndex}`}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="text-base text-white font-bold"
                            >
                                {HELPER_TIPS[currentTipIndex]}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
