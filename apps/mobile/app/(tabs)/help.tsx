import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useMobileTheme, THEME_PALETTES, ColorTheme } from '../../src/theme/ThemeContext';

export default function HelpScreen() {
  const { colors, language, setLanguage, isDarkMode, toggleDarkMode, colorTheme, setColorTheme } = useMobileTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 1. Theme and Preferences */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Appearance & Preferences</Text>

        <View style={styles.settingRow}>
          <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Dark Mode</Text>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: isDarkMode ? colors.primary : colors.cardBorder }]}
            onPress={toggleDarkMode}
          >
            <Text style={styles.toggleBtnText}>{isDarkMode ? 'ON' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.subLabel, { color: colors.textMuted }]}>Transit Theme Palette:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeChipsRow}>
          {(Object.keys(THEME_PALETTES) as ColorTheme[]).map(t => {
            const pal = THEME_PALETTES[t];
            const isSelected = colorTheme === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setColorTheme(t)}
                style={[
                  styles.themeChip,
                  {
                    backgroundColor: isSelected ? colors.primary : 'transparent',
                    borderColor: isSelected ? colors.primary : colors.cardBorder
                  }
                ]}
              >
                <Text style={[styles.themeChipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {pal.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={[styles.subLabel, { color: colors.textMuted, marginTop: 12 }]}>Language:</Text>
        <View style={styles.langRow}>
          {(['en', 'hi', 'mr'] as const).map(lang => (
            <TouchableOpacity
              key={lang}
              onPress={() => setLanguage(lang)}
              style={[
                styles.langChip,
                {
                  backgroundColor: language === lang ? colors.primary : 'transparent',
                  borderColor: language === lang ? colors.primary : colors.cardBorder
                }
              ]}
            >
              <Text style={[styles.langChipText, { color: language === lang ? '#ffffff' : colors.textPrimary }]}>
                {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 2. Official Statutory Boundary & 139 Disclosure */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Statutory Telephony & 139 Hotline Boundary
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Indian Railways national helpline <strong>139</strong> is an official emergency and passenger grievance hotline under statutory CRIS control. RailOne Next does NOT co-opt, hijack, or route AI voice interactions through 139.
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: 8 }]}>
          Direct PSTN telephony dialing is disabled without explicit DoT/TRAI enterprise SIP trunk authorization. Use the in-app <strong>Call RailSathi</strong> feature for natural voice journey planning.
        </Text>
      </View>

      {/* 3. Railway Rights & DPDP Act 2023 */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Privacy & DPDP Act 2023 Compliance
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          • Zero unnecessary personal telemetry collected.{'\n'}
          • Microphone access is strictly permissioned and active only during voice sessions.{'\n'}
          • Tickets, bookings, and journey history are stored server-side with local offline caching.{'\n'}
          • Sensitive payment credentials are NEVER sent to LLMs as unstructured chat text.
        </Text>
      </View>

      {/* 4. Official Railways Act Section 138 Warning */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
          Railways Act 1989 Section 138 Notice
        </Text>
        <Text style={[styles.bodyText, { color: colors.textSecondary }]}>
          Travel without a valid ticket or travelling on Mail/Express trains with unendorsed suburban tickets constitutes an offense under Section 138 of the Railways Act, punishable by excess charge and statutory fines.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 18
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '700'
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12
  },
  toggleBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800'
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  themeChipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4
  },
  themeChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1
  },
  themeChipText: {
    fontSize: 11,
    fontWeight: '700'
  },
  langRow: {
    flexDirection: 'row',
    gap: 8
  },
  langChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center'
  },
  langChipText: {
    fontSize: 12,
    fontWeight: '700'
  }
});
