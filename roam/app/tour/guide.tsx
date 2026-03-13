import React, { useCallback, useRef, useEffect } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ListRenderItemInfo,
  Animated,
  Easing,
  Dimensions,
} from 'react-native'
import { useGeminiLive, LiveStatus } from '../../hooks/useGeminiLive'
import { useTour } from '../../hooks/useTour'
import { Colors, Fonts } from '../../constants/colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

interface Transcript {
  role: 'user' | 'assistant'
  content: string
}

function VoiceOrb({ status }: { status: LiveStatus }) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.15)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const ring2Rotate = useRef(new Animated.Value(0)).current
  const breatheAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 10000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
    Animated.loop(
      Animated.timing(ring2Rotate, {
        toValue: 1,
        duration: 14000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  useEffect(() => {
    pulseAnim.stopAnimation()
    glowAnim.stopAnimation()
    breatheAnim.stopAnimation()

    if (status === 'speaking') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.88,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.12,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.94,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else if (status === 'listening') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.timing(glowAnim, {
        toValue: 0.5,
        duration: 400,
        useNativeDriver: true,
      }).start()
      Animated.timing(breatheAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else if (status === 'thinking') {
      // Rapid shimmer — distinct from speaking/listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.93,
            duration: 200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.55,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 250,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.06,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.96,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start()
      Animated.timing(glowAnim, {
        toValue: 0.15,
        duration: 400,
        useNativeDriver: true,
      }).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.03,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.98,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    }
  }, [status])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  const rotation2 = ring2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  })

  const orbColor =
    status === 'speaking'
      ? Colors.accent         // warm gold — active voice
      : status === 'listening'
        ? '#4ECDC4'           // teal — receiving input
        : status === 'thinking'
          ? '#E67E22'         // amber — processing
          : Colors.accent     // gold — idle/connected

  return (
    <View style={styles.orbContainer}>
      {/* Ambient glow */}
      <Animated.View
        style={[
          styles.orbAmbientGlow,
          {
            backgroundColor: orbColor,
            opacity: glowAnim,
            transform: [{ scale: breatheAnim }],
          },
        ]}
      />
      {/* Outer rotating ring */}
      <Animated.View
        style={[
          styles.orbRingOuter,
          {
            transform: [{ rotate: rotation }],
            borderColor: orbColor,
            opacity: glowAnim,
          },
        ]}
      />
      {/* Second ring — counter-rotating */}
      <Animated.View
        style={[
          styles.orbRingSecond,
          {
            transform: [{ rotate: rotation2 }],
            borderColor: orbColor,
            opacity: Animated.multiply(glowAnim, 0.6),
          },
        ]}
      />
      {/* Middle glow ring */}
      <Animated.View
        style={[
          styles.orbRingMiddle,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: orbColor,
            opacity: Animated.multiply(glowAnim, 0.8),
          },
        ]}
      />
      {/* Inner orb */}
      <Animated.View
        style={[
          styles.orbInner,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: orbColor,
            shadowColor: orbColor,
          },
        ]}
      >
        <View style={styles.orbHighlight} />
      </Animated.View>
    </View>
  )
}

function StatusText({ status, stopName }: { status: LiveStatus; stopName: string }) {
  const text = {
    idle: 'Ready to explore',
    connecting: 'Connecting...',
    connected: `Live at ${stopName}`,
    listening: 'Listening to you...',
    speaking: 'Roam is speaking...',
    thinking: 'Thinking...',
  }[status]

  const subtitle = {
    idle: 'Tap below to start your live guide',
    connecting: 'Setting up your personal guide',
    connected: 'Speak naturally — I\'m listening',
    listening: 'Speak naturally — I\'m listening',
    speaking: 'You can interrupt anytime',
    thinking: 'Processing your words...',
  }[status]

  return (
    <View style={styles.statusContainer}>
      <Text style={styles.statusText}>{text}</Text>
      <Text style={styles.statusSubtext}>{subtitle}</Text>
    </View>
  )
}

