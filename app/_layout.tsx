import { Stack } from 'expo-router';
import React from 'react';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'LaterGram',
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="enter-code" 
        options={{ 
          title: 'Enter Event Code',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}