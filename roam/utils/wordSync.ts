/**
 * Word-level sync utilities for matching Live API outputTranscription
 * against the original narration text.
 */

function normalize(word: string): string {
  // Strip all punctuation, lowercase, collapse whitespace
  return word
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '')  // Keep letters and numbers from any script
}

export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.length > 0)
}

/**
 * Given the current word index, the full word list, and an incoming
 * transcription chunk, advance the index by greedy forward-matching.
 *
 * For each transcribed word, look ahead up to `lookahead` positions
 * in `words` from `currentIndex` for a match. If no exact match,
 * try startsWith for partial matches (model may truncate words).
 */
export function advanceWordIndex(
  currentIndex: number,
  words: string[],
  transcriptionChunk: string,
  lookahead: number = 12,
): number {
  const transcribedWords = transcriptionChunk.split(/\s+/).filter((w) => w.length > 0)
  let idx = currentIndex

  for (const tw of transcribedWords) {
    const normTw = normalize(tw)
    if (!normTw || normTw.length < 2) continue  // Skip very short fragments

    const searchEnd = Math.min(idx + lookahead, words.length)
    let matched = false

    // First pass: exact match
    for (let j = idx; j < searchEnd; j++) {
      const normWord = normalize(words[j])
      if (normWord === normTw) {
        idx = j + 1
        matched = true
        break
      }
    }

    // Second pass: prefix match (model might say partial word)
    if (!matched && normTw.length >= 3) {
      for (let j = idx; j < searchEnd; j++) {
        const normWord = normalize(words[j])
        if (normWord.startsWith(normTw) || normTw.startsWith(normWord)) {
          idx = j + 1
          matched = true
          break
        }
      }
    }

    // If no match found, just advance by 1 to keep progress moving
    if (!matched && idx < words.length) {
      idx = Math.min(idx + 1, words.length)
    }
  }

  return idx
}
