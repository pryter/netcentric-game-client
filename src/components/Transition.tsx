"use client"
import {AnimatePresence, motion} from "framer-motion"
import {ReactNode} from "react";
import {usePathname, useRouter} from "next/navigation";

export const Transition = ({children}: {children: ReactNode}) => {

  const pathname = usePathname()

  return <motion.div key={pathname} animate={{opacity: 1}} initial={{opacity: 0.6}} exit={{opacity:0.6}} transition={{duration: 0.4}}>
      {children}
    </motion.div>
}