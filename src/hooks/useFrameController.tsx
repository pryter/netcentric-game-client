"use client"
import {createContext, useContext, useEffect, useMemo, useState} from "react";
import {RoomFrame} from "@/lib/types";
import {defaultRawFrameStream, RawFrameStream, useConnection} from "@/hooks/useConnection";


export type FrameControllerContextType = {
  /** Raw frame stream containing buffer of frames and stream end status */
  rawFrameStream: RawFrameStream,
  /** Current active frame being displayed, undefined if no frames available */
  currentFrame: RoomFrame | undefined,
}

const defaultContext: FrameControllerContextType = {
  rawFrameStream: defaultRawFrameStream,
  currentFrame: undefined,
}

export const FrameControllerContext = createContext<FrameControllerContextType>(defaultContext)

export const useFrameController = () => {
  return useContext(FrameControllerContext)
}

export const FrameControllerProvider = ({children}: {children: React.ReactNode}) => {
  return <FrameControllerContext.Provider value={useFrameControllerAction()}>
    {children}
  </FrameControllerContext.Provider>
}


const useFrameControllerAction = (): FrameControllerContextType => {
  const {rawFrameStream} = useConnection()

  const currentFrame = useMemo(() => {
    return rawFrameStream.frameBuffer[0]
  }, [rawFrameStream.frameBuffer])

  return {
    rawFrameStream,
    currentFrame,
  }
}