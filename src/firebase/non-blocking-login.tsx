'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { initialBudgets, initialTransactions } from '@/lib/data';
import { setDocumentNonBlocking, addDocumentNonBlocking } from './non-blocking-updates';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance).catch(error => {
    // We don't create a custom error here as auth errors are usually descriptive
    // enough and don't involve security rules in the same way as Firestore.
    console.error("Anonymous Sign-In Error:", error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string): Promise<void> {
    try {
        const userCredential = await createUserWithEmailAndPassword(authInstance, email, password);
        const user = userCredential.user;

        // 1. Update the user's profile
        await updateProfile(user, { displayName });

        // 2. Create the user document in Firestore
        const { firestore } = getSdks(authInstance.app);
        const userDocRef = doc(firestore, 'users', user.uid);
        const userData = {
            id: user.uid,
            email: user.email,
            name: displayName,
        };
        // Use non-blocking write
        setDocumentNonBlocking(userDocRef, userData, { merge: true });

        // 3. Add initial data for the new user (budgets and transactions)
        const budgetsColRef = collection(firestore, 'users', user.uid, 'budgets');
        for (const budget of initialBudgets) {
            const budgetDocRef = doc(budgetsColRef, budget.id);
            addDocumentNonBlocking(budgetsColRef, budget);
        }

        const transactionsColRef = collection(firestore, 'users', user.uid, 'transactions');
        for (const transaction of initialTransactions) {
            addDocumentNonBlocking(transactionsColRef, transaction);
        }

    } catch (error) {
        // Re-throw to be caught by the calling component's try/catch
        throw error;
    }
}


/** Initiate email/password sign-in (non-blocking). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  try {
    await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    // Re-throw to be caught by the calling component's try/catch
    throw error;
  }
}
