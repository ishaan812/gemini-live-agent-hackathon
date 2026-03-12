import { GoogleGenAI, Modality } from '@google/genai'
import { Config } from '../constants/config'
import { Stop } from '../types/stop'
import { useUserStore } from '../store/userStore'

// Standard client for text generation
export const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY })

// v1alpha client for affective dialog & proactive audio
export const aiAlpha = new GoogleGenAI({
  apiKey: Config.GEMINI_API_KEY,
  apiVersion: 'v1alpha',
})

const MODEL = 'gemini-2.5-flash'
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'
const TTS_MODEL = 'gemini-2.5-flash-preview-tts'

// Woman's voice - Aoede is breezy & expressive
export const VOICE_NAME = 'Aoede'

export const LIVE_SPEECH_CONFIG = {
  voiceConfig: {
    prebuiltVoiceConfig: { voiceName: VOICE_NAME },
  },
}

export const LIVE_CONFIG = {
  responseModalities: [Modality.AUDIO],
  speechConfig: LIVE_SPEECH_CONFIG,
  enableAffectiveDialog: true,
  proactivity: { proactiveAudio: true },
  inputAudioTranscription: {},
  outputAudioTranscription: {},
}

const LANG_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
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

Give an engaging narration (3-4 paragraphs) about "${stop.name}".
${stop.description}

Include interesting historical facts, cultural significance, and fascinating stories.
Write naturally with human-like warmth — include pauses (use "..." for dramatic pauses), emotional exclamations, and vivid sensory details. Make the tourist FEEL like they're standing in history.
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
- Speak in ${ctx.language}
- You have a warm, feminine energy — think of a passionate local friend who LOVES showing people around
- Express genuine excitement, wonder, awe, and tenderness in your voice
- Use natural pauses, breaths, and emotional inflections — laugh when something is funny, whisper when sharing secrets
- React to the user's emotions — if they sound amazed, match their energy; if they're curious, lean in with intrigue

BEHAVIOR:
- Proactively share fascinating details — don't wait to be asked about everything
- When there's a lull, offer an interesting tidbit: "Oh! And did you know..."
- Paint sensory pictures: describe the sounds, smells, the feel of the place
- Keep responses conversational and natural — 2-3 sentences at a time, not lectures
- If the tourist seems lost or confused, gently guide them
- Share personal-feeling anecdotes: "My favorite thing about this place is..."

CONTEXT:
${stop.description}

Start by warmly greeting ${ctx.name} and sharing something captivating about where they're standing right now. Make them feel the magic of this place.`
}

/**
 * Generate narration audio using the same Live API + Aoede voice as the guide.
 * Opens a short-lived live session, sends the text, collects audio, closes.
 */
export async function generateNarrationAudio(text: string): Promise<string | null> {
  const ctx = getUserContext()
  return new Promise((resolve) => {
    const chunks: string[] = []
    let resolved = false

    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(chunks.length > 0 ? chunks.join('') : null)
      }
    }, 30000)

    aiAlpha.live.connect({
      model: LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: LIVE_SPEECH_CONFIG,
        systemInstruction: {
          parts: [{
            text: `You are Roam, a warm expressive narrator. Read the following text aloud with emotion, dramatic flair, and natural pauses. Speak in ${ctx.language}. Your style: ${ctx.style}. Do NOT add any extra commentary — just narrate the text beautifully.`,
          }],
        },
      },
      callbacks: {
        onopen: () => {},
        onmessage: (message: any) => {
          const content = message.serverContent
          if (!content) return

          if (content.modelTurn?.parts) {
            for (const part of content.modelTurn.parts) {
              if (part.inlineData?.data) {
                chunks.push(part.inlineData.data)
              }
            }
          }

          if (content.turnComplete) {
            if (!resolved) {
              resolved = true
              clearTimeout(timeout)
              resolve(chunks.length > 0 ? chunks.join('') : null)
            }
          }
        },
        onerror: () => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            resolve(null)
          }
        },
        onclose: () => {
          if (!resolved) {
            resolved = true
            clearTimeout(timeout)
            resolve(chunks.length > 0 ? chunks.join('') : null)
          }
        },
      },
    }).then((session) => {
      // Send the narration text to be spoken
      session.sendClientContent({
        turns: [{ role: 'user', parts: [{ text }] }],
      })
    }).catch(() => {
      if (!resolved) {
        resolved = true
        clearTimeout(timeout)
        resolve(null)
      }
    })
  })
}
