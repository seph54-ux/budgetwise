'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { getSdks } from '@/firebase';
import { initialBudgets, initialTransactions } from '@/lib/data';
import { setDocumentNonBlocking, addDocumentNonBlocking } from './non-blocking-updates';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';


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

        // 2. Create the user document and initial data in a batch
        const { firestore } = getSdks(authInstance.app);
        const batch = writeBatch(firestore);

        const userDocRef = doc(firestore, 'users', user.uid);
        const userData = {
            id: user.uid,
            email: user.email,
            name: displayName,
        };
        batch.set(userDocRef, userData, { merge: true });

        const budgetsColRef = collection(firestore, 'users', user.uid, 'budgets');
        initialBudgets.forEach(budget => {
            const budgetDocRef = doc(budgetsColRef, budget.id);
            batch.set(budgetDocRef, { ...budget, userId: user.uid });
        });

        const transactionsColRef = collection(firestore, 'users', user.uid, 'transactions');
        initialTransactions.forEach(transaction => {
            const transactionDocRef = doc(transactionsColRef);
            batch.set(transactionDocRef, { ...transaction, userId: user.uid, id: transactionDocRef.id });
        });

        // Use non-blocking commit
        batch.commit().catch(serverError => {
            errorEmitter.emit(
                'permission-error',
                new FirestorePermissionError({
                  path: `user record and initial data for ${user.uid}`,
                  operation: 'write',
                  requestResourceData: { userData, initialBudgets, initialTransactions }
                })
            );
        });

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
