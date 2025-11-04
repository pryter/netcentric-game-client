"use client"

import {createContext, useContext, useEffect, useState} from "react";
import {getAuth, GoogleAuthProvider, signInWithPopup, User} from "firebase/auth";
import {initFirebase} from "@/lib/firebase";
import {useConnection} from "@/hooks/useConnection";
import {Payload} from "@/lib/Payload";

export type ClientAccountContextType = {
  signIn: () => void,
  signOut: () => void,
  user: User | null | undefined,
}

const defaultContext: ClientAccountContextType = {
  signIn: () => {},
  signOut: () => {},
  user: null,
}

export const ClientAccountContext = createContext<ClientAccountContextType>(defaultContext)

export const useClientAccount = () => {
  return useContext(ClientAccountContext)
}

export const ClientAccountContextProvider = ({children}: {children: React.ReactNode}) => {
  return <ClientAccountContext.Provider value={useClientAccountAction()}>{
children
  }</ClientAccountContext.Provider>
}

const useClientAccountAction = () => {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const {send, isAuthenticated, reConnect} = useConnection()
  initFirebase()
  const auth = getAuth()

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user)
    })
  }, [])

  useEffect(() => {
    setUser(auth.currentUser)
  }, [auth.currentUser]);

  useEffect(() => {
    if (user) {
      if (!isAuthenticated()) {
        user.getIdToken().then((token) => {
          send(new Payload("upgrade", {token: token}))
        })
      }
    }
  }, [user, send, isAuthenticated]);

  const signIn = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()

    const res = await signInWithPopup(auth, provider)

    // send upgrade token to the server

  }

  const signOut = () => {
    const auth = getAuth()
    auth.signOut()

    reConnect()
  }

  return {
    signIn,
    signOut,
    user,
  }
}