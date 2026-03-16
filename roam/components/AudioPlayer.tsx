import React, { useState, useEffect, useRef } from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { createAudioPlayer, setAudioModeAsync, AudioPlayer as ExpoAudioPlayer } from 'expo-audio'
import { Colors, Fonts } from '../constants/colors'
import { generateNarrationTTS } from '../services/geminiService'
import { writePcmToTempWav } from '../utils/audio'

interface Props {
  text: string
}

export function AudioPlayer({ text }: Props) {
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const geminiFileRef = useRef<string | null>(null)
  const playerRef = useRef<ExpoAudioPlayer | null>(null)

  // Fetch Gemini TTS audio on mount
  useEffect(() => {
    let cancelled = false
    async function fetchAudio() {
      setLoading(true)
      setError(false)
      try {
        const result = await generateNarrationTTS(text)
        if (!cancelled && result) {
          geminiFileRef.current = writePcmToTempWav(result.audioBase64, 24000)
        } else if (!cancelled) {
          setError(true)
        }
      } catch {
        if (!cancelled) setError(true)
      }
      if (!cancelled) setLoading(false)
    }
    fetchAudio()
    return () => {
      cancelled = true
      try { playerRef.current?.pause() } catch {}
    }
  }, [text])

  async function togglePlayback() {
    if (playing) {
      try { playerRef.current?.pause() } catch {}
      setPlaying(false)
      return
    }

    if (!geminiFileRef.current) return

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    })
    const newPlayer = createAudioPlayer({ uri: geminiFileRef.current })
    newPlayer.addListener('playbackStatusUpdate', (status) => {
      if (status.playing === false) {
        setPlaying(false)
      }
    })
    try { playerRef.current?.pause() } catch {}
    playerRef.current = newPlayer
    newPlayer.play()
    setPlaying(true)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, playing && styles.buttonPlaying]}
        onPress={togglePlayback}
        disabled={loading || error}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <Text style={styles.icon}>{playing ? '\u23F8' : '\u25B6'}</Text>
        )}
        <Text style={styles.label}>
          {loading
            ? 'Preparing Roam\'s voice...'
            : error
              ? 'Voice unavailable'
              : playing
                ? 'Stop Narration'
                : 'Play Narration'}
        </Text>
      </TouchableOpacity>
      {!loading && !error && !playing && (
        <Text style={styles.voiceBadge}>Roam's Voice</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  buttonPlaying: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    color: Colors.text,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  voiceBadge: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.accent,
    marginTop: 6,
    letterSpacing: 0.5,
  },
})
