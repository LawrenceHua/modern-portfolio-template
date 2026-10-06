import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseInitialized } from './firebase';
import type { ChatbotAnalyticsEvent } from '../types/chatbot';

// Generate session ID for analytics tracking
function getChatSessionId(): string {
  if (typeof window === 'undefined') return 'server';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

// Track chatbot events
export async function trackChatbotEvent(
  eventType: string,
  data: Record<string, any> = {}
) {
  if (!isFirebaseInitialized()) {
    return;
  }

  try {
    const eventData: ChatbotAnalyticsEvent = {
      eventType,
      sessionId: getChatSessionId(),
      timestamp: serverTimestamp(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server',
      page:
        typeof window !== 'undefined' ? window.location.pathname : 'unknown',
      ...data,
    };

    await addDoc(collection(db!, 'chatbot_analytics'), eventData);
    console.log(`Tracked chatbot event: ${eventType}`);
  } catch (error) {
    console.error('Error tracking chatbot event:', error);
  }
}

// Track button clicks for analytics
export async function trackButtonClick(buttonType: string, buttonText: string) {
  await trackChatbotEvent('button_click', { buttonType, buttonText });
}
