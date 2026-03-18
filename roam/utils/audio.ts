import { Paths, File } from 'expo-file-system'

// Base64 decode without atob (Hermes-safe)
const B64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
const B64_LOOKUP = new Uint8Array(256)
for (let i = 0; i < B64_CHARS.length; i++) {
  B64_LOOKUP[B64_CHARS.charCodeAt(i)] = i
}

function base64ToUint8Array(base64: string): Uint8Array {
  // Strip padding
  let str = base64
  while (str.length > 0 && str[str.length - 1] === '=') {
    str = str.slice(0, -1)
  }

  const len = str.length
  const bytes = new Uint8Array(Math.floor((len * 3) / 4))
  let p = 0

  for (let i = 0; i < len; i += 4) {
    const a = B64_LOOKUP[str.charCodeAt(i)]
    const b = i + 1 < len ? B64_LOOKUP[str.charCodeAt(i + 1)] : 0
    const c = i + 2 < len ? B64_LOOKUP[str.charCodeAt(i + 2)] : 0
    const d = i + 3 < len ? B64_LOOKUP[str.charCodeAt(i + 3)] : 0

    bytes[p++] = (a << 2) | (b >> 4)
    if (i + 2 < len) bytes[p++] = ((b & 0x0f) << 4) | (c >> 2)
    if (i + 3 < len) bytes[p++] = ((c & 0x03) << 6) | d
  }

  return bytes.subarray(0, p)
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = ''
  const len = bytes.length

  for (let i = 0; i < len; i += 3) {
    const a = bytes[i]
    const b = i + 1 < len ? bytes[i + 1] : 0
    const c = i + 2 < len ? bytes[i + 2] : 0

    result += B64_CHARS[a >> 2]
    result += B64_CHARS[((a & 0x03) << 4) | (b >> 4)]
    result += i + 1 < len ? B64_CHARS[((b & 0x0f) << 2) | (c >> 6)] : '='
    result += i + 2 < len ? B64_CHARS[c & 0x3f] : '='
  }

  return result
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}

/**
 * Write raw PCM base64 audio to a temp WAV file and return the file URI.
 * Gemini TTS returns raw PCM (16-bit, 24kHz, mono).
 * Writes the Uint8Array directly to avoid slow base64 re-encoding.
 */
export function writePcmToTempWav(
  pcmBase64: string,
  sampleRate: number = 24000,
): string {
  console.log('[Audio] Decoding base64 PCM, length:', pcmBase64.length)
  const pcmData = base64ToUint8Array(pcmBase64)
  console.log('[Audio] PCM decoded, bytes:', pcmData.length)

  const pcmLength = pcmData.length
  const wavLength = 44 + pcmLength
  const buffer = new ArrayBuffer(wavLength)
  const view = new DataView(buffer)
  const uint8 = new Uint8Array(buffer)

  const channels = 1
  const bitsPerSample = 16
  const byteRate = sampleRate * channels * (bitsPerSample / 8)
  const blockAlign = channels * (bitsPerSample / 8)

  writeStr(view, 0, 'RIFF')
  view.setUint32(4, wavLength - 8, true)
  writeStr(view, 8, 'WAVE')
  writeStr(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, byteRate, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, bitsPerSample, true)
  writeStr(view, 36, 'data')
  view.setUint32(40, pcmLength, true)
  uint8.set(pcmData, 44)

  // Write Uint8Array directly - no base64 re-encoding needed
  const fileName = `tts-audio-${Date.now()}.wav`
  const file = new File(Paths.cache, fileName)
  file.write(uint8)
  console.log('[Audio] WAV written:', file.uri, 'size:', wavLength)
  return file.uri
}

/**
 * Strip WAV/RIFF header from base64-encoded audio if present.
 * The recorder produces WAV files (44-byte header) but Gemini expects raw PCM.
 */
export function stripWavHeaderFromBase64(base64: string): string {
  const bytes = base64ToUint8Array(base64)
  // Check for RIFF header: 'R' 'I' 'F' 'F'
  if (
    bytes.length > 44 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46    // F
  ) {
    // Standard WAV header is 44 bytes; return only the PCM data after it
    return uint8ArrayToBase64(bytes.subarray(44))
  }
  // Not a WAV file, return as-is
  return base64
}

