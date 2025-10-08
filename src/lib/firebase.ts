
import { initializeApp } from "firebase/app"


const firebaseConfig = {
  apiKey: "AIzaSyBJfI6aoGTRHknrLpcmaWO_Zr4_x-w1g7Q",
  authDomain: "iq800-game.firebaseapp.com",
  projectId: "iq800-game",
  storageBucket: "iq800-game.firebasestorage.app",
  messagingSenderId: "505089344755",
  appId: "1:505089344755:web:40ffc5b5921812830fa386"
}

export const initFirebase = () => {
  initializeApp(firebaseConfig)
}