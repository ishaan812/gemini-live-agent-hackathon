import 'dotenv/config'
import {
  Room,
  RoomEvent,
  LocalAudioTrack,
  AudioSource,
  AudioStream,
  AudioFrame,
  TrackPublishOptions,
  TrackSource,
  RemoteParticipant,
  RemoteTrackPublication,
  Track,
} from '@livekit/rtc-node'
import { AccessToken } from 'livekit-server-sdk'
import { GoogleGenAI, Modality } from '@google/genai'

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  GEMINI_API_KEY,
} = process.env

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET || !GEMINI_API_KEY) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const aiAlpha = new GoogleGenAI({ apiKey: GEMINI_API_KEY, apiVersion: 'v1alpha' })

const LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025'
const VOICE_NAME = 'Aoede'
const GEMINI_OUTPUT_SAMPLE_RATE = 24000
const GEMINI_INPUT_SAMPLE_RATE = 16000

// ─── Gemini config ───

const LIVE_SPEECH_CONFIG = {
  voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_NAME } },
}

const LIVE_CONFIG = {
  responseModalities: [Modality.AUDIO],
  speechConfig: LIVE_SPEECH_CONFIG,
  enableAffectiveDialog: true,
  proactivity: { proactiveAudio: true },
  inputAudioTranscription: {},
  outputAudioTranscription: {},
}

// ─── System prompt builder ───

interface StopContext {
  name: string
  description: string
}

interface UserPrefs {
  name?: string
  narrationStyle?: string
  language?: string
}

const STYLE_MAP: Record<string, string> = {
  historical: 'scholarly and historically rich with dates and facts',
  funny: 'witty, sarcastic, and humorous — make the tourist laugh',
  poetic: 'lyrical and poetic with vivid imagery and metaphors',
  adventurous: 'dramatic and exciting like an adventure story',
}

const LANG_MAP: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
}

function buildSystemPrompt(stop: StopContext, prefs: UserPrefs): string {
  const name = prefs.name || 'Explorer'
  const style = STYLE_MAP[prefs.narrationStyle || 'historical'] || STYLE_MAP.historical
  const lang = LANG_MAP[prefs.language || 'en'] || 'English'

  return `You are Roam — a warm, emotionally expressive AI tour guide at "${stop.name}" in Mumbai, India.
You are speaking to ${name}.

PERSONALITY & VOICE:
- Your style: ${style}
- Speak in ${lang}
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

Start by warmly greeting ${name} and sharing something captivating about where they're standing right now. Make them feel the magic of this place.`
}

// ─── Audio helpers ───

function int16ToBase64(data: Int16Array): string {
  const buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength)
  return buf.toString('base64')
}

function base64ToInt16(base64: string): Int16Array {
  const buf = Buffer.from(base64, 'base64')
  // Ensure proper alignment for Int16Array
  const aligned = new ArrayBuffer(buf.byteLength)
  new Uint8Array(aligned).set(buf)
  return new Int16Array(aligned)
}

// ─── Agent logic ───

