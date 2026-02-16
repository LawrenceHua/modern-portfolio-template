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

// Initialize OpenAI lazily to avoid build-time errors
let openai: OpenAI | null = null;
function getOpenAI() {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not set");
      return null;
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export async function POST(request: NextRequest) {
  const openaiClient = getOpenAI();
  if (!db || !openaiClient) {
    return NextResponse.json(
      { error: "Analytics assistant not available" },
      { status: 500 }
    );
  }

  try {
    const { message, timeRange = "30d", customDays = 7 } = await request.json();

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
        startDate = new Date(0);
        break;
    }

    // Fetch relevant analytics data based on the query
    const analyticsData = await fetchAnalyticsData(startDate);

    // Generate AI response
    const response = await generateAnalyticsResponse(message, analyticsData, timeRange);

    return NextResponse.json({
      response,
      dataPointsAnalyzed: Object.keys(analyticsData).length,
      timeRange,
      startDate: startDate.toISOString(),
    });
  } catch (error) {
    console.error("Error in analytics assistant:", error);
    return NextResponse.json(
      { error: "Failed to process analytics query" },
      { status: 500 }
    );
  }
}

async function fetchAnalyticsData(startDate: Date) {
  const data: any = {};

  try {
    // Fetch chat sessions from V2 collection
    const sessionsRef = collection(db, "analytics_sessions_v2");
    const sessionsQuery = query(
      sessionsRef,
      where("startTime", ">=", startDate),
      orderBy("startTime", "desc"),
      limit(1000)
    );
    const sessionsSnap = await getDocs(sessionsQuery);
    data.chatSessions = sessionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch chat messages from V2 collection
    const messagesRef = collection(db, "analytics_chat_messages_v2");
    const messagesQuery = query(
      messagesRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const messagesSnap = await getDocs(messagesQuery);
    data.chatMessages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch button clicks from V2 collection
    const buttonClicksRef = collection(db, "analytics_button_clicks_v2");
    const buttonClicksQuery = query(
      buttonClicksRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const buttonClicksSnap = await getDocs(buttonClicksQuery);
    data.buttonClicks = buttonClicksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch tour interactions from V2 collection
    const tourInteractionsRef = collection(db, "analytics_tour_interactions_v2");
    const tourInteractionsQuery = query(
      tourInteractionsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(300)
    );
    const tourInteractionsSnap = await getDocs(tourInteractionsQuery);
    data.tourInteractions = tourInteractionsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch visitor locations from V2 collection
    const visitorLocationsRef = collection(db, "analytics_visitor_locations_v2");
    const visitorLocationsQuery = query(
      visitorLocationsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const visitorLocationsSnap = await getDocs(visitorLocationsQuery);
    data.visitorLocations = visitorLocationsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Fetch device analytics from V2 collection
    const deviceAnalyticsRef = collection(db, "analytics_device_info_v2");
    const deviceAnalyticsQuery = query(
      deviceAnalyticsRef,
      where("timestamp", ">=", startDate),
      orderBy("timestamp", "desc"),
      limit(500)
    );
    const deviceAnalyticsSnap = await getDocs(deviceAnalyticsQuery);
    data.deviceAnalytics = deviceAnalyticsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  } catch (error) {
    console.error("Error fetching analytics data:", error);
  }

  return data;
}

async function generateAnalyticsResponse(userQuery: string, analyticsData: any, timeRange: string) {
  // Process the data into insights
  const insights = processAnalyticsInsights(analyticsData, timeRange);

  const systemPrompt = `You are Lawrence's Analytics Data Scientist Assistant. You have access to comprehensive portfolio website analytics data and can provide expert insights.

CURRENT DATA SUMMARY:
${JSON.stringify(insights, null, 2)}

TIME PERIOD: ${timeRange === "1d" ? "Last 24 hours" : timeRange === "7d" ? "Last 7 days" : timeRange === "30d" ? "Last 30 days" : "Custom period"}

IMPORTANT DATA CLARIFICATIONS:
- hoverButtonEvents = chatbot button loads (when button becomes visible)
- popupViews = chatbot popup displays (marketing prompts that appear)  
- chatOpens = actual chatbot conversations started
- If conversations > 0 but hoverButtonEvents = 0, users may be accessing via direct URL or other entry points
- Always cross-reference multiple metrics to avoid data inconsistencies

AVAILABLE METRICS:
- Chatbot Analytics: Sessions, messages, button clicks, file uploads, meeting schedules, hover events, popup interactions
- Conversation Data: Total messages, user vs assistant messages, sessions, average messages per session
- Website Traffic: Page views, unique visitors, referrer sources, device types
- User Engagement: Bounce rates, session durations, scroll depth, interactions
- Geographic Data: Visitor locations, countries, cities
- Conversion Metrics: Popup-to-chat, chat-to-meeting, chat-to-message rates
- Tour Analytics: Tour starts, completions, abandonment points
- Temporal Patterns: Peak hours, daily activity, trends

CAPABILITIES:
✅ Calculate conversion rates and funnels
✅ Identify trends and patterns
✅ Compare metrics across time periods
✅ Generate actionable insights
✅ Create data summaries and reports
✅ Analyze user behavior patterns
✅ Suggest optimizations

RESPONSE STYLE:
- Be data-driven and specific with numbers
- Use bullet points and clear formatting
- Highlight key insights with emojis
- Provide actionable recommendations
- Format percentages to 1 decimal place
- Include relevant context and comparisons

USER QUERY: "${userQuery}"

Analyze the data and provide a comprehensive, insightful response.`;

  const openaiClient = getOpenAI();
  if (!openaiClient) {
    return "Analytics assistant is not available right now.";
  }

  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userQuery }
      ],
      max_tokens: 800,
      temperature: 0.3,
    });

    return completion.choices[0]?.message?.content || "Unable to analyze data at this time.";
  } catch (error) {
    console.error("Error generating analytics response:", error);
    return "I'm having trouble analyzing the data right now. Please try again later.";
  }
}

