/**
 * Word-level sync utilities for narration playback.
 */

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0)
}

export interface WordTimestamp {
  word: string
  timeSeconds: number
}

/**
 * Estimate word-level timestamps based on total audio duration.
 * Words are weighted by character length; punctuation-ending words
 * get extra weight to account for natural pauses.
 */
export function estimateWordTimestamps(
  words: string[],
  durationSeconds: number,
): WordTimestamp[] {
  if (words.length === 0) return []

  // Weight each word: base = character count, bonus for pause-inducing punctuation
  const weights = words.map((w) => {
    let weight = w.length
    if (/[.!?]$/.test(w)) weight += 3    // sentence-ending pause
    else if (/[,;:]$/.test(w)) weight += 1.5  // clause pause
    if (w.includes('...')) weight += 2    // dramatic pause
    return weight
  })

  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  const timestamps: WordTimestamp[] = []
  let cumulativeTime = 0

  for (let i = 0; i < words.length; i++) {
    timestamps.push({ word: words[i], timeSeconds: cumulativeTime })
    cumulativeTime += (weights[i] / totalWeight) * durationSeconds
  }

  return timestamps
}

/**
 * Binary search to find the word index at a given playback time.
 */
export function findWordIndexAtTime(
  timestamps: WordTimestamp[],
  currentTime: number,
): number {
  if (timestamps.length === 0) return 0

  let lo = 0
  let hi = timestamps.length - 1

  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if (timestamps[mid].timeSeconds <= currentTime) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }

  // hi is now the index of the last timestamp <= currentTime
  return Math.max(0, hi)
}
