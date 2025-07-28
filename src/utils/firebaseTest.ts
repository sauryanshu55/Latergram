import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const testFirebaseConnection = async () => {
  console.log('=== FIREBASE TEST STARTED ===');
  console.log('Checking Firebase config...');

  // Check if Firebase is properly imported
  console.log('Auth object:', auth ? 'exists' : 'missing');
  console.log('DB object:', db ? 'exists' : 'missing');

  try {
    console.log(' Attempting anonymous sign-in...');
    const userCredential = await signInAnonymously(auth);
    console.log('Firebase Auth working! User ID:', userCredential.user.uid);

    console.log(' Step 2: Attempting Firestore write...');
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date(),
      testNumber: Math.random()
    });
    console.log('Firestore working! Document ID:', docRef.id);

    console.log('=== ALL TESTS PASSED ===');
    return true;
  } catch (error: any) {
    console.error('=== FIREBASE TEST FAILED ===');
    console.error('Error type:', typeof error);
    console.error('Error message:', error?.message);
    console.error('Error code:', error?.code);
    console.error('Full error:', error);
    return false;
  }
};