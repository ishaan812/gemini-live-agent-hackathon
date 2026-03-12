[Skip to main content](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#main-content)

[![Gemini API](https://ai.google.dev/_static/googledevai/images/gemini-api-logo.svg)](https://ai.google.dev/)

`/`

Language

- [English](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk)
- [Deutsch](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=de)
- [Español – América Latina](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=es-419)
- [Français](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=fr)
- [Indonesia](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=id)
- [Italiano](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=it)
- [Polski](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=pl)
- [Português – Brasil](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=pt-br)
- [Shqip](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=sq)
- [Tiếng Việt](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=vi)
- [Türkçe](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=tr)
- [Русский](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=ru)
- [עברית](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=he)
- [العربيّة](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=ar)
- [فارسی](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=fa)
- [हिंदी](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=hi)
- [বাংলা](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=bn)
- [ภาษาไทย](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=th)
- [中文 – 简体](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=zh-cn)
- [中文 – 繁體](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=zh-tw)
- [日本語](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=ja)
- [한국어](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk?hl=ko)

[Get API key](https://aistudio.google.com/apikey) [Cookbook](https://github.com/google-gemini/cookbook) [Community](https://discuss.ai.google.dev/c/gemini-api/)

[Sign in](https://ai.google.dev/_d/signin?continue=https%3A%2F%2Fai.google.dev%2Fgemini-api%2Fdocs%2Flive-api%2Fget-started-sdk&prompt=select_account)

- On this page
- [Overview](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#overview)
- [Connecting to the Live API](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#connecting_to_the_live_api)
- [Sending text](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_text)
- [Sending audio](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_audio)
- [Sending video](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_video)
- [Receiving audio](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#receiving_audio)
- [Receiving text](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#receiving_text)
- [Handling tool calls](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#handling_tool_calls)
- [What's next](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#whats-next)

Announcing [Gemini Embedding 2](https://ai.google.dev/gemini-api/docs/embeddings), our first fully multimodal embedding model.


- [Home](https://ai.google.dev/)
- [Gemini API](https://ai.google.dev/gemini-api)
- [Docs](https://ai.google.dev/gemini-api/docs)

Was this helpful?



 Send feedback



# Get started with Gemini Live API using the Google GenAI SDK

- On this page
- [Overview](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#overview)
- [Connecting to the Live API](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#connecting_to_the_live_api)
- [Sending text](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_text)
- [Sending audio](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_audio)
- [Sending video](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#sending_video)
- [Receiving audio](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#receiving_audio)
- [Receiving text](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#receiving_text)
- [Handling tool calls](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#handling_tool_calls)
- [What's next](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#whats-next)

The Gemini Live API allows for real-time, bidirectional interaction with Gemini models, supporting audio, video, and text inputs and native audio outputs. This guide explains how to integrate with the API using the Google GenAI SDK on your server.

[Try the Live API in Google AI Studiomic](https://aistudio.google.com/live) [Clone the example app from GitHubcode](https://github.com/google-gemini/gemini-live-api-examples/tree/main/gemini-live-genai-python-sdk) [Use coding agent skillsterminal](https://ai.google.dev/gemini-api/docs/coding-agents)

## Overview

The Gemini Live API uses WebSockets for real-time communication. The `google-genai` SDK provides a high-level asynchronous interface for managing these connections.

Key concepts:

- **Session**: A persistent connection to the model.
- **Config**: Setting up modalities (audio/text), voice, and system instructions.
- **Real-time Input**: Sending audio and video frames as blobs.

## Connecting to the Live API

Start a Live API session with an API key:

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
import asyncio
from google import genai

client = genai.Client(api_key="YOUR_API_KEY")

model = "gemini-2.5-flash-native-audio-preview-12-2025"
config = {"response_modalities": ["AUDIO"]}

async def main():
    async with client.aio.live.connect(model=model, config=config) as session:
        print("Session started")
        # Send content...

if __name__ == "__main__":
    asyncio.run(main())
```

```
import { GoogleGenAI, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: "YOUR_API_KEY"});
const model = 'gemini-2.5-flash-native-audio-preview-12-2025';
const config = { responseModalities: [Modality.AUDIO] };

async function main() {

  const session = await ai.live.connect({
    model: model,
    callbacks: {
      onopen: function () {
        console.debug('Opened');
      },
      onmessage: function (message) {
        console.debug(message);
      },
      onerror: function (e) {
        console.debug('Error:', e.message);
      },
      onclose: function (e) {
        console.debug('Close:', e.reason);
      },
    },
    config: config,
  });

  console.debug("Session started");
  // Send content...

  session.close();
}

main();
```

## Sending text

Text can be sent using `send_realtime_input` (Python) or `sendRealtimeInput` (JavaScript).

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
await session.send_realtime_input(text="Hello, how are you?")
```

```
session.sendRealtimeInput({
  text: 'Hello, how are you?'
});
```

## Sending audio

Audio needs to be sent as raw PCM data (raw 16-bit PCM audio, 16kHz, little-endian).

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
# Assuming 'chunk' is your raw PCM audio bytes
await session.send_realtime_input(
    audio=types.Blob(
        data=chunk,
        mime_type="audio/pcm;rate=16000"
    )
)
```

```
// Assuming 'chunk' is a Buffer of raw PCM audio
session.sendRealtimeInput({
  audio: {
    data: chunk.toString('base64'),
    mimeType: 'audio/pcm;rate=16000'
  }
});
```

For an example of how to get the audio from the client device (e.g. the browser)
see the end-to-end example on [GitHub](https://github.com/google-gemini/gemini-live-api-examples/blob/main/gemini-live-genai-python-sdk/frontend/media-handler.js#L31-L70).

## Sending video

Video frames are sent as individual images (e.g., JPEG or PNG) at a specific frame rate (max 1 frame per second).

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
# Assuming 'frame' is your JPEG-encoded image bytes
await session.send_realtime_input(
    video=types.Blob(
        data=frame,
        mime_type="image/jpeg"
    )
)
```

```
// Assuming 'frame' is a Buffer of JPEG-encoded image data
session.sendRealtimeInput({
  video: {
    data: frame.toString('base64'),
    mimeType: 'image/jpeg'
  }
});
```

For an example of how to get the video from the client device (e.g. the browser)
see the end-to-end example on [GitHub](https://github.com/google-gemini/gemini-live-api-examples/blob/main/gemini-live-genai-python-sdk/frontend/media-handler.js#L84-L120).

## Receiving audio

The model's audio responses are received as chunks of data.

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
async for response in session.receive():
    if response.server_content and response.server_content.model_turn:
        for part in response.server_content.model_turn.parts:
            if part.inline_data:
                audio_data = part.inline_data.data
                # Process or play the audio data
```

```
// Inside the onmessage callback
const content = response.serverContent;
if (content?.modelTurn?.parts) {
  for (const part of content.modelTurn.parts) {
    if (part.inlineData) {
      const audioData = part.inlineData.data;
      // Process or play audioData (base64 encoded string)
    }
  }
}
```

See the example app on GitHub to learn how to [receive the audio on your server](https://github.com/google-gemini/gemini-live-api-examples/blob/main/gemini-live-genai-python-sdk/gemini_live.py#L86-L98) and [play it in the browser](https://github.com/google-gemini/gemini-live-api-examples/blob/main/gemini-live-genai-python-sdk/frontend/media-handler.js#L145-L174).

## Receiving text

Transcriptions for both user input and model output are available in the server content.

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
async for response in session.receive():
    content = response.server_content
    if content:
        if content.input_transcription:
            print(f"User: {content.input_transcription.text}")
        if content.output_transcription:
            print(f"Gemini: {content.output_transcription.text}")
```

```
// Inside the onmessage callback
const content = response.serverContent;
if (content?.inputTranscription) {
  console.log('User:', content.inputTranscription.text);
}
if (content?.outputTranscription) {
  console.log('Gemini:', content.outputTranscription.text);
}
```

## Handling tool calls

The API supports tool calling (function calling). When the model requests a tool call, you must execute the function and send the response back.

[Python](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#python)[JavaScript](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#javascript)More

```
async for response in session.receive():
    if response.tool_call:
        function_responses = []
        for fc in response.tool_call.function_calls:
            # 1. Execute the function locally
            result = my_tool_function(**fc.args)

            # 2. Prepare the response
            function_responses.append(types.FunctionResponse(
                name=fc.name,
                id=fc.id,
                response={"result": result}
            ))

        # 3. Send the tool response back to the session
        await session.send_tool_response(function_responses=function_responses)
```

```
// Inside the onmessage callback
if (response.toolCall) {
  const functionResponses = [];
  for (const fc of response.toolCall.functionCalls) {
    const result = myToolFunction(fc.args);
    functionResponses.push({
      name: fc.name,
      id: fc.id,
      response: { result }
    });
  }
  session.sendToolResponse({ functionResponses });
}
```

## What's next

- Read the full Live API [Capabilities](https://ai.google.dev/gemini-api/docs/live-guide) guide for key capabilities and configurations; including Voice Activity Detection and native audio features.
- Read the [Tool use](https://ai.google.dev/gemini-api/docs/live-tools) guide to learn how to integrate Live API with tools and function calling.
- Read the [Session management](https://ai.google.dev/gemini-api/docs/live-session) guide for managing long running conversations.
- Read the [Ephemeral tokens](https://ai.google.dev/gemini-api/docs/ephemeral-tokens) guide for secure authentication in [client-to-server](https://ai.google.dev/gemini-api/docs/live-api/get-started-sdk#implementation-approach) applications.
- For more information about the underlying WebSockets API, see the [WebSockets API reference](https://ai.google.dev/api/live).

Was this helpful?



 Send feedback



Except as otherwise noted, the content of this page is licensed under the [Creative Commons Attribution 4.0 License](https://creativecommons.org/licenses/by/4.0/), and code samples are licensed under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). For details, see the [Google Developers Site Policies](https://developers.google.com/site-policies). Java is a registered trademark of Oracle and/or its affiliates.

Last updated 2026-03-09 UTC.


Need to tell us more?






\[\[\["Easy to understand","easyToUnderstand","thumb-up"\],\["Solved my problem","solvedMyProblem","thumb-up"\],\["Other","otherUp","thumb-up"\]\],\[\["Missing the information I need","missingTheInformationINeed","thumb-down"\],\["Too complicated / too many steps","tooComplicatedTooManySteps","thumb-down"\],\["Out of date","outOfDate","thumb-down"\],\["Samples / code issue","samplesCodeIssue","thumb-down"\],\["Other","otherDown","thumb-down"\]\],\["Last updated 2026-03-09 UTC."\],\[\],\[\]\]