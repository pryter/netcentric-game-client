"use client"
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {FramePayload, MsgPayload, Payload} from "@/lib/Payload";
import {useClientAccount} from "@/hooks/useClientAccount";
import {useRouter} from "next/navigation";
const MAX_BUFFER_SIZE = 20
import Image from "next/image";
import classNames from "classnames";
export const defaultRawFrameStream: RawFrameStream<any> = {
  frameBuffer: [],
  isStreamEnd: false,
}

export const defaultRawMsgStream: RawMsgStream = {
  msgBuffer: [],
}

export type RawMsgStream = {
  msgBuffer: MsgPayload[],
}

export type RawFrameStream<T extends Record<string, any>> = {
  frameBuffer: T[],
  isStreamEnd: boolean
}



type ConnectionContextType = {
  /**
   * Checks if the WebSocket connection is established
   * @returns void
   */
  isConnected: () => void

  /**
   * Checks if the user is authenticated with the server
   * @returns boolean indicating authentication status
   */
  isAuthenticated: () => boolean

  /**
   * Establishes a WebSocket connection with the specified URL
   * @param url The WebSocket server URL to connect to
   */
  connect: (url: string) => void

  /**
   * Stream containing room frame data for real-time game state updates
   * Contains frameBuffer array and stream end status
   */
  rawFrameStream: RawFrameStream<any>

  /**
   * Stream containing message payloads for real-time communication
   * Contains message buffer array for recent messages
   */
  rawMsgStream: RawMsgStream

  /**
   * Sends a payload message through the WebSocket connection
   * @param msg The payload object to send
   */
  send: (msg: Payload) => void

  /**
   * Navigation guard that redirects to specified path based on connection state
   * @param to The target path to redirect to
   */
  useGuard: (to: string) => void

  /**
   * Current connection state
   * Can be: "disconnected", "connected", "authenticated", or "waiting-for-registration"
   */
  state: "disconnected" | "connected" | "authenticated" | "waiting-for-registration"

  /**
   * User data received from server after authentication
   * Contains user ID, nickname, level, score and avatar information
   * Null if not authenticated
   */
  serverUser: ServerUser | null

  /**
   * Reconnects to the WebSocket server by closing existing connection
   * and establishing a new one
   */
  reConnect: () => void
}

const defaultContext: ConnectionContextType = {
  isConnected: () => {},
  isAuthenticated: () => false,
  connect: () => {},
  send: () => {},
  rawFrameStream: defaultRawFrameStream,
  rawMsgStream: defaultRawMsgStream,
  useGuard: () => {},
  state: "disconnected",
  serverUser: null,
  reConnect: () => {}
}
export const ConnectionContext = createContext<ConnectionContextType>(defaultContext)

export const useConnection = () => useContext(ConnectionContext)
export const ConnectionProvider = ({children}: {children: ReactNode}) => {

  const v = useConnectionContextAction()
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    if (v.state !== "disconnected") {
      setTimeout(() => {
        setLoading(false)
      }, 1 * 1000)
    }else{
      setLoading(true)
    }
  }, [v.state])

  return <ConnectionContext.Provider value={v}>
    {<div className={classNames("flex items-center justify-center h-screen w-screen absolute top-0 left-0 z-[100]", !loading && "hidden")}>
        <Image src="/assets/loading_bg.png" alt="bg" fill={true}/>
        <div className="h-screen w-screen absolute top-0 left-0  bg-[rgba(0,0,0,0.5)] backdrop-blur-[4px]"/>
        <div className="z-[101] relative w-full flex items-center justify-center">
          <h1 style={{fontSize: "30px"}} className="animate-pulse font-black text-white">Connecting..</h1>
        </div>
    </div>}
    {children}
  </ConnectionContext.Provider>
}

export type ServerUser ={
  uid: string,
  nickname?: string,
  level: number,
  score: number,
  avatar?: string | undefined,
}