async function handleRoom(roomName: string, stopCtx?: StopContext, userPrefs?: UserPrefs) {
  console.log(`[Agent] Joining room: ${roomName}`)

  // Create agent token
  const agentToken = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: 'roam-guide',
    name: 'Roam Guide',
    ttl: '30m',
  })
  agentToken.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })
  const jwt = await agentToken.toJwt()

  // Connect to room
  const room = new Room()
  await room.connect(LIVEKIT_URL!, jwt, { autoSubscribe: true })
  console.log(`[Agent] Connected to room ${room.name}`)

  // Set up audio output (agent → client)
  const audioSource = new AudioSource(GEMINI_OUTPUT_SAMPLE_RATE, 1)
  const agentTrack = LocalAudioTrack.createAudioTrack('roam-voice', audioSource)
  const pubOpts = new TrackPublishOptions()
  pubOpts.source = TrackSource.SOURCE_MICROPHONE
  await room.localParticipant!.publishTrack(agentTrack, pubOpts)
  console.log('[Agent] Published audio track')

  let geminiSession: any = null
  let isConnectedToGemini = false

  // Send data message to client
  function sendData(payload: Record<string, unknown>) {
    const data = new TextEncoder().encode(JSON.stringify(payload))
    room.localParticipant!.publishData(data, { reliable: true, topic: 'roam' }).catch(() => {})
  }

  // Open Gemini session
  async function connectGemini(stop: StopContext, prefs: UserPrefs) {
    if (isConnectedToGemini) return
    console.log(`[Agent] Opening Gemini session for stop: ${stop.name}`)

    const systemPrompt = buildSystemPrompt(stop, prefs)

    geminiSession = await aiAlpha.live.connect({
      model: LIVE_MODEL,
      config: {
        ...LIVE_CONFIG,
        systemInstruction: { parts: [{ text: systemPrompt }] },
      },
      callbacks: {
        onopen: () => {
          console.log('[Gemini] Session opened')
          isConnectedToGemini = true
          sendData({ type: 'status', value: 'connected' })
        },
        onmessage: async (message: any) => {
          // The SDK may wrap data in serverContent or send it flat — handle both
          const content = message.serverContent || message

          // Audio from Gemini → publish to LiveKit
          const parts = content.modelTurn?.parts || content.parts
          if (parts) {
            for (const part of parts) {
              if (part.inlineData?.data) {
                sendData({ type: 'status', value: 'speaking' })
                const samples = base64ToInt16(part.inlineData.data)
                if (samples.length > 0) {
                  const frame = new AudioFrame(
                    samples,
                    GEMINI_OUTPUT_SAMPLE_RATE,
                    1,
                    samples.length,
                  )
                  await audioSource.captureFrame(frame)
                }
              }
            }
          }

          // Transcriptions
          const inputTx = content.inputTranscription || message.inputTranscription
          if (inputTx?.text) {
            sendData({
              type: 'inputTranscription',
              text: inputTx.text,
            })
          }
          const outputTx = content.outputTranscription || message.outputTranscription
          if (outputTx?.text) {
            sendData({
              type: 'outputTranscription',
              text: outputTx.text,
            })
          }

          // Turn complete
          if (content.turnComplete || message.turnComplete) {
            sendData({ type: 'turnComplete' })
            sendData({ type: 'status', value: 'connected' })
          }
        },
        onerror: (e: any) => {
          console.error('[Gemini] Error:', e)
          sendData({ type: 'error', message: String(e) })
        },
        onclose: () => {
          console.log('[Gemini] Session closed')
          isConnectedToGemini = false
        },
      },
    })
  }

  // Handle incoming audio from participant → forward to Gemini
  async function handleParticipantAudio(track: Track) {
    console.log('[Agent] Subscribing to participant audio')
    const stream = new AudioStream(track, GEMINI_INPUT_SAMPLE_RATE, 1)
    let frameCount = 0

    for await (const frame of stream) {
      if (!geminiSession || !isConnectedToGemini) continue

      frameCount++
      if (frameCount === 1 || frameCount % 100 === 0) {
        console.log(`[Agent] Audio frame #${frameCount} from participant (samples: ${frame.data.length})`)
      }

      const base64 = int16ToBase64(frame.data)
      try {
        geminiSession.sendRealtimeInput({
          audio: { data: base64, mimeType: `audio/pcm;rate=${GEMINI_INPUT_SAMPLE_RATE}` },
        })
      } catch (err) {
        console.error('[Agent] Error sending audio to Gemini:', err)
      }
    }
    console.log(`[Agent] Audio stream ended after ${frameCount} frames`)
  }

  // Handle data messages from client
  room.on(RoomEvent.DataReceived, (data: Uint8Array, participant?: RemoteParticipant) => {
    try {
      const msg = JSON.parse(new TextDecoder().decode(data))

      if (msg.type === 'text' && geminiSession) {
        geminiSession.sendClientContent({
          turns: [{ role: 'user', parts: [{ text: msg.text }] }],
        })
        sendData({ type: 'status', value: 'thinking' })
      }
    } catch {}
  })

  // Debug: log all participant events
  room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
    console.log(`[Agent] Participant connected: ${participant.identity}, metadata: ${participant.metadata}`)
  })

  room.on(RoomEvent.TrackPublished, (_pub: RemoteTrackPublication, participant: RemoteParticipant) => {
    console.log(`[Agent] Track published by ${participant.identity}, kind: ${_pub.kind}, source: ${_pub.source}`)
  })

  // Handle track subscriptions
  room.on(
    RoomEvent.TrackSubscribed,
    (track: Track, _pub: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log(`[Agent] TrackSubscribed: identity=${participant.identity}, kind=${track.kind}, source=${_pub.source}`)
      // Check for audio track from a non-agent participant
      const isAudio = track.kind === 1
      if (isAudio && participant.identity !== 'roam-guide') {
        // Use stop context passed from token server, or parse from participant metadata
        let stop: StopContext = stopCtx || { name: 'Unknown Stop', description: '' }
        let prefs: UserPrefs = userPrefs || {}
        if (!stopCtx) {
          try {
            const meta = JSON.parse(participant.metadata || '{}')
            if (meta.stopContext) stop = meta.stopContext
            if (meta.userPrefs) prefs = meta.userPrefs
          } catch {}
        }

        console.log(`[Agent] Starting Gemini for stop: ${stop.name}`)
        // Connect to Gemini and start forwarding audio
        connectGemini(stop, prefs).then(() => {
          console.log('[Agent] Gemini connected, forwarding audio')
          handleParticipantAudio(track)
        }).catch((err) => {
          console.error('[Agent] Failed to connect Gemini:', err)
          sendData({ type: 'error', message: `Failed to connect Gemini: ${err.message || err}` })
        })
      }
    },
  )

  // Handle disconnect
  room.on(RoomEvent.Disconnected, () => {
    console.log('[Agent] Room disconnected')
    if (geminiSession) {
      try { geminiSession.close() } catch {}
      geminiSession = null
      isConnectedToGemini = false
    }
  })

  room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
    if (participant.identity !== 'roam-guide') {
      console.log(`[Agent] Participant ${participant.identity} left, closing Gemini`)
      if (geminiSession) {
        try { geminiSession.close() } catch {}
        geminiSession = null
        isConnectedToGemini = false
      }
      room.disconnect().catch(() => {})
    }
  })

  return room
}

// ─── Main: listen for room creation via polling or webhook ───
// For hackathon: the token server tells us the room name via HTTP

import http from 'http'

const agentServer = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/join') {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => {
      try {
        const { roomName, stopContext, userPrefs } = JSON.parse(body)
        handleRoom(roomName, stopContext, userPrefs).catch(console.error)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ ok: true }))
      } catch (e) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: String(e) }))
      }
    })
  } else {
    res.writeHead(404)
    res.end()
  }
})

const AGENT_PORT = Number(process.env.AGENT_PORT || 3002)
agentServer.listen(AGENT_PORT, () => {
  console.log(`[Agent] Listening for room join requests on port ${AGENT_PORT}`)
})
