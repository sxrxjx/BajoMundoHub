import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEY6...", // Tus credenciales reales ya están aquí
  authDomain: "bajo-mundo-hub.firebaseapp.com",
  projectId: "bajo-mundo-hub",
  storageBucket: "bajo-mundo-hub.firebasestorage.app",
  messagingSenderId: "36725340638",
  appId: "1:36725340638:web:75368a48b9f6f698e597c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
