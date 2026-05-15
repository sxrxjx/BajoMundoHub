import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRKsMC_0MP27gf_lOv2XUp_SR9HNXHrxI",
  authDomain: "bajo-mundo-hub.firebaseapp.com",
  projectId: "bajo-mundo-hub",
  storageBucket: "bajo-mundo-hub.firebasestorage.app",
  messagingSenderId: "1004944715342",
  appId: "1:1004944715342:web:e832996d0845f1feb0dd1f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
