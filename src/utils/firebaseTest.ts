import { signInAnonymously } from 'firebase/auth';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export const testFirebaseConnection = async () => {
  try {
    // Test Authentication
    const userCredential = await signInAnonymously(auth);
    console.log('✅ Firebase Auth working:', userCredential.user.uid);
    
    // Test Firestore
    const docRef = await addDoc(collection(db, 'test'), {
      message: 'Hello Firebase!',
      timestamp: new Date()
    });
    console.log('✅ Firestore working:', docRef.id);
    
    return true;
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return false;
  }
};