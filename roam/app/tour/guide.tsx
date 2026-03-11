import React, { useCallback, useRef } from 'react'
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ListRenderItemInfo,
} from 'react-native'
import { GuideMic } from '../../components/GuideMic'
import { useGeminiLive } from '../../hooks/useGeminiLive'
import { useTour } from '../../hooks/useTour'
import { Colors, Fonts } from '../../constants/colors'

interface Transcript {
  role: 'user' | 'assistant'
  content: string
}

export default function GuideScreen() {
  const { currentStop } = useTour()
  const {
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

  const keyCounterRef = useRef(0)
  const keyMapRef = useRef(new WeakMap<object, string>())

  const getStableKey = useCallback((item: object) => {
    if (!keyMapRef.current.has(item)) {
      keyMapRef.current.set(item, `msg-${keyCounterRef.current++}`)
    }
    return keyMapRef.current.get(item)!
  }, [])

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Transcript>) => (
      <View
        style={[
          styles.messageBubble,
          item.role === 'user' ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
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
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [recording, startRecording, stopRecording])

  if (!connected && !connecting) {
    return (
      <View style={styles.connectContainer}>
        <Text style={styles.connectEmoji}>🎙</Text>
        <Text style={styles.connectTitle}>
          AI Guide at {currentStop?.name ?? 'this place'}
        </Text>
        <Text style={styles.connectSubtitle}>
          Start a live voice conversation with your AI tour guide
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.connectButton} onPress={connect}>
          <Text style={styles.connectButtonText}>Start Live Guide</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (connecting) {
    return (
      <View style={styles.connectContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.connectSubtitle}>
          Connecting to your guide...
        </Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <View style={styles.statusRow}>
          <View
            style={[styles.statusDot, connected && styles.statusDotConnected]}
          />
          <Text style={styles.headerText}>
            {speaking
              ? 'Guide is speaking...'
              : recording
                ? 'Listening...'
                : `Live at ${currentStop?.name ?? 'this place'}`}
          </Text>
        </View>
        <TouchableOpacity onPress={disconnect}>
          <Text style={styles.disconnectText}>End</Text>
        </TouchableOpacity>
      </View>

      {transcripts.length === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Tap the mic and ask a question!
          </Text>
          <Text style={styles.emptySubtext}>
            Or type a message below
          </Text>
        </View>
      )}

      <FlatList
        data={transcripts}
        keyExtractor={(item) => getStableKey(item)}
        contentContainerStyle={styles.messageList}
        renderItem={renderItem}
      />

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.micButton,
            recording && styles.micButtonRecording,
            speaking && styles.micButtonDisabled,
          ]}
          onPress={handleMicPress}
          disabled={speaking}
        >
          <Text style={styles.micIcon}>{recording ? '⏹' : '🎤'}</Text>
        </TouchableOpacity>

        <GuideMic onSend={sendText} loading={speaking} />
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  connectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.background,
  },
  connectEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  connectTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  connectSubtitle: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  connectButton: {
    backgroundColor: Colors.accent,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
  },
  connectButtonText: {
    color: '#000',
    fontSize: 17,
    fontFamily: Fonts.bold,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray,
  },
  statusDotConnected: {
    backgroundColor: Colors.success,
  },
  headerText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
  },
  disconnectText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: Colors.error,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: Colors.text,
  },
  emptySubtext: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 16,
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
  messageText: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    lineHeight: 22,
  },
  userText: {
    color: '#000',
  },
  assistantText: {
    color: Colors.text,
  },
  controls: {
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 12,
  },
  micButtonRecording: {
    backgroundColor: Colors.error,
  },
  micButtonDisabled: {
    opacity: 0.5,
  },
  micIcon: {
    fontSize: 28,
  },
})
