import { authFetch } from './apiClient';

export interface ChatResponse {
  text: string;
  provider: 'gemini' | 'ollama' | 'database' | 'no_context' | 'unavailable';
  conversation_id: string;
  sources: string[];
}

export async function sendChatMessage(message: string, conversationId?: string): Promise<ChatResponse> {
  return authFetch('/api/ai/chat', {
    method: 'POST',
    body: { message, conversation_id: conversationId },
    fallbackError: "I'm unable to reach the AI service right now. Please try again shortly.",
  });
}
