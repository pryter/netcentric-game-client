"use client"

import {motion} from "framer-motion";
import {FC, ReactNode} from "react";
import classNames from "classnames";

type ButtonProps = {
  className?: string,
  children: ReactNode,
  onClick?: () => void,
}
export const GameButton: FC<ButtonProps> = ({className, children, onClick}) => {
  return    <motion.button onClick={onClick} whileHover={{scale: 1.05}} whileTap={{scale: 1}} className={
    classNames(className, "text-2xl cursor-pointer font-semibold py-2 px-6 rounded-xl shadow-md")
  }>
    {children}
  </motion.button>
}