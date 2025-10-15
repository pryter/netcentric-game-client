"use client"

import {useState, useEffect, useMemo} from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useFrameController } from "@/hooks/useFrameController"
import { useGameController } from "@/hooks/useGameController"
import { Target, Clock } from "lucide-react"
import {OriginalRoomFrame} from "@/lib/types";
import {useConnection} from "@/hooks/useConnection";
import Image from "next/image";
import {GameButton} from "@/components/Button";

// Helper tips that rotate
const HELPER_TIPS = [
  "Use each digit once.",
  "Hint: Parentheses can change everything.",
  "Hint: Avoid ÷0.",
  "Submit before time's up!",
]

const MOCK_FRAME = {
  digits: [3, 7, 2, 9, 5],
  target: 24,
  me: "player1",
  turn: "player1",
  turnStartedAt: Date.now(),
  turnDurationMs: 60000,
}

// Digit button subcomponent with motion
function DigitKey({
  digit,
  index,
  isUsed,
  isMyTurn,
  onClick,
}: {
  digit: number
  index: number
  isUsed: boolean
  isMyTurn: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={!isUsed && isMyTurn ? { scale: 1.05 } : {}}
      whileTap={!isUsed && isMyTurn ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={!isMyTurn || isUsed}
      className={`
        w-20 h-20 text-3xl font-black rounded-2xl
        transition-all duration-200
        focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2
        ${
          isUsed
            ? "bg-gray-600/50 text-gray-400 cursor-not-allowed opacity-50 border-2 border-gray-500"
            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 border-2 border-blue-400 shadow-[0_4px_0_rgba(37,99,235,0.8)] active:shadow-[0_2px_0_rgba(37,99,235,0.8)] active:translate-y-[2px]"
        }
      `}
      aria-label={`Digit ${digit}${isUsed ? " (used)" : ""}`}
    >
      {digit}
    </motion.button>
  )
}

// Operator button subcomponent with motion
function OpKey({
  operator,
  isMyTurn,
  onClick,
}: {
  operator: string
  isMyTurn: boolean
  onClick: () => void
}) {
  return (
    <motion.button
      whileHover={isMyTurn ? { scale: 1.05 } : {}}
      whileTap={isMyTurn ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={!isMyTurn}
      className="
        w-16 h-16 text-2xl font-black rounded-2xl
        bg-gradient-to-br from-purple-500 to-purple-600 text-white
        hover:from-purple-400 hover:to-purple-500
        border-2 border-purple-400
        shadow-[0_4px_0_rgba(147,51,234,0.8)] active:shadow-[0_2px_0_rgba(147,51,234,0.8)] active:translate-y-[2px]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
        focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2
      "
      aria-label={`Operator ${operator}`}
    >
      {operator}
    </motion.button>
  )
}

export function GameBoard() {
  const { currentFrame } = useFrameController<OriginalRoomFrame>()
  const {serverUser} = useConnection()
  const { sendAction } = useGameController()

  const [expression, setExpression] = useState("")
  const [usedDigitIndices, setUsedDigitIndices] = useState<number[]>([])
  const [feedback, setFeedback] = useState("")
  const [currentTipIndex, setCurrentTipIndex] = useState(0)

  const frame = currentFrame

  // Extract data from frame
  const digits = frame?.question?.problem || []
  const target = frame?.question?.target || 0
  const me = serverUser

  const isMyTurn = true

  const maxTurn = 60

  const timerProgress = useMemo(() => {
    if (!currentFrame) {
      return 0
    }
    return (currentFrame?.timer / maxTurn) * 100
  }, [currentFrame])

  const isTimeUp = currentFrame && (currentFrame?.timer <= 0)
  const timeRemaining = Math.round(currentFrame?.timer ?? 0)

  const otherPlayers = useMemo(() => {
    return {
      thinking: Object.values(currentFrame?.players ?? {}).filter((p) => p.roundStatus === "thinking"),
      solved: Object.values(currentFrame?.players ?? {}).filter((p) => p.roundStatus === "solved")
    }
  }, [currentFrame])

  // Rotate helper tips every 6 sec // bonus maybe?
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % HELPER_TIPS.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Handle digit click
  const handleDigitClick = (digit: number, index: number) => {
    if (!isMyTurn || usedDigitIndices.includes(index)) return
    setExpression((prev) => prev + digit.toString())
    setUsedDigitIndices((prev) => [...prev, index])
    setFeedback("")
  }

  // Handle operator click
  const handleOperatorClick = (op: string) => {
    if (!isMyTurn) return
    setExpression((prev) => prev + op)
    setFeedback("")
  }

  // Undo last character
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

  // Clear expression
  const handleClear = () => {
    setExpression("")
    setUsedDigitIndices([])
    setFeedback("")
  }

  // Validate expression
  const validateExpression = (expr: string): { valid: boolean; error?: string } => {
    if (!expr) return { valid: false, error: "Expression is empty" }

    // Check balanced parentheses
    let balance = 0
    for (const char of expr) {
      if (char === "(") balance++
      if (char === ")") balance--
      if (balance < 0) return { valid: false, error: "Unbalanced parentheses" }
    }
    if (balance !== 0) return { valid: false, error: "Unbalanced parentheses" }

    // Check for divide by zero patterns
    if (/÷\s*0/.test(expr) || /÷\s*$$0$$/.test(expr)) {
      return { valid: false, error: "Cannot divide by zero" }
    }

    return { valid: true }
  }

  // Submit expression
  const handleSubmit = async () => {
    if (!isMyTurn || !expression || isTimeUp) return

    const validation = validateExpression(expression)
    if (!validation.valid) {
      setFeedback(validation.error || "Invalid expression")
      return
    }

    try {
      if (currentFrame) {
        const response = await sendAction("submit", expression)
        console.log("response", response, expression)
        if (response) {
          setFeedback("Submitted!")
        }else{
          setFeedback("Submission failed")
        }
      }
    } catch (error) {
      setFeedback("Submission failed")
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/main_bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-4xl space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Target */}
          <div className="bg-gradient-to-br from-yellow-500/90 to-orange-500/90 backdrop-blur-md border-4 border-yellow-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <div className="flex flex-col items-center gap-2">
              <Target className="w-8 h-8 text-white" aria-hidden="true" />
              <p className="text-sm font-bold text-white uppercase tracking-wider">Target</p>
              <p className="text-5xl font-black text-white drop-shadow-lg">{target}</p>
            </div>
          </div>

          {/* Timer */}
          <div className="bg-gradient-to-br from-cyan-700/90 to-cyan-800/90 backdrop-blur-md border-4 border-cyan-400 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.4)]">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-6 h-6 text-yellow-400" aria-hidden="true" />
                <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Time Left</p>
              </div>
              <div className="w-full bg-cyan-950/50 rounded-full h-4 overflow-hidden border-2 border-cyan-600">
                <motion.div
                  className={`h-full rounded-full ${timeRemaining <= 10 ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-green-400 to-emerald-500"}`}
                  initial={{ width: "100%" }}
                  animate={{ width: `${timerProgress}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
              <p
                className={`text-center text-3xl font-bold ${timeRemaining <= 10 ? "text-red-400 animate-pulse" : "text-white"}`}
              >
                {timeRemaining}s
              </p>
            </div>
          </div>

          {/* Turn indicator */}
          <div className="flex flex-col bg-gradient-to-br from-emerald-600/90 to-green-700/90 backdrop-blur-md border-4 border-emerald-400 rounded-2xl px-6 py-4 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
            <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Friends</h2>
            <div className="flex flex-col w-full mt-2">
              <div className="flex flex-row space-x-4 grow w-full">
                {otherPlayers.thinking.map((p) => {
                  return <motion.div layout="position" layoutId="player" key={p.id}>
                    <Image key={`img-p-${p.id}`} src={p.avatarUri} alt={"profile"} width={32} height={32} className={`rounded-full outline-3 ${p.roundStatus === "solved" ? "outline-green-400" : "outline-gray-400"}`} />
                  </motion.div>
                })}
              </div>
              <h1 className="text-xs font-bold text-white uppercase tracking-wider mt-4">Solved: {otherPlayers.solved.length}</h1>
              <div className="flex flex-row items-center px-4 space-x-4 mt-2 w-full grow bg-green-800 min-h-[46px] rounded-2xl inset-shadow-2xs inset-shadow-green-900">
                {otherPlayers.solved.map((p) => {
                  return <motion.div layout="position" layoutId="player" key={p.id}>
                    <Image key={`img-p-${p.id}`} src={p.avatarUri} alt={"profile"} width={32} height={32} className={`rounded-full outline-3 ${p.roundStatus === "solved" ? "outline-green-400" : "outline-gray-400"}`} />
                  </motion.div>
                })}
              </div>
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="expression-display"
            className="text-lg font-bold  text-white uppercase tracking-wider mb-3 block drop-shadow-lg"
          >
            Your Expression
          </label>
          <div
            id="expression-display"
            className="bg-gradient-to-br from-cyan-800/90 to-cyan-900/90 backdrop-blur-md border-4 border-cyan-400 rounded-2xl p-8 min-h-[100px] flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.3)]"
            aria-label="Math expression editor"
            aria-live="polite"
          >
            <p className="text-3xl font-mono text-white text-center break-all font-medium">
              {expression || "Click digits and operators to build..."}
            </p>
          </div>
        </div>

        <div>
          <p className="text-lg font-bold  text-white uppercase tracking-wider mb-3 drop-shadow-lg">
            Available Digits (use each once)
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {digits.map((digit: number, index: number) => (
              <DigitKey
                key={index}
                digit={digit}
                index={index}
                isUsed={usedDigitIndices.includes(index)}
                isMyTurn={isMyTurn}
                onClick={() => handleDigitClick(digit, index)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-lg font-bold  text-white uppercase tracking-wider mb-3 drop-shadow-lg">Operators</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["+", "-", "×", "÷", "(", ")"].map((op) => (
              <OpKey key={op} operator={op} isMyTurn={isMyTurn} onClick={() => handleOperatorClick(op)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <GameButton
            color={"red"}
            onClick={handleClear}
            disabled={!isMyTurn}
            className="
              h-14 px-6 rounded-xl font-bold text-lg text-white
            "
          >
            Clear
          </GameButton>
          <GameButton
            color={"yellow"}
            onClick={handleUndo}
            disabled={!isMyTurn || !expression}
            className="
              h-14 px-6 rounded-xl font-bold text-lg text-white
            "
          >
            Undo
          </GameButton>
          <GameButton
            onClick={handleSubmit}
            disabled={!isMyTurn || !expression || isTimeUp}
            className="h-14 px-6 rounded-xl font-bold text-lg text-white"
          >
            Submit
          </GameButton>
        </div>

        <div className="text-center min-h-[28px]" aria-live="polite">
          <AnimatePresence mode="wait">
            {feedback ? (
              <motion.p
                key="feedback"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-base text-red-400 font-bold drop-shadow-lg"
              >
                {feedback}
              </motion.p>
            ) : isTimeUp ? (
              <motion.p
                key="timeup"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-base text-red-400 font-bold drop-shadow-lg animate-pulse"
              >
                Time&#39;s up!
              </motion.p>
            ) : (
              <motion.p
                key={`tip-${currentTipIndex}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-base text-red-400 font-bold drop-shadow-lg"
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
