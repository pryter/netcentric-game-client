"use client"

import {motion, TargetAndTransition, VariantLabels} from "framer-motion";
import {FC, ReactNode, useMemo} from "react";
import classNames from "classnames";

type ButtonProps = {
  className?: string,
  disabled?: boolean,
  children: ReactNode,
  onClick?: () => void,
  color?: keyof typeof colorCombination,
}
export const SquareButton: FC<ButtonProps> = ({className = "px-6 py-4 text-white", children, onClick}) => {
  return    <motion.button onClick={onClick} className={"relative pt-[6px] cursor-pointer"
  }>
    <div className={classNames(className, "relative z-[1] bg-sky-600 outline-4 outline-white")}>
      {children}
    </div>
    <motion.div whileHover={{y: 4}} whileTap={{y: 8, scaleY: 0.92}} className={classNames(className, "absolute top-0 z-[1] bg-sky-400 outline-white")}>
      {children}
    </motion.div>
  </motion.button>
}

export const RoundedButton: FC<ButtonProps> = ({className = "px-6 py-4 text-white", children, onClick}) => {
  return    <motion.button onClick={onClick} className={"relative pt-[6px] cursor-pointer"
  }>
    <div className={classNames(className, "relative z-[1] bg-[#08B9FF] overflow-clip outline-4 outline-white")}>
      {children}
    </div>
    <motion.div whileHover={{y: 4}} whileTap={{y: 8, scaleY: 0.92}} className={classNames(className, "absolute top-0 overflow-clip z-[1] bg-[#94E7FC] outline-white")}>
      <div className="absolute h-full w-1/2 top-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute h-full top-0 left-[-10px]" viewBox="0 0 56 30" fill="none">
          <path d="M48.042 0C52.4601 0.000173171 56.042 3.58183 56.042 8V23.3545C56.0418 27.7725 52.46 31.3543 48.042 31.3545H27.6016L0.379883 0H48.042Z" fill="#4CDAFE"/>
        </svg>
        <div className="w-1/2 absolute right-0 h-full top-0 bg-[#4CDAFE]"/>
      </div>
      <span className="relative z-1">
              {children}
      </span>
    </motion.div>
  </motion.button>
}

