import {FrameControllerProvider} from "@/hooks/useFrameController";
import {GameControllerProvider} from "@/hooks/useGameController";

export default function Layout({children}: {children: React.ReactNode}) {

  return <GameControllerProvider>
      {children}
    </GameControllerProvider>
}