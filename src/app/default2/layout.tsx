"use client"
import {FrameControllerProvider} from "@/hooks/useFrameController";
import {GameControllerProvider} from "@/hooks/useGameController";
import {Suspense} from "react";
import {HomeFallback} from "@/components/HomeFallback";

export default function Layout({children}: {children: React.ReactNode}) {

  return <FrameControllerProvider>
    <GameControllerProvider>
      <Suspense fallback={<HomeFallback/>}>
      {children}
      </Suspense>
    </GameControllerProvider>
  </FrameControllerProvider>
}