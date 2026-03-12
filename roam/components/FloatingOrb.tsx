import React, { useRef, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity, Animated, Easing, View } from 'react-native'
import { Colors } from '../constants/colors'

export type OrbMode = 'idle' | 'narrating' | 'paused' | 'conversing'

interface Props {
  mode: OrbMode
  onPress: () => void
}

const MODE_COLOR: Record<OrbMode, string> = {
  idle: Colors.accent,
  narrating: Colors.accent,
  paused: '#4ECDC4',
  conversing: '#9B59B6',
}

const MODE_EMOJI: Record<OrbMode, string> = {
  idle: '\u{1F50A}',       // speaker
  narrating: '\u{1F50A}',  // speaker
  paused: '\u{1F3A4}',     // mic
  conversing: '\u2728',    // sparkles
}

const MODE_LABEL: Record<OrbMode, string> = {
  idle: 'Tap to play',
  narrating: 'Tap to ask a question',
  paused: 'Tap to speak',
  conversing: 'Listening...',
}

export function FloatingOrb({ mode, onPress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.3)).current
  const rotateAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
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
    pulseAnim.stopAnimation()
    glowAnim.stopAnimation()

    if (mode === 'narrating') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.94,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.7,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.25,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else if (mode === 'paused') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.timing(glowAnim, {
        toValue: 0.55,
        duration: 400,
        useNativeDriver: true,
      }).start()
    } else if (mode === 'conversing') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.88,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.2,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
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
  }, [mode])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  const color = MODE_COLOR[mode]

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Outer rotating dashed ring */}
        <Animated.View
          style={[
            styles.ringOuter,
            {
              transform: [{ rotate: rotation }],
              borderColor: color,
              opacity: glowAnim,
            },
          ]}
        />
        {/* Middle glow */}
        <Animated.View
          style={[
            styles.ringMiddle,
            {
              backgroundColor: color,
              opacity: glowAnim,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />
        {/* Inner orb */}
        <Animated.View
          style={[
            styles.orbInner,
            {
              backgroundColor: color,
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Text style={styles.emoji}>{MODE_EMOJI[mode]}</Text>
        </Animated.View>
      </TouchableOpacity>
      <Text style={styles.label}>{MODE_LABEL[mode]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  ringMiddle: {
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
  emoji: {
    fontSize: 36,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
    fontFamily: 'Poppins_400Regular',
  },
})