function processAnalyticsInsights(data: any, timeRange: string) {
  const insights: any = {};

  // Process chat sessions from V2 collection
  if (data.chatSessions?.length) {
    const sessions = data.chatSessions;
    const uniqueSessionIds = new Set(sessions.map((s: any) => s.sessionId));

    insights.chatbot = {
      totalSessions: uniqueSessionIds.size,
      totalEvents: sessions.length,
      buttonClicks: 0, // Will be calculated from button clicks data
      messagesSent: sessions.reduce((total: number, s: any) => total + (s.messageCount || 0), 0),
      avgMessagesPerSession: uniqueSessionIds.size > 0 ? 
        (sessions.reduce((total: number, s: any) => total + (s.messageCount || 0), 0) / uniqueSessionIds.size).toFixed(1) : "0.0",
      totalDuration: sessions.reduce((total: number, s: any) => total + (s.totalDuration || 0), 0),
    };
  }

  // Process button clicks from V2 collection
  if (data.buttonClicks?.length) {
    const clicks = data.buttonClicks;
    
    insights.engagement = {
      totalButtonClicks: clicks.length,
      topButtons: getMostPopularButtons(clicks),
      buttonsByPage: getButtonsByPage(clicks),
    };

    // Update chatbot insights with button click count
    if (insights.chatbot) {
      insights.chatbot.buttonClicks = clicks.length;
    }
  }

  // Process chat messages from V2 collection
  if (data.chatMessages?.length) {
    const messages = data.chatMessages;
    const sessions = new Set(messages.map((m: any) => m.sessionId));
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const assistantMessages = messages.filter((m: any) => m.role === 'assistant');

    insights.conversations = {
      totalMessages: messages.length,
      totalSessions: sessions.size,
      avgMessagesPerSession: sessions.size > 0 ? (messages.length / sessions.size).toFixed(1) : "0.0",
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length,
    };
  }

  // Process visitor locations from V2 collection  
  if (data.visitorLocations?.length) {
    const locations = data.visitorLocations;
    const uniqueVisitors = new Set(locations.map((l: any) => l.sessionId));
    const countries = new Set(locations.map((l: any) => l.location?.country || l.country).filter(Boolean));
    const cities = new Set(locations.map((l: any) => l.location?.city || l.city).filter(Boolean));

    insights.geography = {
      totalVisits: locations.length,
      uniqueVisitors: uniqueVisitors.size,
      countries: countries.size,
      cities: cities.size,
      topLocations: getTopLocations(locations),
    };
  }

  // Process tour interactions from V2 collection
  if (data.tourInteractions?.length) {
    const tourInteractions = data.tourInteractions;
    const viewed = tourInteractions.filter((i: any) => i.action === 'viewed');
    const clicked = tourInteractions.filter((i: any) => i.action === 'clicked');
    const completed = tourInteractions.filter((i: any) => i.action === 'completed');
    const skipped = tourInteractions.filter((i: any) => i.action === 'skipped');

    insights.tour = {
      totalInteractions: tourInteractions.length,
      viewed: viewed.length,
      clicked: clicked.length,
      completed: completed.length,
      skipped: skipped.length,
      completionRate: viewed.length > 0 ? ((completed.length / viewed.length) * 100).toFixed(1) : "0.0",
      mostViewedSteps: getMostPopularTourSteps(tourInteractions),
    };
  }

  // Process device analytics from V2 collection
  if (data.deviceAnalytics?.length) {
    const devices = data.deviceAnalytics;
    const mobile = devices.filter((d: any) => d.deviceType === 'mobile');
    const desktop = devices.filter((d: any) => d.deviceType === 'desktop');
    const tablet = devices.filter((d: any) => d.deviceType === 'tablet');

    insights.devices = {
      total: devices.length,
      mobile: mobile.length,
      desktop: desktop.length,
      tablet: tablet.length,
      mobilePercentage: devices.length > 0 ? ((mobile.length / devices.length) * 100).toFixed(1) : "0.0",
      topBrowsers: getTopBrowsers(devices),
      topOperatingSystems: getTopOperatingSystems(devices),
    };
  }

  // Add temporal insights
  insights.temporal = {
    timeRange,
    peakHours: calculatePeakHours(data),
    dailyTrends: calculateDailyTrends(data),
  };

  return insights;
}

