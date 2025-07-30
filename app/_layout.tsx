import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="enter-code" />
      </Stack>
    </AuthProvider>
  );
}