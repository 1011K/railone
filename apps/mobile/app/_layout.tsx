import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MobileThemeProvider, useMobileTheme } from '../src/theme/ThemeContext';

function RootNavigationLayout() {
  const { colors, isDarkMode } = useMobileTheme();

  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} backgroundColor={colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: 'bold'
          },
          contentStyle: {
            backgroundColor: colors.background
          }
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="call"
          options={{
            presentation: 'modal',
            title: 'RailSathi AI Voice Call',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="booking/express"
          options={{
            title: 'Express Ticket Reservation',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="booking/local"
          options={{
            title: 'Book Suburban / Metro Ticket',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="map"
          options={{
            title: 'Railway Network Map',
            headerBackTitle: 'Back'
          }}
        />
        <Stack.Screen
          name="wayfinding"
          options={{
            title: 'Station FOB Wayfinding',
            headerBackTitle: 'Back'
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <MobileThemeProvider>
        <RootNavigationLayout />
      </MobileThemeProvider>
    </SafeAreaProvider>
  );
}
