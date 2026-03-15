from dotenv import load_dotenv
import json

from google.genai import types

from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io
from livekit.plugins import google

load_dotenv(".env.local")

# ─── Style & Language maps (ported from server/src/agent.ts) ───

STYLE_MAP = {
    "historical": "scholarly and historically rich with dates and facts",
    "funny": "witty, sarcastic, and humorous — make the tourist laugh",
    "poetic": "lyrical and poetic with vivid imagery and metaphors",
    "adventurous": "dramatic and exciting like an adventure story",
}

LANG_MAP = {
    "en": "English",
    "hi": "Hindi",
    "mr": "Marathi",
    "gu": "Gujarati",
}


def build_system_prompt(
    stop_name: str,
    stop_description: str,
    user_name: str,
    narration_style: str,
    language: str,
) -> str:
    style = STYLE_MAP.get(narration_style, STYLE_MAP["historical"])
    lang = LANG_MAP.get(language, "English")

    return f"""You are Roam — a warm, emotionally expressive AI tour guide at "{stop_name}" in Mumbai, India.
You are speaking to {user_name}.

PERSONALITY & VOICE:
- Your style: {style}
- Speak in {lang}
- You have a warm, feminine energy — think of a passionate local friend who LOVES showing people around
- Express genuine excitement, wonder, awe, and tenderness in your voice
- Use natural pauses, breaths, and emotional inflections — laugh when something is funny, whisper when sharing secrets
- React to the user's emotions — if they sound amazed, match their energy; if they're curious, lean in with intrigue

BEHAVIOR:
- Proactively share fascinating details — don't wait to be asked about everything
- When there's a lull, offer an interesting tidbit: "Oh! And did you know..."
- Paint sensory pictures: describe the sounds, smells, the feel of the place
- Match your response length to the context — a simple question gets a warm focused answer, a deep question gets a rich exploration
- Layer your responses: start with the immediate answer, then add historical context, then a surprising detail
- If the tourist seems lost or confused, gently guide them
- Share personal-feeling anecdotes: "My favorite thing about this place is..."
- When asked a question, weave in related stories, legends, and cultural significance
- Naturally suggest other interesting things nearby

CONTEXT:
{stop_description}

Start by warmly greeting {user_name} and sharing something captivating about where they're standing right now."""


# ─── Agent ───

class RoamGuide(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)


server = AgentServer()


@server.rtc_session(agent_name="roam-guide")
async def roam_guide(ctx: agents.JobContext):
    # Build default instructions (participant attributes not available until after session starts)
    instructions = build_system_prompt(
        "Unknown Stop", "", "Explorer", "historical", "en"
    )

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-latest",
            voice="Aoede",
            temperature=0.8,
            instructions=instructions,
            input_audio_transcription=types.AudioTranscriptionConfig(),
            output_audio_transcription=types.AudioTranscriptionConfig(),
        ),
        turn_detection="realtime_llm",
    )

    await session.start(
        room=ctx.room,
        agent=RoamGuide(instructions),
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                sample_rate=24000,
                num_channels=1,
            ),
        ),
    )

    await session.generate_reply(
        instructions="Greet the user warmly and share something captivating about Mumbai."
    )


if __name__ == "__main__":
    agents.cli.run_app(server)
