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

const MODE_LABEL: Record<OrbMode, string> = {
  idle: 'Tap to play',
  narrating: 'Tap to ask a question',
  paused: 'Tap to speak',
  conversing: 'Listening...',
}

export function FloatingOrb({ mode, onPress }: Props) {
  const pulseAnim = useRef(new Animated.Value(1)).current
  const glowAnim = useRef(new Animated.Value(0.15)).current
  const rotateAnim = useRef(new Animated.Value(0)).current
  const ring2Rotate = useRef(new Animated.Value(0)).current
  const breatheAnim = useRef(new Animated.Value(1)).current

  // Continuous rotation for outer rings
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

    if (mode === 'narrating') {
      // Active, organic pulsing — the orb "breathes" with the narration
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.92,
            duration: 600,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.6,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.96,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else if (mode === 'paused') {
      // Gentle waiting pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.97,
            duration: 1000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.timing(glowAnim, {
        toValue: 0.45,
        duration: 500,
        useNativeDriver: true,
      }).start()
      Animated.timing(breatheAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    } else if (mode === 'conversing') {
      // Intense, fast pulsing — orb is "alive" and reacting
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.85,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 0.85,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.1,
            duration: 350,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
      Animated.loop(
        Animated.sequence([
          Animated.timing(breatheAnim, {
            toValue: 1.12,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(breatheAnim, {
            toValue: 0.92,
            duration: 500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start()
    } else {
      // Idle — slow, ambient breathing
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
  }, [mode])

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })
  const rotation2 = ring2Rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['360deg', '0deg'],
  })

  const color = MODE_COLOR[mode]

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Outermost ambient glow — large, soft, ominous */}
        <Animated.View
          style={[
            styles.ambientGlow,
            {
              backgroundColor: color,
              opacity: glowAnim,
              transform: [{ scale: breatheAnim }],
            },
          ]}
        />

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

        {/* Second ring — counter-rotating, dotted */}
        <Animated.View
          style={[
            styles.ringSecond,
            {
              transform: [{ rotate: rotation2 }],
              borderColor: color,
              opacity: Animated.multiply(glowAnim, 0.6),
            },
          ]}
        />

        {/* Middle glow layer */}
        <Animated.View
          style={[
            styles.ringMiddle,
            {
              backgroundColor: color,
              opacity: Animated.multiply(glowAnim, 0.8),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        />

        {/* Inner core orb */}
        <Animated.View
          style={[
            styles.orbCore,
            {
              backgroundColor: color,
              transform: [{ scale: pulseAnim }],
              shadowColor: color,
            },
          ]}
        >
          {/* Bright center highlight */}
          <View style={styles.orbHighlight} />
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
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  ringOuter: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  ringSecond: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
    borderStyle: 'dotted',
  },
  ringMiddle: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  orbCore: {
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
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 20,
    fontFamily: 'Poppins_400Regular',
  },
})