const colorCombination = {
  red: {
    400: "oklch(0.704 0.191 22.216)",
    500: "oklch(0.637 0.237 25.331)",
    600: "oklch(0.577 0.245 27.325)"
  },
  orange: {
    400: "oklch(0.75 0.183 55.934)",
    500: "oklch(0.705 0.213 47.604)",
    600: "oklch(0.646 0.222 41.116)"
  },
  amber: {
    400: "oklch(0.828 0.189 84.429)",
    500: "oklch(0.769 0.188 70.08)",
    600: "oklch(0.666 0.179 58.318)"
  },
  yellow: {
    400: "oklch(0.852 0.199 91.936)",
    500: "oklch(0.795 0.184 86.047)",
    600: "oklch(0.681 0.162 75.834)"
  },
  lime: {
    400: "oklch(0.841 0.238 128.85)",
    500: "oklch(0.768 0.233 130.85)",
    600: "oklch(0.648 0.2 131.684)"
  },
  green: {
    400: "oklch(0.792 0.209 151.711)",
    500: "oklch(0.723 0.219 149.579)",
    600: "oklch(0.627 0.194 149.214)"
  },
  emerald: {
    400: "oklch(0.765 0.177 163.223)",
    500: "oklch(0.696 0.17 162.48)",
    600: "oklch(0.596 0.145 163.225)"
  },
  teal: {
    400: "oklch(0.777 0.152 181.912)",
    500: "oklch(0.704 0.14 182.503)",
    600: "oklch(0.6 0.118 184.704)"
  },
  cyan: {
    400: "oklch(0.789 0.154 211.53)",
    500: "oklch(0.715 0.143 215.221)",
    600: "oklch(0.609 0.126 221.723)"
  },
  sky: {
    400: "oklch(0.746 0.16 232.661)",
    500: "oklch(0.685 0.169 237.323)",
    600: "oklch(0.588 0.158 241.966)"
  },
  blue: {
    400: "oklch(0.707 0.165 254.624)",
    500: "oklch(0.623 0.214 259.815)",
    600: "oklch(0.546 0.245 262.881)"
  },
  indigo: {
    400: "oklch(0.673 0.182 276.935)",
    500: "oklch(0.585 0.233 277.117)",
    600: "oklch(0.511 0.262 276.966)"
  },
  violet: {
    400: "oklch(0.702 0.183 293.541)",
    500: "oklch(0.606 0.25 292.717)",
    600: "oklch(0.541 0.281 293.009)"
  },
  purple: {
    400: "oklch(0.714 0.203 305.504)",
    500: "oklch(0.627 0.265 303.9)",
    600: "oklch(0.558 0.288 302.321)"
  },
  fuchsia: {
    400: "oklch(0.74 0.238 322.16)",
    500: "oklch(0.667 0.295 322.15)",
    600: "oklch(0.591 0.293 322.896)"
  },
  pink: {
    400: "oklch(0.718 0.202 349.761)",
    500: "oklch(0.656 0.241 354.308)",
    600: "oklch(0.592 0.249 0.584)"
  },
  rose: {
    400: "oklch(0.712 0.194 13.428)",
    500: "oklch(0.645 0.246 16.439)",
    600: "oklch(0.586 0.253 17.585)"
  },
  slate: {
    400: "oklch(0.704 0.04 256.788)",
    500: "oklch(0.554 0.046 257.417)",
    600: "oklch(0.446 0.043 257.281)"
  },
  gray: {
    400: "oklch(0.707 0.022 261.325)",
    500: "oklch(0.551 0.027 264.364)",
    600: "oklch(0.446 0.03 256.802)"
  },
  zinc: {
    400: "oklch(0.705 0.015 286.067)",
    500: "oklch(0.552 0.016 285.938)",
    600: "oklch(0.442 0.017 285.786)"
  },
  neutral: {
    400: "oklch(0.708 0 0)",
    500: "oklch(0.556 0 0)",
    600: "oklch(0.439 0 0)"
  },
  stone: {
    400: "oklch(0.709 0.01 56.259)",
    500: "oklch(0.553 0.013 58.071)",
    600: "oklch(0.444 0.011 73.639)"
  }
};

const applyAlpha = (oklchstr: string, alpha: string,shadowStr: string) => {
  return shadowStr + oklchstr.replace(/ /g, "_").replace(")", `/${alpha})`)
}

export const GameButton = (props: ButtonProps) => {
  const {onClick, children, color, className, disabled} = props;
  const defaultCN = className || 'px-8 py-2 text-2xl font-black rounded-2xl text-white';

  const colorPalette = useMemo(() => {
    return colorCombination[color ?? "purple"]
  }, [color])

  const hoverStyle: TargetAndTransition = {
    scale: 0.99,
    background: `linear-gradient(45deg, ${colorPalette["400"]}, ${colorPalette["500"]})`
  }

  const tapStyle: TargetAndTransition = {
    scale: 0.98,
    background: `linear-gradient(45deg, ${colorPalette["500"]}, ${colorPalette["600"]})`
  }

  return   <motion.button
    disabled={disabled}
    initial={{background: `linear-gradient(45deg, ${colorPalette["500"]}, ${colorPalette["600"]})`, borderColor: colorPalette["400"]}}
    style={{boxShadow: `0 4px 0 color-mix(in oklab, ${colorPalette["600"]} 80%, transparent)`}}
    animate={{borderColor: colorPalette["400"], background: `linear-gradient(45deg, ${colorPalette["500"]}, ${colorPalette["600"]})`}}
    whileHover={hoverStyle}
    whileTap={tapStyle}
    onClick={onClick}
    className={classNames(defaultCN, `cursor-pointer bg-gradient-to-br
      border-2 transition-all duration-200
      disabled:opacity-50 disabled:shadow-none focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:ring-offset-2`)}
    aria-label={`s`}
  >
    {children}
  </motion.button>
}