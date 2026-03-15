import React, { useEffect, useRef } from 'react'
import { StyleSheet, Text, ScrollView } from 'react-native'
import { Colors, Fonts } from '../constants/colors'

interface Props {
  words: string[]
  currentWordIndex: number
}

export function HighlightedNarration({ words, currentWordIndex }: Props) {
  const scrollRef = useRef<ScrollView>(null)
  const lineHeight = 32
  // Rough estimate: ~8 words per line
  const wordsPerLine = 8

  useEffect(() => {
    if (currentWordIndex <= 0 || !scrollRef.current) return
    const currentLine = Math.floor(currentWordIndex / wordsPerLine)
    const scrollY = Math.max(0, (currentLine - 2) * lineHeight)
    scrollRef.current.scrollTo({ y: scrollY, animated: true })
  }, [currentWordIndex])

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.textWrap}>
        {words.map((word, idx) => {
          const isCurrent = idx === currentWordIndex
          const isPast = idx < currentWordIndex

          return (
            <Text
              key={idx}
              style={[
                styles.word,
                isPast && styles.pastWord,
                isCurrent && styles.currentWord,
                !isPast && !isCurrent && styles.futureWord,
              ]}
            >
              {word}{' '}
            </Text>
          )
        })}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 40,
  },
  textWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 17,
    fontFamily: Fonts.regular,
    lineHeight: 32,
  },
  pastWord: {
    color: 'rgba(255,255,255,0.85)',
  },
  currentWord: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
  },
  futureWord: {
    color: 'rgba(255,255,255,0.35)',
  },
})