export default function GuideScreen() {
  const { currentStop } = useTour()
  const {
    status,
    connected,
    connecting,
    speaking,
    recording,
    transcripts,
    error,
    connect,
    disconnect,
    sendText,
    startRecording,
    stopRecording,
  } = useGeminiLive(currentStop)

  const flatListRef = useRef<FlatList>(null)
  const keyCounterRef = useRef(0)
  const keyMapRef = useRef(new WeakMap<object, string>())

  // Auto-scroll to latest transcript
  useEffect(() => {
    if (transcripts.length > 0 && flatListRef.current) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [transcripts])

  const getStableKey = useCallback((item: object) => {
    if (!keyMapRef.current.has(item)) {
      keyMapRef.current.set(item, `msg-${keyCounterRef.current++}`)
    }
    return keyMapRef.current.get(item)!
  }, [])

  const renderTranscript = useCallback(
    ({ item }: ListRenderItemInfo<Transcript>) => (
      <View
        style={[
          styles.transcriptBubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {item.role === 'assistant' && (
          <Text style={styles.roleLabel}>Roam</Text>
        )}
        <Text
          style={[
            styles.transcriptText,
            item.role === 'user' ? styles.userText : styles.assistantText,
          ]}
        >
          {item.content}
        </Text>
      </View>
    ),
    [],
  )

  const [muted, setMuted] = React.useState(false)

  const handleMicPress = useCallback(() => {
    if (!connected) {
      connect()
      return
    }
    // Toggle mute/unmute — mic is always on with LiveKit, this just mutes
    if (muted) {
      startRecording()
      setMuted(false)
    } else {
      stopRecording()
      setMuted(true)
    }
  }, [connected, muted, connect, startRecording, stopRecording])

  const stopName = currentStop?.name ?? 'this place'

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View
            style={[
              styles.liveDot,
              connected && styles.liveDotActive,
            ]}
          />
          <Text style={styles.headerTitle}>
            {connected ? 'LIVE' : 'GUIDE'}
          </Text>
        </View>
        <Text style={styles.headerStop} numberOfLines={1}>
          {stopName}
        </Text>
        {connected && (
          <TouchableOpacity onPress={disconnect} style={styles.endButton}>
            <Text style={styles.endButtonText}>End</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Voice Orb & Status */}
      <View style={styles.orbSection}>
        {connecting ? (
          <View style={styles.connectingContainer}>
            <ActivityIndicator size="large" color={Colors.accent} />
          </View>
        ) : (
          <VoiceOrb status={status} />
        )}
        <StatusText status={status} stopName={stopName} />
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={connect}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Transcripts */}
      {transcripts.length > 0 && (
        <View style={styles.transcriptSection}>
          <Text style={styles.transcriptHeader}>Conversation</Text>
          <FlatList
            ref={flatListRef}
            data={transcripts}
            keyExtractor={(item) => getStableKey(item)}
            contentContainerStyle={styles.transcriptList}
            renderItem={renderTranscript}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Main Mic Button */}
        <TouchableOpacity
          style={[
            styles.micButton,
            muted && styles.micButtonMuted,
            speaking && styles.micButtonSpeaking,
            !connected && !connecting && styles.micButtonConnect,
          ]}
          onPress={handleMicPress}
          activeOpacity={0.7}
        >
          <Text style={styles.micIcon}>
            {!connected && !connecting
              ? '\u{1F3A4}'
              : muted
                ? '\u{1F507}'
                : '\u{1F3A4}'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {!connected && !connecting
            ? 'Tap to start live guide'
            : muted
              ? 'Tap to unmute'
              : 'Tap to mute'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray,
  },
  liveDotActive: {
    backgroundColor: '#EF4444',
  },
  headerTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    letterSpacing: 1.5,
  },
  headerStop: {
    flex: 1,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  endButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  endButtonText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: Colors.error,
  },

  // Orb Section
  orbSection: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 20,
  },
  connectingContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbContainer: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbAmbientGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  orbRingOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  orbRingSecond: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  orbRingMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orbInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  orbHighlight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    marginTop: -12,
    marginLeft: -8,
  },

  // Status
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statusSubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  // Error
  errorContainer: {
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.error,
    textAlign: 'center',
  },
  retryText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
    marginTop: 8,
  },

  // Transcripts
  transcriptSection: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: Colors.primaryLight,
    borderRadius: 16,
    overflow: 'hidden',
  },
  transcriptHeader: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
    color: Colors.gray,
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  transcriptList: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  transcriptBubble: {
    maxWidth: '85%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  userBubble: {
    backgroundColor: Colors.accent,
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  roleLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: Colors.accent,
    marginBottom: 2,
  },
  transcriptText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },
  userText: {
    color: '#000',
  },
  assistantText: {
    color: Colors.text,
  },

  // Controls
  controls: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingBottom: 36,
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  micButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonMuted: {
    backgroundColor: Colors.gray,
    shadowColor: Colors.gray,
  },
  micButtonSpeaking: {
    backgroundColor: Colors.surfaceLight,
    shadowOpacity: 0.1,
  },
  micButtonConnect: {
    backgroundColor: Colors.accent,
  },
  micIcon: {
    fontSize: 32,
  },
  micHint: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 10,
  },
})
