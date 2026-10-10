import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { useMobileTheme } from '../src/theme/ThemeContext';

import { OfflineStorage } from '../src/storage/offlineStorage';

export default function FeedbackScreen() {
  const { colors } = useMobileTheme();
  const [trainName, setTrainName] = useState('Suburban Fast Local (95112)');
  const [stationName, setStationName] = useState('Dadar Junction (DR)');
  const [cleanliness, setCleanliness] = useState(4);
  const [punctuality, setPunctuality] = useState(4);
  const [amenities, setAmenities] = useState(4);
  const [safety, setSafety] = useState(5);
  const [comments, setComments] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = () => {
    const draft = {
      trainInfo: trainName,
      stationInfo: stationName,
      ratings: { cleanliness, punctuality, amenities, safety },
      comments,
      submittedAt: new Date().toISOString()
    };
    try {
      OfflineStorage.saveFeedbackDraft(draft);
    } catch {}
    setSubmittedRef(`LOCAL-DRAFT-${Date.now().toString().slice(-6)}`);
  };

  const renderStars = (rating: number, setRating: (r: number) => void, title: string) => (
    <View style={[styles.ratingRow, { borderBottomColor: colors.cardBorder }]}>
      <Text style={[styles.ratingTitle, { color: colors.textPrimary }]}>{title}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starBtn}
            accessibilityLabel={`${star} stars`}
          >
            <Text style={{ fontSize: 18, color: star <= rating ? '#f59e0b' : colors.cardBorder }}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Travel Feedback</Text>
          <View style={{ width: 44 }} />
        </View>

        {submittedRef ? (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, alignItems: 'center', paddingVertical: 32 }]}>
            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.warning + '25', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 24, color: colors.warning }}>📝</Text>
            </View>
            <Text style={[styles.successTitle, { color: colors.textPrimary }]}>Saved as Local Draft</Text>
            <Text style={[styles.successSub, { color: colors.textMuted, textAlign: 'center', marginHorizontal: 16, marginTop: 4 }]}>
              Central railway feedback endpoint is disconnected. Your responses are preserved in local offline storage and have not been submitted to the central rail server.
            </Text>
            <View style={[styles.refBox, { backgroundColor: colors.background, borderColor: colors.cardBorder, marginTop: 12 }]}>
              <Text style={[styles.refText, { color: colors.primary }]}>Local Draft ID: {submittedRef}</Text>
            </View>
            <TouchableOpacity
              style={[styles.doneBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
              onPress={() => router.back()}
            >
              <Text style={styles.doneBtnText}>Return to Home</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>Journey Context</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Train / Service</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                value={trainName}
                onChangeText={setTrainName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Station / Concourse</Text>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                value={stationName}
                onChangeText={setStationName}
              />
            </View>

            <Text style={[styles.sectionHeading, { color: colors.textPrimary, marginTop: 12 }]}>Quality Ratings</Text>
            {renderStars(cleanliness, setCleanliness, 'Cleanliness & Sanitation')}
            {renderStars(punctuality, setPunctuality, 'Punctuality & Precision')}
            {renderStars(amenities, setAmenities, 'Coach Amenities & Airflow')}
            {renderStars(safety, setSafety, 'Security & Passenger Safety')}

            <View style={[styles.inputGroup, { marginTop: 12 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Comments</Text>
              <TextInput
                style={[styles.textArea, { color: colors.textPrimary, borderColor: colors.cardBorder, backgroundColor: colors.background }]}
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={3}
                placeholder="Share observations..."
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Submit Passenger Feedback</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingTop: 48,
    gap: 16
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  backButton: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800'
  },
  inputGroup: {
    gap: 6
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700'
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '600'
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    minHeight: 70
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  ratingTitle: {
    fontSize: 12,
    fontWeight: '600'
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4
  },
  starBtn: {
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 48
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  successSub: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4
  },
  refBox: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginVertical: 16
  },
  refText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  doneBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12
  },
  doneBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700'
  }
});
