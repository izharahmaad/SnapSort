import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCVY6WprFGUTMIpfwqI5mAwGTX5rdFu_jQ",
  authDomain: "snapsort-b4610.firebaseapp.com",
  projectId: "snapsort-b4610",
  storageBucket: "snapsort-b4610.firebasestorage.app",
  messagingSenderId: "963813757593",
  appId: "1:963813757593:web:8e8d8f57bd1ac33c795e08",
};

const firebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

let auth;

try {
  auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  auth = getAuth(firebaseApp);
}

export { auth };

export const db = getFirestore(firebaseApp);

export function observeAuth(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback);
}