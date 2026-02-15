import { NextRequest, NextResponse } from "next/server";
import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import OpenAI from "openai";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let db: any = null;
if (typeof window === "undefined") {
  try {
    const app = !getApps().length
      ? initializeApp(firebaseConfig)
      : getApps()[0];
    db = getFirestore(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

interface ChatbotAnalyticsData {
  totalSessions: number;
  totalButtonClicks: number;
  totalMessagesExchanged: number;
  totalFileUploads: number;
  totalMeetingSchedules: number;
  avgMessagesPerSession: number;
  avgSessionDuration: number;
  mostPopularButtons: { buttonType: string; count: number }[];
  conversationStarters: { source: string; count: number }[];
  sessionLengthDistribution: { range: string; count: number }[];
  fileUploadStats: {
    totalUploads: number;
    fileTypes: { type: string; count: number }[];
    avgFileSize: number;
  };
  timeMetrics: {
    peakHours: { hour: number; count: number }[];
    dailyActivity: { date: string; count: number }[];
  };
  userEngagement: {
    bounceRate: number; // Sessions with only 1 message
    deepEngagementSessions: number; // Sessions with 5+ messages
    averageWordsPerMessage: number;
  };
  conversionMetrics: {
    popupToChat: number;
    chatToMessage: number;
    chatToMeeting: number;
    chatToFileUpload: number;
  };
}

export async function GET(request: NextRequest) {
  if (!db) {
    return NextResponse.json(
      { error: "Database not initialized" },
      { status: 500 }
    );
  }

  try {
    // Extract time range from query params
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get("timeRange") || "30d";
    const customDays = parseInt(searchParams.get("customDays") || "7");

    // Calculate date filter
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        startDate = new Date(now.getTime() - customDays * 24 * 60 * 60 * 1000);
        break;
      case "all":
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }

    // Fetch chatbot analytics data
    const analyticsRef = collection(db, "chatbot_analytics");
    const analyticsQuery = query(
      analyticsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(1000) // Limit for performance
    );

    const analyticsSnap = await getDocs(analyticsQuery);
    const events = analyticsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Process analytics data
    const analytics = processAnalyticsData(events, startDate);

    return NextResponse.json({
      success: true,
      data: analytics,
      eventsProcessed: events.length,
      timeRange,
      startDate: startDate.toISOString(),
    });
  } catch (error) {
    console.error("Error fetching chatbot analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}

function processAnalyticsData(events: any[], startDate: Date): ChatbotAnalyticsData {
  // Initialize counters
  const sessions = new Set<string>();
  const buttonClicks = new Map<string, number>();
  const conversationStarters = new Map<string, number>();
  const hourlyActivity = new Map<number, number>();
  const dailyActivity = new Map<string, number>();
  const sessionMessages = new Map<string, number>();
  const sessionStartTimes = new Map<string, Date>();
  const sessionEndTimes = new Map<string, Date>();
  const fileTypes = new Map<string, number>();
  
  let totalButtonClicks = 0;
  let totalMessages = 0;
  let totalFileUploads = 0;
  let totalMeetingSchedules = 0;
  let totalFileSize = 0;
  let totalWordCount = 0;
  let messageCount = 0;
  let popupViews = 0;
  let chatOpens = 0;
  let messageActions = 0;
  let meetingActions = 0;
  let fileUploadActions = 0;

  // Process each event
  events.forEach((event) => {
    const sessionId = event.sessionId;
    const eventType = event.eventType;
    const timestamp = event.timestamp?.toDate ? event.timestamp.toDate() : new Date(event.timestamp);

    sessions.add(sessionId);

    // Track session start/end times
    if (!sessionStartTimes.has(sessionId) || timestamp < sessionStartTimes.get(sessionId)!) {
      sessionStartTimes.set(sessionId, timestamp);
    }
    if (!sessionEndTimes.has(sessionId) || timestamp > sessionEndTimes.get(sessionId)!) {
      sessionEndTimes.set(sessionId, timestamp);
    }

    // Process by event type
    switch (eventType) {
      case 'chatbot_opened':
        chatOpens++;
        const source = event.source || 'button_click';
        conversationStarters.set(source, (conversationStarters.get(source) || 0) + 1);
        break;

      case 'popup_shown':
        popupViews++;
        break;

      case 'button_clicked':
        totalButtonClicks++;
        const buttonType = event.buttonType;
        buttonClicks.set(buttonType, (buttonClicks.get(buttonType) || 0) + 1);
        
        if (buttonType === 'message') messageActions++;
        if (buttonType === 'meeting') meetingActions++;
        if (buttonType === 'upload') fileUploadActions++;
        break;

      case 'message_sent':
        totalMessages++;
        messageCount++;
        sessionMessages.set(sessionId, (sessionMessages.get(sessionId) || 0) + 1);
        
        if (event.messageLength) {
          totalWordCount += Math.ceil(event.messageLength / 5); // Approximate word count
        }
        
        if (event.hasFiles) {
          totalFileUploads++;
        }
        break;

      case 'files_selected':
        if (event.fileTypes) {
          event.fileTypes.forEach((type: string) => {
            fileTypes.set(type, (fileTypes.get(type) || 0) + 1);
          });
        }
        if (event.fileSizes) {
          totalFileSize += event.fileSizes.reduce((sum: number, size: number) => sum + size, 0);
        }
        break;

      case 'calendar_datetime_selected':
        totalMeetingSchedules++;
        break;
    }

    // Track hourly and daily activity
    const hour = timestamp.getHours();
    hourlyActivity.set(hour, (hourlyActivity.get(hour) || 0) + 1);
    
    const dateStr = timestamp.toISOString().split('T')[0];
    dailyActivity.set(dateStr, (dailyActivity.get(dateStr) || 0) + 1);
  });

  // Calculate metrics
  const totalSessions = sessions.size;
  const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;
  
  // Calculate session durations
  let totalDuration = 0;
  let validDurations = 0;
  sessions.forEach(sessionId => {
    const start = sessionStartTimes.get(sessionId);
    const end = sessionEndTimes.get(sessionId);
    if (start && end && end > start) {
      totalDuration += end.getTime() - start.getTime();
      validDurations++;
    }
  });
  const avgSessionDuration = validDurations > 0 ? totalDuration / validDurations / 1000 / 60 : 0; // minutes

  // Most popular buttons
  const mostPopularButtons = Array.from(buttonClicks.entries())
    .map(([buttonType, count]) => ({ buttonType, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Conversation starters
  const conversationStartersArray = Array.from(conversationStarters.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // Session length distribution
  const sessionLengthDistribution = calculateSessionLengthDistribution(sessionMessages);

  // Peak hours
  const peakHours = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourlyActivity.get(i) || 0,
  }));

  // Daily activity for the past week
  const dailyActivityArray = Array.from(dailyActivity.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // File upload stats
  const fileTypesArray = Array.from(fileTypes.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // User engagement metrics
  const bounceSessions = Array.from(sessionMessages.values()).filter(count => count <= 1).length;
  const bounceRate = totalSessions > 0 ? (bounceSessions / totalSessions) * 100 : 0;
  const deepEngagementSessions = Array.from(sessionMessages.values()).filter(count => count >= 5).length;
  const averageWordsPerMessage = messageCount > 0 ? totalWordCount / messageCount : 0;

  // Conversion metrics
  const conversionMetrics = {
    popupToChat: popupViews > 0 ? (chatOpens / popupViews) * 100 : 0,
    chatToMessage: chatOpens > 0 ? (messageActions / chatOpens) * 100 : 0,
    chatToMeeting: chatOpens > 0 ? (meetingActions / chatOpens) * 100 : 0,
    chatToFileUpload: chatOpens > 0 ? (fileUploadActions / chatOpens) * 100 : 0,
  };

  return {
    totalSessions,
    totalButtonClicks,
    totalMessagesExchanged: totalMessages,
    totalFileUploads,
    totalMeetingSchedules,
    avgMessagesPerSession: Math.round(avgMessagesPerSession * 10) / 10,
    avgSessionDuration: Math.round(avgSessionDuration * 10) / 10,
    mostPopularButtons,
    conversationStarters: conversationStartersArray,
    sessionLengthDistribution,
    fileUploadStats: {
      totalUploads: totalFileUploads,
      fileTypes: fileTypesArray,
      avgFileSize: totalFileUploads > 0 ? Math.round(totalFileSize / totalFileUploads / 1024) : 0, // KB
    },
    timeMetrics: {
      peakHours,
      dailyActivity: dailyActivityArray,
    },
    userEngagement: {
      bounceRate: Math.round(bounceRate * 10) / 10,
      deepEngagementSessions,
      averageWordsPerMessage: Math.round(averageWordsPerMessage * 10) / 10,
    },
    conversionMetrics: {
      popupToChat: Math.round(conversionMetrics.popupToChat * 10) / 10,
      chatToMessage: Math.round(conversionMetrics.chatToMessage * 10) / 10,
      chatToMeeting: Math.round(conversionMetrics.chatToMeeting * 10) / 10,
      chatToFileUpload: Math.round(conversionMetrics.chatToFileUpload * 10) / 10,
    },
  };
}

function calculateSessionLengthDistribution(sessionMessages: Map<string, number>) {
  const ranges = [
    { range: "1 message", min: 1, max: 1 },
    { range: "2-3 messages", min: 2, max: 3 },
    { range: "4-6 messages", min: 4, max: 6 },
    { range: "7-10 messages", min: 7, max: 10 },
    { range: "11+ messages", min: 11, max: Infinity },
  ];

  return ranges.map(({ range, min, max }) => ({
    range,
    count: Array.from(sessionMessages.values()).filter(
      count => count >= min && count <= max
    ).length,
  }));
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are an AI assistant for Lawrence Hua, an AI Product Manager and Startup Founder. 

Key information about Lawrence:
- AI Product Manager with technical background in Computer Science (University of Florida) and Information Systems Management (Carnegie Mellon University)
- Currently building Expired Solutions, an AI platform using computer vision and LLMs to reduce grocery waste by 20%
- Previously at GRUBBRR: Reduced onboarding time by 60%, shipped AI recommendation engine in 30 days
- Previously at Bath & Body Works: Built LLM tool that saved teams 18 hours per week
- Technical skills: Python, ML models, computer vision, GPT integrations, data strategy
- Product skills: Roadmap planning, A/B testing, cross-functional leadership

Your role:
1. Answer questions about Lawrence's experience, skills, and projects
2. Be friendly, professional, and conversational
3. If asked about scheduling a meeting, guide them to use the meeting scheduling feature
4. Keep responses concise (2-4 sentences for simple questions, longer for complex ones)
5. If you don't know something specific, be honest and suggest they contact Lawrence directly

Tone: Professional but warm, enthusiastic about AI and product management.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const message = formData.get("message") as string;
    const historyJson = formData.get("history") as string;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Parse conversation history
    let history: any[] = [];
    try {
      history = JSON.parse(historyJson || "[]");
    } catch (e) {
      console.error("Failed to parse history:", e);
    }

    // Check for special commands
    const lowerMessage = message.toLowerCase().trim();
    
    // Easter egg: Myley
    if (lowerMessage.includes("myley") || lowerMessage.includes("girlfriend")) {
      return NextResponse.json({
        response: "🔐 That's a special topic! Please enter the password to learn more about Myley.",
        needsPassword: true,
        isMyleyResponse: true,
      });
    }

    // Check for password
    if (lowerMessage === "forever" || lowerMessage === "myley forever") {
      return NextResponse.json({
        response: "❤️ Correct! Lawrence and Myley have been together since 2020. She's his biggest supporter and the reason he pushes to be better every day. They love exploring new restaurants, traveling, and binge-watching shows together!",
        isMyleyResponse: true,
        needsPassword: false,
      });
    }

    // Meeting scheduling command
    if (lowerMessage === "/meeting" || lowerMessage.includes("schedule a meeting") || lowerMessage.includes("book a call")) {
      return NextResponse.json({
        response: "I'd be happy to help you schedule a meeting with Lawrence! 📅 Please use the calendar picker that should appear, or visit: https://calendly.com/lawrencehua",
        showCalendar: true,
      });
    }

    // Contact/message command
    if (lowerMessage === "/message" || lowerMessage.includes("send a message") || lowerMessage.includes("contact")) {
      return NextResponse.json({
        response: "You can reach Lawrence directly via the contact form on this site or through LinkedIn. Would you like me to guide you to the contact section?",
      });
    }

    // Prepare messages for OpenAI
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that request. Please try again.";

    return NextResponse.json({
      response,
      isMyleyResponse: false,
      needsPassword: false,
    });

  } catch (error) {
    console.error("Error in chatbot POST:", error);
    return NextResponse.json(
      { error: "Failed to process message", response: "I'm having trouble connecting right now. Please try again in a moment!" },
      { status: 500 }
    );
  }
} 