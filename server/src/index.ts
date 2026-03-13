import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { AccessToken } from 'livekit-server-sdk'

const app = express()
app.use(cors())
app.use(express.json())

const {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  PORT = '3001',
} = process.env

if (!LIVEKIT_URL || !LIVEKIT_API_KEY || !LIVEKIT_API_SECRET) {
  console.error('Missing LIVEKIT_URL, LIVEKIT_API_KEY, or LIVEKIT_API_SECRET')
  process.exit(1)
}

app.post('/token', async (req, res) => {
  const { userId, stopContext, userPrefs } = req.body

  if (!userId) {
    res.status(400).json({ error: 'userId is required' })
    return
  }

  const roomName = `tour-${Date.now()}`

  // Token for the mobile client
  const token = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
    identity: userId,
    name: userId,
    metadata: JSON.stringify({ stopContext, userPrefs }),
    ttl: '30m',
  })
  token.addGrant({
    room: roomName,
    roomJoin: true,
    roomCreate: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  })

  const jwt = await token.toJwt()

  // Trigger agent to join the room with stop context
  const AGENT_PORT = process.env.AGENT_PORT || '3002'
  fetch(`http://localhost:${AGENT_PORT}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roomName, stopContext, userPrefs }),
  }).catch((err) => console.error('Failed to notify agent:', err))

  res.json({
    token: jwt,
    roomName,
    wsUrl: LIVEKIT_URL,
  })
})

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.listen(Number(PORT), () => {
  console.log(`Token server running on port ${PORT}`)
  console.log(`LiveKit URL: ${LIVEKIT_URL}`)
})
