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
  const glowAnim = useRef(new Animated.Value(0.3)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Continuous rotation for the outer ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start()
  }, [])

  useEffect(() => {
    if (status === 'speaking') {
      // Active pulsing when speaking
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.95,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else if (status === 'listening') {
      // Gentle breathing when listening
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.98,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.timing(glowAnim, {
        toValue: 0.6,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } else if (status === 'thinking') {
      // Quick subtle pulse when thinking
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      // Idle / connected - gentle idle state
      pulseAnim.stopAnimation()
      glowAnim.stopAnimation()
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
      Animated.timing(glowAnim, {
        toValue: 0.3,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [status])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const orbColor =
    status === 'speaking'
      ? Colors.accent
      : status === 'listening'
        ? '#4ECDC4'
        : status === 'thinking'
          ? '#9B59B6'
          : Colors.accent

  return (
    <View style={styles.orbContainer}>
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
      {/* Middle glow ring */}
      <Animated.View
        style={[
          styles.orbRingMiddle,
          {
            transform: [{ scale: pulseAnim }],
            backgroundColor: orbColor,
            opacity: glowAnim,
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
          },
        ]}
      >
        <Text style={styles.orbEmoji}>
          {status === 'speaking'
            ? '\u2728'
            : status === 'listening'
              ? '\u{1F442}'
              : status === 'thinking'
                ? '\u{1F4AD}'
                : '\u{1F30D}'}
        </Text>
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
    connected: 'Tap the mic to ask anything',
    listening: 'Speak naturally, I\'m all ears',
    speaking: 'Tap mic to interrupt',
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

  const handleMicPress = useCallback(() => {
    if (!connected) {
      connect()
      return
    }
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [connected, recording, connect, startRecording, stopRecording])

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
            recording && styles.micButtonRecording,
            speaking && styles.micButtonSpeaking,
            !connected && !connecting && styles.micButtonConnect,
          ]}
          onPress={handleMicPress}
          activeOpacity={0.7}
        >
          <Text style={styles.micIcon}>
            {!connected && !connecting
              ? '\u{1F3A4}'
              : recording
                ? '\u23F9'
                : speaking
                  ? '\u270B'
                  : '\u{1F3A4}'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.micHint}>
          {!connected && !connecting
            ? 'Tap to start live guide'
            : recording
              ? 'Tap to stop'
              : speaking
                ? 'Tap to interrupt'
                : 'Tap to speak'}
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
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbRingOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  orbRingMiddle: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  orbInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  orbEmoji: {
    fontSize: 36,
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
  micButtonRecording: {
    backgroundColor: '#4ECDC4',
    shadowColor: '#4ECDC4',
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
