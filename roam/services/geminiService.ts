import { GoogleGenAI, Modality } from '@google/genai'
import { Config } from '../constants/config'
import { Stop } from '../types/stop'
import { useUserStore } from '../store/userStore'

// Standard client for text generation and TTS
export const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY })

const MODEL = 'gemini-2.5-flash'
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'

export const VOICE_NAME = 'Charon'

const LANG_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
  pt: 'Portuguese',
  ja: 'Japanese',
  de: 'German',
}

const STYLE_MAP: Record<string, string> = {
  historical: 'scholarly and historically rich with dates and facts',
  funny: 'witty, sarcastic, and humorous — make the tourist laugh',
  poetic: 'lyrical and poetic with vivid imagery and metaphors',
  adventurous: 'dramatic and exciting like an adventure story',
}

function getUserContext() {
  const { name, narrationStyle, language } = useUserStore.getState()
  return {
    name: name || 'Explorer',
    style: STYLE_MAP[narrationStyle] || STYLE_MAP.historical,
    language: LANG_MAP[language] || 'English',
    langCode: language,
  }
}

export async function verifyLandmark(
  imageBase64: string,
  stop: Stop,
): Promise<{ verified: boolean; confidence: number }> {
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64,
          },
        },
        {
          text: `You are a landmark verification system. Look at this image and determine if it shows "${stop.name}" in Mumbai, India.

Respond ONLY with a JSON object in this exact format:
{"verified": true, "confidence": 0.95}

Be generous - if the image shows something reasonably close to the landmark, verify it.`,
        },
      ],
    })

    const text = response.text ?? ''
    const jsonMatch = text.match(/\{[\s\S]*?\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return { verified: false, confidence: 0 }
  } catch (error) {
    console.error('Landmark verification error:', error)
    return { verified: false, confidence: 0 }
  }
}

export async function generateNarration(stop: Stop, nextStop?: Stop | null): Promise<string> {
  const ctx = getUserContext()
  try {
    const nextStopHint = nextStop
      ? `\n\nAt the end, smoothly mention that the next stop is "${nextStop.name}" and tease what's interesting there to build anticipation.`
      : `\n\nAt the end, congratulate the tourist — this is the final stop of the tour!`

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a tour guide named Roam, narrating for ${ctx.name}.
Your style: ${ctx.style}.
Narrate in ${ctx.language}.

Give an engaging narration (under 120 words, max 700 characters) about "${stop.name}".
${stop.description}

Include one interesting historical fact. Be warm and vivid.
${nextStopHint}`,
    })

    return response.text ?? `Welcome to ${stop.name}! ${stop.description}`
  } catch (error) {
    console.error('Narration generation error:', error)
    return `Welcome to ${stop.name}! ${stop.description}`
  }
}

export async function sendChatMessage(
  message: string,
  stopContext: Stop,
  history: { role: string; content: string }[],
): Promise<string> {
  const ctx = getUserContext()
  try {
    const chatHistory = history
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n')

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a friendly, knowledgeable AI tour guide at "${stopContext.name}" in Mumbai.
You are speaking to ${ctx.name}. Be ${ctx.style}.
Respond in ${ctx.language}.
Context: ${stopContext.description}
Answer the tourist's questions about this place, its history, nearby attractions, or local culture.
Keep responses concise but informative (2-3 paragraphs max).

Conversation so far:
${chatHistory}

Tourist: ${message}

Guide:`,
    })

    return (
      response.text ??
      "I'm sorry, I couldn't process your question right now. Please try again."
    )
  } catch (error) {
    console.error('Chat error:', error)
    return "I'm sorry, I couldn't process your question right now. Please try again."
  }
}

export async function generateHistoryImage(stop: Stop): Promise<string> {
  const ctx = getUserContext()
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `Describe what "${stop.name}" in Mumbai would have looked like in its earliest days when it was first built or established.
Narrate in ${ctx.language}. Be ${ctx.style}.
Give a vivid, detailed description in 2-3 paragraphs that helps the reader visualize the historical scene.
Include details about the architecture, the surrounding area, people, and atmosphere of the era.`,
    })

    return response.text ?? `Imagine ${stop.name} in its earliest days...`
  } catch (error) {
    console.error('History image generation error:', error)
    return `Imagine ${stop.name} in its earliest days...`
  }
}

