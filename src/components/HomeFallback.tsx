"use client"
import Link from "next/link";

export const HomeFallback = () => {
  return <div style={{background: "radial-gradient(50% 50% at 50% 50%, #A659FE 0%, #6F53FD 100%)"}} className="min-h-screen w-full flex items-center justify-center">
    <Link className="text-white text-xl" href={"/mode"}>Back to home</Link>
  </div>
}