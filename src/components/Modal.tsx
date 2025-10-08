"use client"
import { motion } from "framer-motion";
import {Dispatch, FC, ReactNode, useEffect, useState} from "react";
import classNames from "classnames";


export const Modal = ({children, state}: {children: ReactNode, state: boolean}) => {

  const [isHidden, setIsHidden] = useState(false)

  useEffect(() => {
    if (state) {
      setIsHidden(false)
    }
  }, [state]);

  return <motion.div onAnimationComplete={() => {
    if (!state) {
      setIsHidden(true)
    }
  }} initial={{opacity: state ? 1 : 0}} animate={state ? {opacity: 1} : {opacity: 0}} className={classNames("fixed top-0 z-[99] left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex backdrop-blur-sm justify-center items-center", isHidden ? "hidden" : "fixed")}>
    {children}
  </motion.div>
}