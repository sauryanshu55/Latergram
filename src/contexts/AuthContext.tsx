// src/contexts/AuthContext.tsx
import { authService, LaterGramUser } from '@/services/authSevice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: LaterGramUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signInWithApple: () => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    isAppleSignInAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

const USER_STORAGE_KEY = '@latergram_user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<LaterGramUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppleSignInAvailable, setIsAppleSignInAvailable] = useState(false);

    useEffect(() => {
        initializeAuth();
    }, []);

    const initializeAuth = async () => {
        try {
            // Check if Apple Sign-In is available
            const appleAvailable = await authService.isAppleSignInAvailable();
            setIsAppleSignInAvailable(appleAvailable);

            // Try to load user from AsyncStorage first for faster UI
            const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            // Set up auth state listener
            const unsubscribe = authService.onAuthStateChanged(async (userData) => {
                setUser(userData);
                setIsLoading(false);

                // Store user data in AsyncStorage
                if (userData) {
                    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
                } else {
                    await AsyncStorage.removeItem(USER_STORAGE_KEY);
                }
            });

            return unsubscribe;
        } catch (error) {
            console.error('Error initializing auth:', error);
            setIsLoading(false);
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            await authService.signInWithEmail(email, password);
            // User state will be updated by onAuthStateChanged listener
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        try {
            setIsLoading(true);
            await authService.signUpWithEmail(email, password, displayName);
            // User state will be updated by onAuthStateChanged listener
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signInWithGoogle = async () => {
        try {
            setIsLoading(true);
            await authService.signInWithGoogle();
            // User state will be updated by onAuthStateChanged listener
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signInWithApple = async () => {
        try {
            setIsLoading(true);
            await authService.signInWithApple();
            // User state will be updated by onAuthStateChanged listener
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            setIsLoading(true);
            await authService.signOut();
            setUser(null);
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        try {
            await authService.resetPassword(email);
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signInWithApple,
        signOut,
        resetPassword,
        isAppleSignInAvailable,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};