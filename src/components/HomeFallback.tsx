"use client"
import Link from "next/link";

export const HomeFallback = () => {
  return <div className="min-h-screen w-full flex items-center justify-center">
    <Link href={"/mode"}>Back to home</Link>
  </div>
}