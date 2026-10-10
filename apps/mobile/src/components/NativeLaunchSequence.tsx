import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform
} from 'react-native';
import Svg, { Rect, Path, Circle, Line, Polygon, Polyline, Text as SvgText } from 'react-native-svg';

interface NativeLaunchSequenceProps {
  onComplete: () => void;
}

export const NativeLaunchSequence: React.FC<NativeLaunchSequenceProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'brand' | 'train' | 'fadeout'>('brand');
  const [isMuted, setIsMuted] = useState(true);
  const audioContextRef = useRef<any>(null);

  const playSynthesizedHorn = (muted: boolean) => {
    if (muted) return;
    try {
      const AudioContextClass = (globalThis as any).AudioContext || (globalThis as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      // Indian Railway dual-tone electric locomotive horn (311Hz & 370Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(311, ctx.currentTime);
      osc2.frequency.setValueAtTime(370, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);
    } catch {
      // Audio playback unavailable or blocked by browser/device policy
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (!next) {
      playSynthesizedHorn(false);
    }
  };

  const restartSequence = () => {
    setPhase('brand');
    playSynthesizedHorn(isMuted);
    setTimeout(() => setPhase('train'), 800);
    setTimeout(() => setPhase('fadeout'), 2500);
    setTimeout(() => onComplete(), 2900);
  };

  useEffect(() => {
    playSynthesizedHorn(isMuted);
    const t1 = setTimeout(() => setPhase('train'), 800);
    const t2 = setTimeout(() => setPhase('fadeout'), 2500);
    const t3 = setTimeout(() => onComplete(), 2900);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
    };
  }, [onComplete]);

  return (
    <View style={styles.container}>
      {/* Top Header Controls */}
      <View style={styles.topHeader}>
        <View style={styles.badgeRow}>
          <View style={styles.livePulseDot} />
          <Text style={styles.badgeText}>RAILONE NEXT v4.0</Text>
        </View>

        <View style={styles.controlsRow}>
          {/* Mute Horn Toggle */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={toggleMute}
            accessibilityRole="button"
            accessibilityLabel={isMuted ? 'Unmute Electric Horn' : 'Mute Horn'}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}>
              {isMuted ? (
                <>
                  <Path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <Line x1="23" y1="9" x2="17" y2="15" />
                  <Line x1="17" y1="9" x2="23" y2="15" />
                </>
              ) : (
                <>
                  <Path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <Path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" stroke="#38bdf8" />
                </>
              )}
            </Svg>
          </TouchableOpacity>

          {/* Replay Sequence Button */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={restartSequence}
            accessibilityRole="button"
            accessibilityLabel="Replay Cinematic Launch"
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={2}>
              <Polyline points="1 4 1 10 7 10" />
              <Path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
            </Svg>
          </TouchableOpacity>

          {/* Skip Intro Button */}
          <TouchableOpacity
            style={styles.skipBtn}
            onPress={onComplete}
            accessibilityRole="button"
            accessibilityLabel="Skip Intro"
          >
            <Text style={styles.skipText}>SKIP</Text>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2.5}>
              <Polygon points="13 19 22 12 13 5 13 19" fill="#ffffff" />
              <Polygon points="2 19 11 12 2 5 2 19" fill="#ffffff" />
            </Svg>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stage Area */}
      <View style={styles.stage}>
        {phase === 'brand' && (
          <View style={styles.brandBox}>
            <View style={styles.trainEmblem}>
              <Svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth={2}>
                <Rect x="4" y="3" width="16" height="16" rx="2" />
                <Path d="M4 11h16" />
                <Path d="M12 3v8" />
                <Circle cx="8" cy="15" r="1.5" fill="#ffffff" />
                <Circle cx="16" cy="15" r="1.5" fill="#ffffff" />
                <Path d="M8 19l-2 3" />
                <Path d="M16 19l2 3" />
              </Svg>
            </View>
            <View style={styles.titleRow}>
              <Text style={styles.titleMain}>RailOne</Text>
              <Text style={styles.titleHighlight}>Next</Text>
            </View>
            <Text style={styles.subtitle}>
              Indian Railways Passenger Intelligence Hub
            </Text>
            <Text style={styles.scopeText}>
              Western · Central · Harbour · Metro 1, 2A, 7, 3
            </Text>
          </View>
        )}

        {(phase === 'train' || phase === 'fadeout') && (
          <View style={styles.trainBox}>
            {/* Catenary Wire Overhead Spark */}
            <View style={styles.catenaryWire}>
              <View style={styles.sparkDot} />
            </View>

            {/* Perspective Track & Approaching Train SVG */}
            <View style={styles.trackContainer}>
              <Svg width={300} height={160} viewBox="0 0 300 160">
                {/* Receding Perspective Rails */}
                <Line x1="120" y1="20" x2="30" y2="150" stroke="#475569" strokeWidth={3} />
                <Line x1="180" y1="20" x2="270" y2="150" stroke="#475569" strokeWidth={3} />

                {/* Wooden Ties / Sleepers */}
                <Line x1="125" y1="35" x2="175" y2="35" stroke="#334155" strokeWidth={2} />
                <Line x1="115" y1="55" x2="185" y2="55" stroke="#334155" strokeWidth={2.5} />
                <Line x1="100" y1="80" x2="200" y2="80" stroke="#334155" strokeWidth={3} />
                <Line x1="80" y1="110" x2="220" y2="110" stroke="#334155" strokeWidth={3.5} />
                <Line x1="50" y1="140" x2="250" y2="140" stroke="#334155" strokeWidth={4} />

                {/* Train Cab Outline */}
                <Rect x="85" y="32" width="130" height="96" rx="14" fill="#1e3a8a" stroke="#60a5fa" strokeWidth={2.5} />

                {/* Pantograph */}
                <Line x1="150" y1="16" x2="150" y2="32" stroke="#94a3b8" strokeWidth={2.5} />
                <Line x1="130" y1="16" x2="170" y2="16" stroke="#e2e8f0" strokeWidth={2.5} />

                {/* Windshield */}
                <Rect x="100" y="44" width="100" height="34" rx="6" fill="#0f172a" stroke="#475569" strokeWidth={1} />
                <SvgText
                  x="150"
                  y="65"
                  fill="#fde047"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  95114 AC FAST
                </SvgText>

                {/* Dual Headlights */}
                <Circle cx="106" cy="104" r="8" fill="#fef08a" stroke="#fef9c3" strokeWidth={1.5} />
                <Circle cx="194" cy="104" r="8" fill="#fef08a" stroke="#fef9c3" strokeWidth={1.5} />

                {/* Central Red Marker */}
                <Circle cx="150" cy="104" r="5" fill="#ef4444" stroke="#fca5a5" strokeWidth={1} />

                {/* Cowcatcher / Fender */}
                <Line x1="95" y1="126" x2="205" y2="126" stroke="#94a3b8" strokeWidth={3} />
              </Svg>
            </View>

            <View style={styles.trainStatusBox}>
              <View style={styles.statusIndicatorRow}>
                <View style={styles.statusSpinDot} />
                <Text style={styles.statusText}>Initializing Transit Graph & Timetables...</Text>
              </View>
              <Text style={styles.statusSub}>
                Central · Western · Harbour · Trans-Harbour · Metro
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Footer Notice */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Unofficial Educational Transit Prototype · CRIS / Indian Railways Model
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 24
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  livePulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981'
  },
  badgeText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)'
  },
  skipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  stage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  brandBox: {
    alignItems: 'center',
    paddingHorizontal: 16
  },
  trainEmblem: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#1d4ed8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8
  },
  titleMain: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  titleHighlight: {
    color: '#38bdf8',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6
  },
  scopeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center'
  },
  trainBox: {
    alignItems: 'center',
    width: '100%'
  },
  catenaryWire: {
    width: 240,
    height: 2,
    backgroundColor: 'rgba(56, 189, 248, 0.6)',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  sparkDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e0f2fe'
  },
  trackContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  trainStatusBox: {
    marginTop: 20,
    alignItems: 'center'
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  statusSpinDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38bdf8'
  },
  statusText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '700'
  },
  statusSub: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '500'
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 10
  },
  footerText: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center'
  }
});
