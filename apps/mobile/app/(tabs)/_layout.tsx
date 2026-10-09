import React from 'react';
import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileTheme } from '../../src/theme/ThemeContext';
import Svg, { Path, Circle, Rect, Line, Polyline } from 'react-native-svg';

function HomeTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Polyline points="9 22 9 12 15 12 15 22" />
    </Svg>
  );
}

function JourneysTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}

function LiveTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
      <Path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
      <Circle cx="12" cy="12" r="2" />
      <Path d="M12 14v8" />
    </Svg>
  );
}

function TicketsTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="4" width="18" height="16" rx="2" />
      <Line x1="7" y1="8" x2="17" y2="8" />
      <Line x1="7" y1="12" x2="17" y2="12" />
      <Line x1="7" y1="16" x2="13" y2="16" />
    </Svg>
  );
}

function RailSathiTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2a8 8 0 0 0-8 8c0 3.1 1.8 5.7 4.4 7l-.4 3 3-1.5c.3.3.7.4 1 .5A8 8 0 1 0 12 2z" />
      <Circle cx="9" cy="10" r="1" fill={color} />
      <Circle cx="15" cy="10" r="1" fill={color} />
    </Svg>
  );
}

function HelpTabIcon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <Line x1="12" y1="17" x2="12.01" y2="17" />
    </Svg>
  );
}

export default function TabLayout() {
  const { colors, language } = useMobileTheme();

  const labels = {
    home: language === 'hi' ? 'होम' : language === 'mr' ? 'मुख्य' : 'Home',
    journeys: language === 'hi' ? 'यात्राएं' : language === 'mr' ? 'प्रवास' : 'Journeys',
    status: language === 'hi' ? 'लाइव' : language === 'mr' ? 'थेट' : 'Live',
    tickets: language === 'hi' ? 'टिकट्स' : language === 'mr' ? 'तिकीट' : 'Tickets',
    railsathi: language === 'hi' ? 'रेलसाथी' : language === 'mr' ? 'रेलसाथी' : 'RailSathi',
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
          headerTitle: 'RailOne Next',
          tabBarIcon: ({ color }) => <HomeTabIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="journeys"
        options={{
          title: labels.journeys,
          headerTitle: 'Find Journeys',
          tabBarIcon: ({ color }) => <JourneysTabIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: labels.status,
          headerTitle: 'Live Train Tracker',
          tabBarIcon: ({ color }) => <LiveTabIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="tickets"
        options={{
          title: labels.tickets,
          headerTitle: 'My Ticket Wallet',
          tabBarIcon: ({ color }) => <TicketsTabIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: labels.help,
          headerTitle: 'Support & Preferences',
          tabBarIcon: ({ color }) => <HelpTabIcon color={color} />
        }}
      />
      <Tabs.Screen
        name="railsathi"
        options={{
          href: null,
          title: labels.railsathi,
          headerTitle: 'RailSathi Assistant',
          tabBarIcon: ({ color }) => <RailSathiTabIcon color={color} />
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
