import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import * as Speech from 'expo-speech'
import { Colors, Fonts } from '../constants/colors'
import { useUserStore } from '../store/userStore'

const LANG_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  hi: 'hi-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
}

interface Props {
  text: string
}

export function AudioPlayer({ text }: Props) {
  const [playing, setPlaying] = useState(false)
  const language = useUserStore((s) => s.language)

  useEffect(() => {
    return () => {
      Speech.stop()
    }
  }, [])

  async function togglePlayback() {
    if (playing) {
      Speech.stop()
      setPlaying(false)
    } else {
      setPlaying(true)
      Speech.speak(text, {
        language: LANG_VOICE_MAP[language] || 'en-US',
        rate: 0.85,
        pitch: 1.1,
        onDone: () => setPlaying(false),
        onStopped: () => setPlaying(false),
      })
    }
  }

  return (
    <TouchableOpacity style={styles.button} onPress={togglePlayback}>
      <Text style={styles.icon}>{playing ? '⏸' : '▶'}</Text>
      <Text style={styles.label}>
        {playing ? 'Stop Narration' : 'Play Narration'}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
})
