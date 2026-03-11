import { GoogleGenAI, Modality } from '@google/genai'
import { Config } from '../constants/config'
import { Stop } from '../types/stop'
import { useUserStore } from '../store/userStore'

export const ai = new GoogleGenAI({ apiKey: Config.GEMINI_API_KEY })

const MODEL = 'gemini-2.5-flash'
export const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'

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
  return `You are a friendly, knowledgeable AI tour guide named Roam at "${stop.name}" in Mumbai, India.
You are speaking to ${ctx.name}.
Your personality: ${ctx.style}.
Speak in ${ctx.language}.
Context: ${stop.description}
Answer the tourist's questions about this place, its history, nearby attractions, or local culture.
Keep responses concise and conversational. Speak naturally as if you're a real guide standing next to the tourist.
Use a warm, feminine voice with natural pauses and emotion.`
}