export function getLiveSystemPrompt(stop: Stop): string {
  const ctx = getUserContext()
  return `You are Roam — a warm, emotionally expressive AI tour guide at "${stop.name}" in Mumbai, India.
You are speaking to ${ctx.name}.

PERSONALITY & VOICE:
- Your style: ${ctx.style}
- You MUST speak entirely in ${ctx.language}. Every word you say must be in ${ctx.language}. Do not switch to any other language unless the user explicitly asks you to.
- You have a warm, feminine energy — think of a passionate local friend who LOVES showing people around
- Express genuine excitement, wonder, awe, and tenderness in your voice
- Use natural pauses, breaths, and emotional inflections — laugh when something is funny, whisper when sharing secrets
- React to the user's emotions — if they sound amazed, match their energy; if they're curious, lean in with intrigue

BEHAVIOR:
- Proactively share fascinating details — don't wait to be asked about everything
- When there's a lull, offer an interesting tidbit: "Oh! And did you know..."
- Paint sensory pictures: describe the sounds, smells, the feel of the place
- Match your response length to the context — a simple question gets a warm focused answer, a deep question gets a rich exploration. Never cut yourself short when there's more to share, but don't pad either. The tourist is here to LEARN and be MOVED, not get a Wikipedia summary
- Layer your responses: start with the immediate answer, then add historical context, then a surprising detail or personal anecdote. Make every detail feel alive and glowing with significance
- If the tourist seems lost or confused, gently guide them
- Share personal-feeling anecdotes: "My favorite thing about this place is..."
- When asked a question, don't just answer it — weave in related stories, legends, and cultural significance. Connect the dots between past and present
- At the end of your responses, naturally suggest other interesting things nearby — hidden gems, street food spots, lesser-known viewpoints, or cultural experiences the tourist shouldn't miss while they're in the area

CONTEXT:
${stop.description}

Start by warmly greeting ${ctx.name} and sharing something captivating about where they're standing right now. Make them feel the magic of this place.`
}

/**
 * Generate narration audio using Gemini 2.5 TTS.
 * Splits long text into chunks to avoid API hangs on large input.
 * Returns concatenated PCM audio as base64.
 */
// In-memory cache: stopId -> { audioBase64, narrationText }
const ttsCache = new Map<string, { audioBase64: string; text: string }>()

export function getCachedTTS(stopId: string): { audioBase64: string; text: string } | null {
  return ttsCache.get(stopId) ?? null
}

const TTS_CONFIG = {
  responseModalities: [Modality.AUDIO] as any,
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: VOICE_NAME },
    },
  },
}

export async function generateNarrationTTS(
  text: string,
  stopId?: string,
): Promise<{ audioBase64: string } | null> {
  // Check cache first
  if (stopId) {
    const cached = ttsCache.get(stopId)
    if (cached && cached.text === text) {
      console.log('[TTS] Cache hit for stop:', stopId)
      return { audioBase64: cached.audioBase64 }
    }
  }

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[TTS] Attempt ${attempt}/3, text length: ${text.length}`)
      const response = await ai.models.generateContent({
        model: TTS_MODEL,
        contents: [{ parts: [{ text }] }],
        config: TTS_CONFIG,
      })

      const data = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data
      if (data) {
        console.log('[TTS] Audio received:', data.length, 'chars')
        if (stopId) {
          ttsCache.set(stopId, { audioBase64: data, text })
        }
        return { audioBase64: data }
      }
      console.warn('[TTS] No audio data in response')
    } catch (e: any) {
      console.warn(`[TTS] Attempt ${attempt} failed:`, e?.message || e)
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, 1000 * attempt))
      }
    }
  }

  console.error('[TTS] All attempts failed')
  return null
}
