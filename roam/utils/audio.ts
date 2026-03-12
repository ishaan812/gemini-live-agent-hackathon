import { Paths, File } from 'expo-file-system'

/**
 * Convert raw PCM base64 to WAV base64 (just the base64 string, no data: prefix).
 */
export function pcmToWavBase64(pcmBase64: string, sampleRate: number = 24000): string {
  const pcmBinary = atob(pcmBase64)
  const pcmLength = pcmBinary.length
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

  for (let i = 0; i < pcmLength; i++) {
    uint8[44 + i] = pcmBinary.charCodeAt(i)
  }

  const CHUNK = 8192
  let binary = ''
  for (let i = 0; i < uint8.length; i += CHUNK) {
    const slice = uint8.subarray(i, Math.min(i + CHUNK, uint8.length))
    binary += String.fromCharCode(...slice)
  }
  return btoa(binary)
}

/**
 * Write PCM base64 audio to a temp WAV file and return the file URI.
 */
export function writePcmToTempWav(
  pcmBase64: string,
  sampleRate: number = 24000,
): string {
  const wavBase64 = pcmToWavBase64(pcmBase64, sampleRate)
  const fileName = `gemini-audio-${Date.now()}.wav`
  const file = new File(Paths.cache, fileName)
  file.write(wavBase64, { encoding: 'base64' })
  return file.uri
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i))
  }
}
