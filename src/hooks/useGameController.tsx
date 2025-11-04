"use client"
import {createContext, useCallback, useContext, useEffect, useState} from "react";
import {useConnection} from "@/hooks/useConnection";
import {MsgPayload, Payload} from "@/lib/Payload";


export type GameControllerContextType = {
  /**
   * Sends an action to the game server and waits for a response
   * @param name - The name of the action to send
   * @param data - Optional data payload to send with the action
   * @param timeout - Optional timeout in milliseconds before the request fails (default 5000ms)
   * @returns Promise that resolves with the server response message
   * @throws Error if the request times server_dist_arm64
   */
  sendAction: (name: string, data?: any, timeout?: number) => Promise<MsgPayload | undefined>
}

const defaultContext: GameControllerContextType = {
  sendAction: async () => {throw new Error("not implemented")},
}

export const GameControllerContext = createContext<GameControllerContextType>(defaultContext)

export const GameControllerProvider = ({children}: {children: React.ReactNode}) => {
  return <GameControllerContext.Provider value={useGameControllerAction()}>{children}</GameControllerContext.Provider>
}

export const useGameController = () => {
  return useContext(GameControllerContext)
}

const useGameControllerAction = () => {

  const {rawMsgStream, send, state} = useConnection()
  const [msgListeners, setMsgListeners] = useState<{func: ((msg: MsgPayload) => boolean)}[]>([])


  const publish = useCallback((msg: MsgPayload) => {
    if (msgListeners.length === 0) {
      return
    }
    const reduced = msgListeners.map(listener => {
      const cleanup = listener.func(msg)
      if (cleanup) {
        return undefined
      }
      return listener
    })

    setMsgListeners(reduced.filter(l => l !== undefined) as {func: ((msg: MsgPayload) => boolean)}[])
  }, [msgListeners])


  useEffect(() => {
    console.log("rawMsgStream", rawMsgStream)
    publish(rawMsgStream.msgBuffer[0])
  }, [rawMsgStream.msgBuffer]);

  const sendAction = useCallback(async (name: string, data?: any, timeout?: number) => {
    const TIMEOUT = timeout ?? 5 * 1000
    const cmsg = new MsgPayload({group: "client-action", name, data})
    const result = new Promise<MsgPayload | undefined>((resolve, reject) => {
      const t = setTimeout(() => {
        resolve(undefined)
      }, TIMEOUT)

      console.log("send", cmsg)

      const l = (msg: any) => {
        if (msg.getName() === name) {
          if (msg.getMsgId() !== cmsg.getMsgId()) {
            return false
          }
          clearTimeout(t)
          resolve(msg)
          return true
        }
        return false
      }

      setMsgListeners((prev) => {
        return [...prev, {func: l}]
      })
    })

    send(cmsg)

    return result
  }, [send, setMsgListeners])

  return {
    sendAction
  }
}