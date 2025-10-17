'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { errorEmitter } from './error-emitter';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // We don't create a custom error here as auth errors are usually descriptive
    // enough and don't involve security rules in the same way as Firestore.
    console.error("Anonymous Sign-In Error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      // Re-throw to be caught by the calling component's try/catch
      throw error;
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password)
    .catch(error => {
      // Re-throw to be caught by the calling component's try/catch
      throw error;
    });
}
