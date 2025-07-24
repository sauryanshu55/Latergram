import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from './constants';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background.secondary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="enter-code" />
    </Stack>
  );
}