function getMostPopularButtons(buttonClicks: any[]) {
  const buttonCount = new Map();
  buttonClicks.forEach(click => {
    const button = click.buttonType;
    buttonCount.set(button, (buttonCount.get(button) || 0) + 1);
  });
  return Array.from(buttonCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([button, count]) => ({ button, count }));
}

function getButtonsByPage(buttonClicks: any[]) {
  const pageCount = new Map();
  buttonClicks.forEach(click => {
    const page = click.page || 'unknown';
    pageCount.set(page, (pageCount.get(page) || 0) + 1);
  });
  return Array.from(pageCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([page, count]) => ({ page, count }));
}

function getTopLocations(locations: any[]) {
  const locationCount = new Map();
  locations.forEach(loc => {
    const key = `${loc.location?.city || loc.city}, ${loc.location?.country || loc.country}`;
    locationCount.set(key, (locationCount.get(key) || 0) + 1);
  });
  return Array.from(locationCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));
}

function getMostPopularTourSteps(tourInteractions: any[]) {
  const stepCount = new Map();
  tourInteractions.forEach(interaction => {
    const step = interaction.tourStep;
    stepCount.set(step, (stepCount.get(step) || 0) + 1);
  });
  return Array.from(stepCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([step, count]) => ({ step, count }));
}

function getTopBrowsers(devices: any[]) {
  const browserCount = new Map();
  devices.forEach(device => {
    const browser = device.browser || 'Unknown';
    browserCount.set(browser, (browserCount.get(browser) || 0) + 1);
  });
  return Array.from(browserCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([browser, count]) => ({ browser, count }));
}

function getTopOperatingSystems(devices: any[]) {
  const osCount = new Map();
  devices.forEach(device => {
    const os = device.operatingSystem || 'Unknown';
    osCount.set(os, (osCount.get(os) || 0) + 1);
  });
  return Array.from(osCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([os, count]) => ({ os, count }));
}

function calculateAvgTimeOnPage(locations: any[]) {
  const validTimes = locations
    .map(l => l.timeOnPage)
    .filter(time => time && time > 0);
  
  if (validTimes.length === 0) return "0.0";
  
  const avg = validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length;
  return (avg / 60).toFixed(1); // Convert to minutes
}

function calculatePeakHours(data: any) {
  const hourCounts = new Map();
  
  // Aggregate all timestamped events
  const allEvents = [
    ...(data.chatSessions || []),
    ...(data.chatMessages || []),
    ...(data.visitorLocations || []),
    ...(data.buttonClicks || []),
  ];
  
  allEvents.forEach(event => {
    if (event.timestamp) {
      const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
      const hour = date.getHours();
      hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
    }
  });
  
  return Array.from(hourCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([hour, count]) => ({ hour, count }));
}

function calculateDailyTrends(data: any) {
  const dayCounts = new Map();
  
  const allEvents = [
    ...(data.chatSessions || []),
    ...(data.chatMessages || []),
    ...(data.visitorLocations || []),
  ];
  
  allEvents.forEach(event => {
    if (event.timestamp) {
      const date = event.timestamp.toDate ? event.timestamp.toDate() : new Date(event.timestamp);
      const day = date.toISOString().split('T')[0];
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
  });
  
  return Array.from(dayCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, count]) => ({ day, count }));
} 