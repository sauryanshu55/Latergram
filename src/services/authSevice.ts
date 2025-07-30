// src/services/authService.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import {
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    GoogleAuthProvider,
    OAuthProvider,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithCredential,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from '../config/firebase';

// Configure Google Sign-In
GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

export interface LaterGramUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    provider: 'google' | 'apple' | 'email';
    isAnonymous: boolean;
    createdAt: any;
    lastLoginAt: any;
    // Event-related fields for future development
    ownedAlbums: string[]; // Array of album IDs the user owns
    joinedAlbums: string[]; // Array of album IDs the user has joined
    notificationSettings: {
        albumMarinated: boolean;
        newPhotosAdded: boolean;
    };
}

class AuthService {
    // Email/Password Authentication
    async signUpWithEmail(email: string, password: string, displayName: string): Promise<LaterGramUser> {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const { user } = userCredential;

            // Update display name
            await updateProfile(user, { displayName });

            // Create user document in Firestore
            const userData = await this.createUserDocument(user, 'email');
            return userData;
        } catch (error) {
            console.error('Email sign up error:', error);
            throw this.handleAuthError(error);
        }
    }

    async signInWithEmail(email: string, password: string): Promise<LaterGramUser> {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userData = await this.updateUserLastLogin(userCredential.user);
            return userData;
        } catch (error) {
            console.error('Email sign in error:', error);
            throw this.handleAuthError(error);
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw this.handleAuthError(error);
        }
    }

    // Google Authentication
    async signInWithGoogle(): Promise<LaterGramUser> {
        try {
            // Check if device supports Google Play services (Android)
            await GoogleSignin.hasPlayServices();

            // Sign in with Google
            const signInResponse = await GoogleSignin.signIn();
            const idToken = signInResponse.data?.idToken;

            if (!idToken) {
                throw new Error('Failed to get Google ID token');
            }

            // Create Firebase credential
            const googleCredential = GoogleAuthProvider.credential(idToken);

            // Sign in to Firebase
            const userCredential = await signInWithCredential(auth, googleCredential);

            // Create or update user document
            const userData = await this.createUserDocument(userCredential.user, 'google');
            return userData;
        } catch (error) {
            console.error('Google sign in error:', error);
            throw this.handleAuthError(error);
        }
    }

    // Apple Authentication (iOS only)
    async signInWithApple(): Promise<LaterGramUser> {
        try {
            // Check if Apple authentication is available
            const isAvailable = await AppleAuthentication.isAvailableAsync();
            if (!isAvailable) {
                throw new Error('Apple Sign-In is not available on this device');
            }

            // Generate nonce for security
            const nonce = Math.random().toString(36).substring(2, 10);
            const hashedNonce = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                nonce
            );

            // Request Apple authentication
            const appleCredential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
                nonce: hashedNonce,
            });

            // Create Firebase credential
            const { identityToken } = appleCredential;
            const provider = new OAuthProvider('apple.com');
            const firebaseCredential = provider.credential({
                idToken: identityToken!,
                rawNonce: nonce,
            });

            // Sign in to Firebase
            const userCredential = await signInWithCredential(auth, firebaseCredential);

            // Create or update user document
            const userData = await this.createUserDocument(userCredential.user, 'apple');
            return userData;
        } catch (error) {
            console.error('Apple sign in error:', error);
            throw this.handleAuthError(error);
        }
    }

    // Sign out
    async signOut(): Promise<void> {
        try {
            // Sign out from Google if user was signed in with Google

            await GoogleSignin.signOut();

            // Sign out from Firebase
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser(): FirebaseUser | null {
        return auth.currentUser;
    }

    // Listen to auth state changes
    onAuthStateChanged(callback: (user: LaterGramUser | null) => void) {
        return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await this.getUserDocument(firebaseUser.uid);
                    callback(userData);
                } catch (error) {
                    console.error('Error getting user document:', error);
                    callback(null);
                }
            } else {
                callback(null);
            }
        });
    }

    // Check if Apple Sign-In is available
    async isAppleSignInAvailable(): Promise<boolean> {
        if (Platform.OS !== 'ios') return false;
        return await AppleAuthentication.isAvailableAsync();
    }

    // Private helper methods
    private async createUserDocument(firebaseUser: FirebaseUser, provider: 'google' | 'apple' | 'email'): Promise<LaterGramUser> {
        const userRef = doc(db, 'users', firebaseUser.uid);

        // Check if user document already exists
        const userDoc = await getDoc(userRef);

        const userData: LaterGramUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            provider,
            isAnonymous: false,
            createdAt: userDoc.exists() ? userDoc.data().createdAt : serverTimestamp(),
            lastLoginAt: serverTimestamp(),
            ownedAlbums: userDoc.exists() ? userDoc.data().ownedAlbums || [] : [],
            joinedAlbums: userDoc.exists() ? userDoc.data().joinedAlbums || [] : [],
            notificationSettings: userDoc.exists() ? userDoc.data().notificationSettings || {
                albumMarinated: true,
                newPhotosAdded: true,
            } : {
                albumMarinated: true,
                newPhotosAdded: true,
            },
        };

        // Create or update user document
        await setDoc(userRef, userData, { merge: true });

        return userData;
    }

    private async updateUserLastLogin(firebaseUser: FirebaseUser): Promise<LaterGramUser> {
        const userRef = doc(db, 'users', firebaseUser.uid);
        await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
        });

        return await this.getUserDocument(firebaseUser.uid);
    }

    private async getUserDocument(uid: string): Promise<LaterGramUser> {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            throw new Error('User document not found');
        }

        return userDoc.data() as LaterGramUser;
    }

    private handleAuthError(error: any): Error {
        console.error('Auth error:', error);

        // Handle common Firebase auth errors
        switch (error.code) {
            case 'auth/user-not-found':
                return new Error('No account found with this email address');
            case 'auth/wrong-password':
                return new Error('Incorrect password');
            case 'auth/email-already-in-use':
                return new Error('An account with this email already exists');
            case 'auth/weak-password':
                return new Error('Password should be at least 6 characters');
            case 'auth/invalid-email':
                return new Error('Please enter a valid email address');
            case 'auth/too-many-requests':
                return new Error('Too many failed attempts. Please try again later');
            case 'auth/network-request-failed':
                return new Error('Network error. Please check your connection');
            default:
                return new Error(error.message || 'An authentication error occurred');
        }
    }
}

export const authService = new AuthService();