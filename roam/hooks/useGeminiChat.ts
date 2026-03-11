import { useState, useCallback } from 'react'
import { sendChatMessage } from '../services/geminiService'
import { Stop } from '../types/stop'
import { ChatMessage } from '../types/stop'

export function useGeminiChat(stopContext: Stop | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const send = useCallback(async (userMessage: string) => {
    if (!stopContext || !userMessage.trim()) return

    const newUserMessage: ChatMessage = { role: 'user', content: userMessage }
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)
    setLoading(true)

    try {
      const response = await sendChatMessage(
        userMessage,
        stopContext,
        updatedMessages,
      )
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      }
      setMessages([...updatedMessages, assistantMessage])
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
      }
      setMessages([...updatedMessages, errorMessage])
    } finally {
      setLoading(false)
    }
  }, [stopContext, messages])

  function clearChat() {
    setMessages([])
  }

  return { messages, loading, send, clearChat }
}
