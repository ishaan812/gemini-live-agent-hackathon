import React, { useState, useCallback } from 'react'
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { Colors, Fonts } from '../constants/colors'

interface Props {
  onSend: (message: string) => void
  loading: boolean
}

export function GuideMic({ onSend, loading }: Props) {
  const [text, setText] = useState('')

  const handleSend = useCallback(() => {
    if (text.trim() && !loading) {
      onSend(text.trim())
      setText('')
    }
  }, [text, loading, onSend])

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Ask your guide a question..."
        placeholderTextColor={Colors.gray}
        multiline
        editable={!loading}
      />
      <TouchableOpacity
        style={[styles.sendButton, loading && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={loading || !text.trim()}
      >
        <Text style={styles.sendText}>{loading ? '...' : '→'}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendText: {
    color: '#000',
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
})
