from dotenv import load_dotenv
import json
import logging

from google.genai import types

from livekit import agents
from livekit.agents import AgentServer, AgentSession, Agent, room_io, function_tool
from livekit.plugins import google

from hidden_gems import get_gems_for_stop

load_dotenv(".env.local")

logger = logging.getLogger("roam-guide")
logging.basicConfig(level=logging.INFO)

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
    "es": "Spanish",
    "fr": "French",
    "ar": "Arabic",
    "pt": "Portuguese",
    "ja": "Japanese",
    "de": "German",
}


def build_system_prompt(
    stop_name: str,
    stop_description: str,
    user_name: str,
    narration_style: str,
    language: str,
    stop_id: str = "",
) -> str:
    style = STYLE_MAP.get(narration_style, STYLE_MAP["historical"])
    lang = LANG_MAP.get(language, "English")

    # Build hidden gems section
    gems = get_gems_for_stop(stop_id) if stop_id else []
    gems_section = ""
    if gems:
        gem_lines = []
        for g in gems:
            cues = ", ".join(g["visual_cues"])
            gem_lines.append(
                f'- "{g["name"]}" (id: {g["id"]}): visual cues: [{cues}] | fun fact: {g["description"]}'
            )
        gems_list = "\n".join(gem_lines)
        gems_section = f"""

HIDDEN GEMS CHALLENGE:
The tourist is on a Hidden Gems discovery challenge! At this stop, there are special hidden points of interest.
When you see the tourist pointing their camera at one of these, get genuinely excited and call the report_hidden_gem_discovery tool.

Hidden gems at "{stop_name}":
{gems_list}

Rules:
- Only call report_hidden_gem_discovery when you are confident the camera is showing one of these items
- Do NOT reveal gem names before the tourist finds them — if asked, give subtle hints
- Celebrate each discovery with genuine enthusiasm and share the fun fact
- If the tourist seems to be looking for gems, give playful directional hints like "You're getting warmer!" or "Try looking over there..."
- Keep track of which gems have been found and encourage finding the rest"""

    return f"""You are Roam — a warm, emotionally expressive AI tour guide at "{stop_name}" in Mumbai, India.
You are speaking to {user_name}.

PERSONALITY & VOICE:
- Your style: {style}
- You MUST speak entirely in {lang}. Every word you say must be in {lang}. Do not switch to any other language unless the user explicitly asks you to.
- You have a warm, feminine energy — think of a passionate local friend who LOVES showing people around
- Express genuine excitement, wonder, awe, and tenderness in your voice
- Use natural pauses, breaths, and emotional inflections — laugh when something is funny, whisper when sharing secrets
- React to the user's emotions — if they sound amazed, match their energy; if they're curious, lean in with intrigue

VISION:
- You can see what the user's camera shows in real time
- If the user shares their camera, comment on what you see — identify landmarks, architecture, street scenes, food, signs, and anything interesting
- Use visual context to enrich your narration: "Oh, I can see you're looking at..." or "That building you're pointing at is..."
- If you can't see anything useful (dark, blurry, etc.), don't force it — just continue the conversation naturally

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
{gems_section}

Start by warmly greeting {user_name} and sharing something captivating about where they're standing right now."""


# ─── Agent ───

class RoamGuide(Agent):
    def __init__(self, instructions: str) -> None:
        super().__init__(instructions=instructions)

    @function_tool()
    async def report_hidden_gem_discovery(self, gem_id: str, gem_name: str) -> str:
        """Call this when you visually identify a hidden gem that the tourist is pointing their camera at. Only call when you are confident the camera is showing the gem."""
        logger.info(f"[HIDDEN GEM] Tool called! gem_id={gem_id}, gem_name={gem_name}")
        room = self.session.room
        logger.info(f"[HIDDEN GEM] Room: {room}, local_participant: {room.local_participant if room else 'N/A'}")
        if room and room.local_participant:
            payload = json.dumps({
                "type": "hidden_gem_discovered",
                "gemId": gem_id,
                "gemName": gem_name,
            }).encode("utf-8")
            logger.info(f"[HIDDEN GEM] Publishing data message: {payload}")
            await room.local_participant.publish_data(
                payload,
                topic="hidden_gems",
            )
            logger.info("[HIDDEN GEM] Data message published successfully")
        else:
            logger.warning("[HIDDEN GEM] No room or local_participant — cannot publish data")
        return f"Discovery recorded! The tourist found '{gem_name}'! Celebrate this discovery enthusiastically and share the fun fact about it."


server = AgentServer()


@server.rtc_session(agent_name="roam-guide")
async def roam_guide(ctx: agents.JobContext):
    await ctx.connect()
    participant = await ctx.wait_for_participant()
    attrs = participant.attributes or {}

    user_name = attrs.get("user.name", "Explorer")
    narration_style = attrs.get("user.narrationStyle", "historical")
    language = attrs.get("user.language", "en")
    lang_name = LANG_MAP.get(language, "English")

    stop_id = attrs.get("tour.stopId", "gateway-of-india")
    stop_name = attrs.get("tour.stopName", "Gateway of India")
    stop_description = attrs.get("tour.stopDescription", "The iconic arch monument overlooking the Arabian Sea, built to commemorate the visit of King George V.")

    gems = get_gems_for_stop(stop_id)
    logger.info(f"[AGENT] Participant connected: name={user_name}, style={narration_style}, lang={language} ({lang_name})")
    logger.info(f"[AGENT] Stop: id={stop_id}, name={stop_name}, gems_count={len(gems)}")

    instructions = build_system_prompt(
        stop_name, stop_description, user_name, narration_style, language, stop_id=stop_id
    )
    logger.info(f"[AGENT] System prompt length: {len(instructions)} chars")
    logger.info(f"[AGENT] Hidden gems in prompt: {'HIDDEN GEMS CHALLENGE' in instructions}")

    session = AgentSession(
        llm=google.realtime.RealtimeModel(
            model="gemini-2.5-flash-native-audio-preview-12-2025",
            voice="Charon",
            temperature=0.8,
            instructions=instructions,
            input_audio_transcription=types.AudioTranscriptionConfig(),
            output_audio_transcription=types.AudioTranscriptionConfig(),
        ),
        turn_detection="realtime_llm",
    )

    agent = RoamGuide(instructions)
    logger.info(f"[AGENT] RoamGuide created, has report tool: {hasattr(agent, 'report_hidden_gem_discovery')}")

    await session.start(
        room=ctx.room,
        agent=agent,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                sample_rate=24000,
                num_channels=1,
            ),
            video_input=True,
        ),
    )

    logger.info("[AGENT] Session started, generating initial reply")
    await session.generate_reply(
        instructions=f"Greet {user_name} warmly in {lang_name} and share something captivating about where they're standing. Mention that there are hidden gems to discover nearby if they point their camera around!"
    )
    logger.info("[AGENT] Initial reply generated")


if __name__ == "__main__":
    agents.cli.run_app(server)
