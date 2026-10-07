import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileTheme } from '../../src/theme/ThemeContext';

export default function TabLayout() {
  const { colors, language } = useMobileTheme();

  const labels = {
    home: language === 'hi' ? 'होम' : language === 'mr' ? 'मुख्य' : 'Home',
    journeys: language === 'hi' ? 'यात्राएं' : language === 'mr' ? 'प्रवास' : 'Journeys',
    status: language === 'hi' ? 'ट्रेन स्थिति' : language === 'mr' ? 'गाडी स्थिती' : 'Train Status',
    tickets: language === 'hi' ? 'माय टिकट्स' : language === 'mr' ? 'माझे तिकीट' : 'My Tickets',
    help: language === 'hi' ? 'सहायता' : language === 'mr' ? 'मदत' : 'Help'
  };

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: colors.textPrimary
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push('/call')}
            style={[styles.callHeaderButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            accessibilityLabel="Call RailSathi voice assistant"
            accessibilityRole="button"
          >
            <View style={styles.callHeaderIconCircle}>
              <View style={styles.pulseDot} />
            </View>
            <Text style={styles.callHeaderText}>Call RailSathi</Text>
          </TouchableOpacity>
        ),
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: labels.home,
          headerTitle: 'RailOne Next'
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: labels.journeys,
          headerTitle: 'Find Journeys'
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: labels.status,
          headerTitle: 'Live Train Tracker'
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: labels.tickets,
          headerTitle: 'My Ticket Wallet'
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: labels.help,
          headerTitle: 'Support & Disclaimers'
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  callHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  callHeaderIconCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a'
  },
  callHeaderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700'
  }
});
