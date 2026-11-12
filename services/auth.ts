
import {
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { auth } from "../config/firebase";

export function login(email: string, password: string) {
  return signInWithEmailAndPassword(
    auth,
    email.trim(),
    password
  );
}

export function forgotPassword(email: string) {
  return sendPasswordResetEmail(auth, email.trim());
}

export function logout() {
  return signOut(auth);
}
