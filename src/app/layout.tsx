import type { Metadata } from "next";
import {Changa, Comic_Neue} from "next/font/google";
import "./globals.css";
import {ConnectionProvider} from "@/hooks/useConnection";
import {ClientAccountContextProvider} from "@/hooks/useClientAccount";

const comicNue = Changa({weight: ["300", "400","500","600", "700"]})

export const metadata: Metadata = {
  title: "IQ180 game",
  description: "IQ180 Game",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${comicNue.className} antialiased`}
      >
      <ConnectionProvider>
        <ClientAccountContextProvider>
          {children}
        </ClientAccountContextProvider>
      </ConnectionProvider>
      </body>
    </html>
  );
}