const useConnectionContextAction = () => {
  const [state, setState] = useState<"disconnected" | "connected" | "authenticated">("disconnected")
  const [conn, setConn] = useState<WebSocket | null>(null)
  const [serverUser, setServerUser] = useState<ServerUser | null>(null)
  const [frameBuffer, setFrameBuffer] = useState<Record<string, any>[]>([])
  const [msgBuffer, setMsgBuffer] = useState<MsgPayload[]>([])
  const [isEnd, setIsEnd] = useState<boolean>(false)
  const [reconnect, setReconnect] = useState<boolean>(true)
  const [tries, setTries] = useState<number>(0)
  const router = useRouter()

  const isConnected = useCallback(() => {
    return state === "connected"
  }, [state])

  const isAuthenticated = useCallback(() => {
    return state === "authenticated"
  }, [state])

  const disconnect = useCallback(() => {
    conn?.close()
  }, [conn])

  const reConnect = () => {
    disconnect()
    connect("ws://localhost:8080/ws")
  }

  const connect = (url: string) => {

    if (conn) {
      console.log("already connected")
      return
    }

    const ws = new WebSocket(url)
    ws.onopen = (e) => {
      //reset
      setReconnect(true)
      setTries(0)
      setState("connected")
    }

    // handle handshake
    ws.onmessage = (ev) => {
      const unpacked = new Payload(ev.data)
      if (unpacked.getType() === "upgrade") {
        const result = unpacked.getData()
        if (result.status > 0) {
          // upgrade error
        }else{
          if (result.userData) {
            setServerUser(result.userData)
          }
          setState("authenticated")
        }
        return;
      }
      if (unpacked.getType() === "handshake") {
        const id = unpacked.getData() as string
        if (id) {
          setConn(ws)
        }
        return;
      }
      if (unpacked.getType() === "message") {
        if (unpacked.getData().name === "close-connection") {
          console.log(unpacked.getData())
          if (unpacked.getData().data === "duplicated-connection") {
            // prevent reconnect to duplicated-connection
            setReconnect(false)
          }
        }

        if (unpacked.getData().group === "credential") {
          // sepecial message
          if (unpacked.getData().name === "server-user") {
            if (unpacked.getData().status > 0) {
              setServerUser(unpacked.getData().data as ServerUser)
            }
          }
          return;
        }

        setMsgBuffer((prev) => {
          if (prev.length >= MAX_BUFFER_SIZE) {
            prev.pop()
          }
          return [new MsgPayload(unpacked.getData()), ...prev]
        })
      } else if (unpacked.getType() === "frame") {
        const f = new FramePayload(unpacked.getData())
        if (f.isEOFrame()) {
          setIsEnd(true)
          return
        }

        setFrameBuffer((prev) => {
          if (prev.length >= MAX_BUFFER_SIZE) {
            prev.pop()
          }
          return [f.getFrame() as Record<string, any>, ...prev]
        })
      }
    }

    const clear = () => {
      console.log("terminated connection")
      setState("disconnected")
      setConn(null)
      ws.close()
    }

    ws.onerror = (e) => {
      clear()
    }

    ws.onclose = () => {
      clear()
    }
  }

  useEffect(() => {
    if (tries >= 5) {
      // auto stop reconnect
      setReconnect(false)
    }
  }, [tries]);

  useEffect(() => {
    if (!conn) {
      if (reconnect) {
        connect("ws://localhost:8080/ws")
        setTries(prev => (prev + 1))
      }
    }
  }, [conn, reconnect])

  const useGuard = (to: string = "/") => {
    useEffect(() => {
      if (state === "connected") {
        router.push(to)
      }
    }, [state, router]);
  }

  const send = useCallback((msg: Payload) => {
    if (!conn) return
    conn.send(msg.serialize())
  }, [conn])

  return {
    isConnected,
    connect,
    send,
    rawFrameStream: {
      frameBuffer,
      isStreamEnd: isEnd,
    },
    rawMsgStream: {
      msgBuffer,
    },
    isAuthenticated,
    useGuard,
    state,
    serverUser,
    reConnect,
  }
}