---
name: No fallbacks policy
description: Never add fallback logic in the Roam app - either the main Gemini API works or nothing. No device TTS, no fallback paths.
type: feedback
---

For the Roam tour guide app: NEVER add fallback logic anywhere. It's either the main API (Gemini) works or nothing. No device TTS fallbacks, no alternative paths. If the API call fails, it fails - don't silently degrade to a worse experience.
