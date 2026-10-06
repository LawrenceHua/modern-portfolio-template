'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  addDoc,
  where,
} from 'firebase/firestore';
import { analyticsCacheManager } from '../../lib/analytics-cache';
import {
  AnalyticsExporter,
  loadAnalyticsFromFile,
  type ExportedAnalytics,
} from '../../lib/analytics-export';

// New Firebase Collections (v2.0 - reset from scratch)
const ANALYTICS_COLLECTIONS = {
  // Core tracking
  SESSIONS_V2: 'analytics_sessions_v2',
  PAGE_VIEWS_V2: 'analytics_page_views_v2',
  CHAT_MESSAGES_V2: 'analytics_chat_messages_v2',

  // Interaction tracking
  BUTTON_CLICKS_V2: 'analytics_button_clicks_v2',
  TOUR_INTERACTIONS_V2: 'analytics_tour_interactions_v2',

  // Device & Location
  DEVICE_ANALYTICS_V2: 'analytics_device_info_v2',
  GEO_ANALYTICS_V2: 'analytics_geo_data_v2',
  VISITOR_LOCATIONS_V2: 'analytics_visitor_locations_v2',

  // Performance tracking
  PERFORMANCE_METRICS_V2: 'analytics_performance_v2',
  USER_FLOWS_V2: 'analytics_user_flows_v2',
};

// Analytics Data Types
export interface ChatSession {
  id: string;
  sessionId: string;
  messages: ChatMessage[];
  startTime: Date;
  endTime: Date;
  messageCount: number;
  totalDuration: number;
  userAgent: string;
  deviceType: 'Mobile' | 'Desktop' | 'Tablet' | 'Unknown';
  location: {
    country: string;
    region: string;
    city: string;
    ip?: string;
  };
  engagementScore: number;
  isRecruiterSession: boolean;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  messageLength: number;
  hasFiles: boolean;
  fileTypes?: string[];
}

export interface ButtonClick {
  id: string;
  buttonType: string;
  buttonText: string;
  page: string;
  sessionId: string;
  timestamp: Date;
  location: {
    country: string;
    region: string;
    city: string;
  };
  userAgent: string;
}

export interface TourInteraction {
  id: string;
  tourStep: string;
  action: 'viewed' | 'clicked' | 'skipped' | 'completed';
  sessionId: string;
  timestamp: Date;
  timeOnStep: number;
  location: {
    country: string;
    region: string;
    city: string;
  };
}

export interface DeviceAnalytic {
  id: string;
  sessionId: string;
  deviceType: string;
  browser: string;
  os: string;
  screenSize: string;
  userAgent: string;
  timestamp: Date;
}

export interface VisitorLocation {
  id: string;
  sessionId: string;
  userAgent: string;
  referrer?: string;
  pathname: string;
  timestamp: Date;
  location: {
    country: string;
    region: string;
    city: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  ip: string;
  fresh: boolean;
}

// Re-export the interface for TypeScript
export interface AnalyticsCache {
  sessions: { data: any[]; lastUpdated: number; lastDocId?: string };
  messages: { data: any[]; lastUpdated: number; lastDocId?: string };
  buttonClicks: { data: any[]; lastUpdated: number; lastDocId?: string };
  tourInteractions: { data: any[]; lastUpdated: number; lastDocId?: string };
  deviceAnalytics: { data: any[]; lastUpdated: number; lastDocId?: string };
  visitorLocations: { data: any[]; lastUpdated: number; lastDocId?: string };
  version: string;
}

interface AnalyticsContextType {
  // Data
  chatSessions: ChatSession[];
  buttonClicks: ButtonClick[];
  tourInteractions: TourInteraction[];
  deviceAnalytics: DeviceAnalytic[];
  visitorLocations: VisitorLocation[];

  // Loading states
  loading: boolean;
  lastUpdated: Date | null;

  // Statistics
  totalSessions: number;
  totalButtonClicks: number;
  totalTourInteractions: number;
  uniqueVisitors: number;

  // Functions
  fetchAllData: () => Promise<void>;
  trackButtonClick: (
    data: Omit<ButtonClick, 'id' | 'timestamp'>
  ) => Promise<void>;
  trackTourInteraction: (
    data: Omit<TourInteraction, 'id' | 'timestamp'>
  ) => Promise<void>;
  trackVisitorLocation: (
    data: Omit<VisitorLocation, 'id' | 'timestamp'>
  ) => Promise<void>;
  refreshData: () => Promise<void>;

  // Cache management
  clearCache: () => void;
  getCacheStats: () => any;
  forceRefresh: () => void;
  fetchIncrementalDataOnly: () => Promise<void>;

  // Export functions
  exportFullAnalytics: () => Promise<void>;
  exportIncrementalAnalytics: () => Promise<void>;
  loadFromHostedFile: (fileUrl?: string) => Promise<boolean>;
  getExportStats: () => any;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Analytics Provider with export capabilities
interface AnalyticsProviderProps {
  children: React.ReactNode;
  db: any;
}

export default function AnalyticsProvider({
  children,
  db,
}: AnalyticsProviderProps) {
  // State management
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [buttonClicks, setButtonClicks] = useState<ButtonClick[]>([]);
  const [tourInteractions, setTourInteractions] = useState<TourInteraction[]>(
    []
  );
  const [deviceAnalytics, setDeviceAnalytics] = useState<DeviceAnalytic[]>([]);
  const [visitorLocations, setVisitorLocations] = useState<VisitorLocation[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Wrap all context functions in useCallback for stable references
  const fetchAllData = useCallback(async () => {
    if (!db) return;
    setLoading(true);

    try {
      console.log('🔄 Fetching analytics data with cache optimization...');

      // Check cache first and get valid cached data
      const cachedSessions = analyticsCacheManager.getCachedData('sessions');
      const cachedMessages = analyticsCacheManager.getCachedData('messages');
      const cachedButtons = analyticsCacheManager.getCachedData('buttonClicks');
      const cachedTours =
        analyticsCacheManager.getCachedData('tourInteractions');
      const cachedDevices =
        analyticsCacheManager.getCachedData('deviceAnalytics');
      const cachedVisitors =
        analyticsCacheManager.getCachedData('visitorLocations');

      // Check if we have any cached data at all (regardless of validity)
      const hasAnyCache =
        cachedSessions.length > 0 ||
        cachedMessages.length > 0 ||
        cachedButtons.length > 0 ||
        cachedTours.length > 0 ||
        cachedDevices.length > 0 ||
        cachedVisitors.length > 0;

      if (hasAnyCache) {
        console.log(
          '📦 Found cached data - displaying immediately (PURE CACHE MODE)'
        );

        // Process cached data
        const messagesBySession = cachedMessages.reduce(
          (acc, message) => {
            if (!acc[message.sessionId]) {
              acc[message.sessionId] = [];
            }
            acc[message.sessionId].push(message);
            return acc;
          },
          {} as Record<string, ChatMessage[]>
        );

        const enhancedSessions = cachedSessions.map((session) => {
          // Convert startTime and endTime to Date if needed
          const startTime =
            session.startTime instanceof Date
              ? session.startTime
              : new Date(session.startTime);
          const endTime =
            session.endTime instanceof Date
              ? session.endTime
              : new Date(session.endTime);
          const calculatedDuration = endTime.getTime() - startTime.getTime();
          return {
            ...session,
            startTime,
            endTime,
            messages: messagesBySession[session.sessionId] || [],
            messageCount:
              messagesBySession[session.sessionId]?.length ||
              session.messageCount ||
              0,
            totalDuration: calculatedDuration,
          };
        });

        // Update state with cached data
        setChatSessions(enhancedSessions);
        setButtonClicks(cachedButtons);
        setTourInteractions(cachedTours);
        setDeviceAnalytics(cachedDevices);
        setVisitorLocations(cachedVisitors);

        setLoading(false);
        console.log(
          '🚀 PURE CACHE MODE: Showing cached data only. Use manual buttons to fetch from Firebase.'
        );
        return;
      }

      // NO cache found - show empty state, don't auto-fetch from Firebase
      console.log(
        "📭 No cache found - showing empty state. Use 'Smart Update & Export' or 'Smart Refresh' to fetch from Firebase."
      );
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setLoading(false);
    }
  }, [db]);

  // 🎯 SMART INCREMENTAL UPDATE: Only fetch data newer than cache
  const fetchIncrementalDataOnly = useCallback(async () => {
    if (!db) return;

    try {
      console.log(
        '🔄 Fetching ONLY incremental data since last cache update...'
      );
      setLoading(true);

      // Get cache stats to determine last update times
      const cacheStats = analyticsCacheManager.getCacheStats();

      // Find the oldest cache timestamp to use as our cutoff
      let oldestCacheTime = Date.now();
      Object.keys(cacheStats).forEach((key) => {
        if (key !== 'version' && cacheStats[key].lastUpdated) {
          const cacheTime = new Date(cacheStats[key].lastUpdated).getTime();
          if (cacheTime < oldestCacheTime) {
            oldestCacheTime = cacheTime;
          }
        }
      });

      // Use a reasonable cutoff - either cache time or 7 days ago, whichever is more recent
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000; // Optimized from 30 days to 7 days
      const cutoffTime = new Date(Math.max(oldestCacheTime, sevenDaysAgo));

      console.log(`📊 Incremental cutoff time: ${cutoffTime.toISOString()}`);
      console.log(
        `📊 This should get data newer than: ${cutoffTime.toLocaleDateString()}`
      );
      console.log(
        `📊 Maximum lookback: 7 days, Session limit: 200 (optimized for performance)`
      );

      // Smart incremental fetch function with reasonable limits
      const fetchNewDataOnly = async (
        collectionName: string,
        cacheKey: keyof Omit<AnalyticsCache, 'version'>,
        timestampField: string = 'timestamp'
      ) => {
        // Use optimized limits for incremental updates
        const incrementalQuery = query(
          collection(db, collectionName),
          where(timestampField, '>', cutoffTime),
          orderBy(timestampField, 'desc'),
          limit(300) // Optimized from 500 to 300 for better performance
        );

        const snap = await getDocs(incrementalQuery);
        const newData = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          [timestampField]: doc.data()[timestampField]?.toDate() || new Date(),
        }));

        console.log(
          `📊 Found ${newData.length} new ${cacheKey} records since ${cutoffTime.toISOString()}`
        );
        return newData;
      };

      // Fetch sessions with special handling and higher limits
      const newSessionsQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2),
        where('startTime', '>', cutoffTime),
        orderBy('startTime', 'desc'),
        limit(150) // Optimized from 200 to 150 for better performance
      );
      const sessionsSnap = await getDocs(newSessionsQuery);
      const newSessions = sessionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
      })) as ChatSession[];

      // Fetch other collections with higher limits
      const [newMessages, newButtons, newTours, newDevices, newVisitors] =
        await Promise.all([
          fetchNewDataOnly(ANALYTICS_COLLECTIONS.CHAT_MESSAGES_V2, 'messages'),
          fetchNewDataOnly(
            ANALYTICS_COLLECTIONS.BUTTON_CLICKS_V2,
            'buttonClicks'
          ),
          fetchNewDataOnly(
            ANALYTICS_COLLECTIONS.TOUR_INTERACTIONS_V2,
            'tourInteractions'
          ),
          fetchNewDataOnly(
            ANALYTICS_COLLECTIONS.DEVICE_ANALYTICS_V2,
            'deviceAnalytics'
          ),
          fetchNewDataOnly(
            ANALYTICS_COLLECTIONS.VISITOR_LOCATIONS_V2,
            'visitorLocations'
          ),
        ]);

      console.log(`📈 Incremental update summary:`, {
        sessions: newSessions.length,
        messages: newMessages.length,
        buttonClicks: newButtons.length,
        tourInteractions: newTours.length,
        deviceAnalytics: newDevices.length,
        visitorLocations: newVisitors.length,
        cutoffTime: cutoffTime.toISOString(),
      });

      // Update cache with only new data (incremental merge)
      if (newSessions.length > 0) {
        analyticsCacheManager.updateCache('sessions', newSessions, true);
      }
      if (newMessages.length > 0) {
        analyticsCacheManager.updateCache('messages', newMessages, true);
      }
      if (newButtons.length > 0) {
        analyticsCacheManager.updateCache('buttonClicks', newButtons, true);
      }
      if (newTours.length > 0) {
        analyticsCacheManager.updateCache('tourInteractions', newTours, true);
      }
      if (newDevices.length > 0) {
        analyticsCacheManager.updateCache('deviceAnalytics', newDevices, true);
      }
      if (newVisitors.length > 0) {
        analyticsCacheManager.updateCache(
          'visitorLocations',
          newVisitors,
          true
        );
      }

      // Refresh display with updated cache
      await fetchAllData();

      const totalNewRecords =
        newSessions.length +
        newMessages.length +
        newButtons.length +
        newTours.length +
        newDevices.length +
        newVisitors.length;
      console.log(
        `✅ Incremental update complete! Added ${totalNewRecords} new records to cache.`
      );
    } catch (error) {
      console.error('Error in incremental update:', error);
    } finally {
      setLoading(false);
    }
  }, [db, fetchAllData]);

  const fetchIncrementalUpdates = useCallback(async () => {
    if (!db) return;

    try {
      console.log('🔄 Fetching incremental updates...');

      // Determine if we need incremental or full fetch
      const needsFullRefresh = !analyticsCacheManager.isCacheValid('sessions');
      const sessionsLimit = needsFullRefresh ? 500 : 200; // Optimized limits for performance

      // Fetch sessions
      let sessionsQuery = query(
        collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2),
        orderBy('startTime', 'desc'),
        limit(sessionsLimit)
      );

      // Add startAfter for incremental if we have cached data
      if (!needsFullRefresh) {
        const lastSessionId = analyticsCacheManager.getLastDocId('sessions');
        if (lastSessionId) {
          // Use optimized 7-day window for better performance
          const lastUpdate = Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days (optimized)
          sessionsQuery = query(
            collection(db, ANALYTICS_COLLECTIONS.SESSIONS_V2),
            where('startTime', '>=', new Date(lastUpdate)),
            orderBy('startTime', 'desc'),
            limit(200) // Reduced from 300 for better performance
          );
        }
      }

      const sessionsSnap = await getDocs(sessionsQuery);
      const sessions = sessionsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime?.toDate() || new Date(),
        endTime: doc.data().endTime?.toDate() || new Date(),
      })) as ChatSession[];

      // Similar incremental fetching for other collections
      const fetchCollection = async (
        collectionName: string,
        cacheKey: keyof Omit<AnalyticsCache, 'version'>,
        timestampField: string = 'timestamp'
      ) => {
        const collectionLimit = needsFullRefresh ? 1000 : 500; // Optimized limits for better performance
        let collectionQuery = query(
          collection(db, collectionName),
          orderBy(timestampField, 'desc'),
          limit(collectionLimit)
        );

        if (!needsFullRefresh) {
          // Use more efficient 7-day window for incremental updates
          const lastUpdate = Date.now() - 7 * 24 * 60 * 60 * 1000; // Last 7 days (optimized)
          collectionQuery = query(
            collection(db, collectionName),
            where(timestampField, '>=', new Date(lastUpdate)),
            orderBy(timestampField, 'desc'),
            limit(500) // Reduced from 1000 for better performance
          );
        }

        const snap = await getDocs(collectionQuery);
        return snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          [timestampField]: doc.data()[timestampField]?.toDate() || new Date(),
        }));
      };

      // Fetch all collections
      const [messages, buttons, tours, devices, visitors] = await Promise.all([
        fetchCollection(ANALYTICS_COLLECTIONS.CHAT_MESSAGES_V2, 'messages'),
        fetchCollection(ANALYTICS_COLLECTIONS.BUTTON_CLICKS_V2, 'buttonClicks'),
        fetchCollection(
          ANALYTICS_COLLECTIONS.TOUR_INTERACTIONS_V2,
          'tourInteractions'
        ),
        fetchCollection(
          ANALYTICS_COLLECTIONS.DEVICE_ANALYTICS_V2,
          'deviceAnalytics'
        ),
        fetchCollection(
          ANALYTICS_COLLECTIONS.VISITOR_LOCATIONS_V2,
          'visitorLocations'
        ),
      ]);

      // Update cache
      analyticsCacheManager.updateCache(
        'sessions',
        sessions,
        !needsFullRefresh
      );
      analyticsCacheManager.updateCache(
        'messages',
        messages,
        !needsFullRefresh
      );
      analyticsCacheManager.updateCache(
        'buttonClicks',
        buttons,
        !needsFullRefresh
      );
      analyticsCacheManager.updateCache(
        'tourInteractions',
        tours,
        !needsFullRefresh
      );
      analyticsCacheManager.updateCache(
        'deviceAnalytics',
        devices,
        !needsFullRefresh
      );
      analyticsCacheManager.updateCache(
        'visitorLocations',
        visitors,
        !needsFullRefresh
      );

      // Get updated cached data
      const allSessions = analyticsCacheManager.getCachedData('sessions');
      const allMessages = analyticsCacheManager.getCachedData('messages');
      const allButtons = analyticsCacheManager.getCachedData('buttonClicks');
      const allTours = analyticsCacheManager.getCachedData('tourInteractions');
      const allDevices = analyticsCacheManager.getCachedData('deviceAnalytics');
      const allVisitors =
        analyticsCacheManager.getCachedData('visitorLocations');

      // Process and update state
      const messagesBySession = allMessages.reduce(
        (acc: Record<string, ChatMessage[]>, message: any) => {
          if (!acc[message.sessionId]) {
            acc[message.sessionId] = [];
          }
          acc[message.sessionId].push(message);
          return acc;
        },
        {} as Record<string, ChatMessage[]>
      );

      const enhancedSessions = allSessions.map((session) => {
        const startTime =
          session.startTime instanceof Date
            ? session.startTime
            : new Date(session.startTime);
        const endTime =
          session.endTime instanceof Date
            ? session.endTime
            : new Date(session.endTime);
        const calculatedDuration = endTime.getTime() - startTime.getTime();
        return {
          ...session,
          startTime,
          endTime,
          messages: messagesBySession[session.sessionId] || [],
          messageCount:
            messagesBySession[session.sessionId]?.length ||
            session.messageCount ||
            0,
          totalDuration: calculatedDuration,
        };
      });

      // Update state with fresh data
      setChatSessions(enhancedSessions);
      setButtonClicks(allButtons);
      setTourInteractions(allTours);
      setDeviceAnalytics(allDevices);
      setVisitorLocations(allVisitors);
      setLastUpdated(new Date());

      console.log(`✅ Analytics data updated:`, {
        sessions: enhancedSessions.length,
        messages: allMessages.length,
        buttonClicks: allButtons.length,
        tourInteractions: allTours.length,
        deviceAnalytics: allDevices.length,
        visitorLocations: allVisitors.length,
        cacheStats: analyticsCacheManager.getCacheStats(),
      });
    } catch (error) {
      console.error('Error fetching incremental updates:', error);
    } finally {
      setLoading(false);
    }
  }, [db]);

  // Add cache management functions
  const clearCache = useCallback(() => {
    analyticsCacheManager.clearCache();
    console.log('🗑️ Analytics cache cleared');
  }, []);

  const getCacheStats = useCallback(() => {
    return analyticsCacheManager.getCacheStats();
  }, []);

  const forceRefresh = useCallback(() => {
    console.log(
      '🔄 Manual refresh triggered - performing smart incremental update'
    );
    fetchIncrementalDataOnly();
  }, [fetchIncrementalDataOnly]);

  const trackButtonClick = useCallback(
    async (data: Omit<ButtonClick, 'id' | 'timestamp'>) => {
      if (!db) return;

      try {
        await addDoc(collection(db, ANALYTICS_COLLECTIONS.BUTTON_CLICKS_V2), {
          ...data,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error tracking button click:', error);
      }
    },
    [db]
  );

  const trackTourInteraction = useCallback(
    async (data: Omit<TourInteraction, 'id' | 'timestamp'>) => {
      if (!db) return;

      try {
        await addDoc(
          collection(db, ANALYTICS_COLLECTIONS.TOUR_INTERACTIONS_V2),
          {
            ...data,
            timestamp: serverTimestamp(),
          }
        );
      } catch (error) {
        console.error('Error tracking tour interaction:', error);
      }
    },
    [db]
  );

  const trackVisitorLocation = useCallback(
    async (data: Omit<VisitorLocation, 'id' | 'timestamp'>) => {
      if (!db) return;

      try {
        await addDoc(
          collection(db, ANALYTICS_COLLECTIONS.VISITOR_LOCATIONS_V2),
          {
            ...data,
            timestamp: serverTimestamp(),
          }
        );
      } catch (error) {
        console.error('Error tracking visitor location:', error);
      }
    },
    [db]
  );

  const refreshData = useCallback(async () => {
    await fetchAllData();
  }, [fetchAllData]);

  // Initial data loading useEffect - this was missing!
  useEffect(() => {
    if (db) {
      console.log('🚀 AnalyticsProvider mounted - fetching initial data');
      fetchAllData();
    }
  }, [db, fetchAllData]);

  // Computed values
  const totalSessions = chatSessions.length;
  const totalButtonClicks = buttonClicks.length;
  const totalTourInteractions = tourInteractions.length;
  const uniqueVisitors = new Set(chatSessions.map((s) => s.sessionId)).size;

  // Export functions - Updated to use API for direct hosting
  const exportFullAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log('📊 Starting automated full analytics export...');

      // Retrieve stored password
      const password = sessionStorage.getItem('analytics_password');
      if (!password) {
        alert('Please authenticate in the dashboard first.');
        console.log('❌ No stored password');
        return;
      }

      // Call API to export directly to hosted file
      const response = await fetch('/api/analytics-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          exportType: 'full',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Export failed');
      }

      // Save export metadata to localStorage
      localStorage.setItem(
        'analytics_last_export',
        JSON.stringify({
          date: result.exportInfo.date,
          totalRecords: result.exportInfo.totalRecords,
          filename: result.exportInfo.filename,
          hostedUrl: result.exportInfo.hostedUrl,
        })
      );

      console.log('✅ Full export completed and stored privately');
      alert(
        `✅ Export completed!\n\n📊 ${result.exportInfo.totalRecords} records exported\n🔒 Data stored securely (private access only)\n🕒 File: ${result.exportInfo.filename}`
      );
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert(
        `❌ Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const exportIncrementalAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        '🔄 Starting smart incremental analytics update (no server export)...'
      );

      // Only fetch latest data incrementally and update local cache
      console.log('📊 Step 1: Fetching latest data before export...');
      await fetchIncrementalDataOnly();

      // Optionally, show a success message
      alert('✅ Local analytics cache updated incrementally from Firebase!');
    } catch (error) {
      console.error('❌ Incremental update failed:', error);
      alert(
        `❌ Incremental update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadFromHostedFile = useCallback(
    async (fileUrl?: string): Promise<boolean> => {
      try {
        setLoading(true);

        const password = sessionStorage.getItem('analytics_password');
        if (!password) {
          alert('Please authenticate in the dashboard first.');
          console.log('❌ No stored password');
          return false;
        }

        console.log(`📥 Loading analytics from protected API...`);

        // Call protected API with password
        const response = await fetch('/api/analytics-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert('❌ Incorrect password');
          } else if (response.status === 404) {
            alert('📝 No analytics data found. Please export data first.');
          } else {
            alert('❌ Failed to load analytics data');
          }
          return false;
        }

        const result = await response.json();
        const exportData = result.data;

        // Convert the export data back to the format our components expect
        const convertedSessions = exportData.data.sessions.map(
          (session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: new Date(session.endTime),
            timestamp: new Date(session.timestamp || session.startTime),
          })
        );

        const convertedMessages = exportData.data.messages.map(
          (message: any) => ({
            ...message,
            timestamp: new Date(message.timestamp),
          })
        );

        const convertedButtons = exportData.data.buttonClicks.map(
          (click: any) => ({
            ...click,
            timestamp: new Date(click.timestamp),
          })
        );

        const convertedTours = exportData.data.tourInteractions.map(
          (tour: any) => ({
            ...tour,
            timestamp: new Date(tour.timestamp),
          })
        );

        const convertedDevices = exportData.data.deviceAnalytics.map(
          (device: any) => ({
            ...device,
            timestamp: new Date(device.timestamp),
          })
        );

        const convertedVisitors = exportData.data.visitorLocations.map(
          (visitor: any) => ({
            ...visitor,
            timestamp: new Date(visitor.timestamp),
          })
        );

        // Process sessions with messages
        const messagesBySession = convertedMessages.reduce(
          (acc: Record<string, ChatMessage[]>, message: any) => {
            if (!acc[message.sessionId]) {
              acc[message.sessionId] = [];
            }
            acc[message.sessionId].push(message);
            return acc;
          },
          {} as Record<string, ChatMessage[]>
        );

        const enhancedSessions = convertedSessions.map((session: any) => {
          const calculatedDuration =
            session.endTime.getTime() - session.startTime.getTime();
          return {
            ...session,
            messages: messagesBySession[session.sessionId] || [],
            messageCount:
              messagesBySession[session.sessionId]?.length ||
              session.messageCount ||
              0,
            totalDuration: calculatedDuration,
          };
        });

        // Update state
        setChatSessions(enhancedSessions);
        setButtonClicks(convertedButtons);
        setTourInteractions(convertedTours);
        setDeviceAnalytics(convertedDevices);
        setVisitorLocations(convertedVisitors);
        setLastUpdated(new Date(exportData.metadata.lastUpdate));

        // Store password verification in sessionStorage for this session
        sessionStorage.setItem('analytics_password_verified', 'true');

        console.log(
          `✅ Loaded analytics from protected API: ${exportData.metadata.totalRecords} records`
        );
        console.log(`DEBUG: Loaded data counts:`, {
          sessions: enhancedSessions.length,
          buttonClicks: convertedButtons.length,
          tourInteractions: convertedTours.length,
          deviceAnalytics: convertedDevices.length,
          visitorLocations: convertedVisitors.length,
        });
        console.log(
          `DEBUG: Sample buttonClicks:`,
          convertedButtons.slice(0, 3)
        );
        console.log(
          `DEBUG: Sample tourInteractions:`,
          convertedTours.slice(0, 3)
        );
        alert('✅ Analytics loaded successfully!');
        return true;
      } catch (error) {
        console.error('❌ Failed to load analytics data:', error);
        alert('❌ Failed to load analytics data');
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getExportStats = useCallback(() => {
    const lastExportInfo = localStorage.getItem('analytics_last_export');
    if (!lastExportInfo) {
      return { hasExport: false };
    }

    const exportInfo = JSON.parse(lastExportInfo);
    return {
      hasExport: true,
      lastExportDate: exportInfo.date,
      totalRecords: exportInfo.totalRecords,
      filename: exportInfo.filename,
      daysSinceExport: Math.floor(
        (Date.now() - new Date(exportInfo.date).getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    };
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: AnalyticsContextType = useMemo(
    () => ({
      // Data
      chatSessions,
      buttonClicks,
      tourInteractions,
      deviceAnalytics,
      visitorLocations,

      // Loading states
      loading,
      lastUpdated,

      // Statistics
      totalSessions,
      totalButtonClicks,
      totalTourInteractions,
      uniqueVisitors,

      // Functions
      fetchAllData,
      trackButtonClick,
      trackTourInteraction,
      trackVisitorLocation,
      refreshData,

      // Cache management
      clearCache,
      getCacheStats,
      forceRefresh,
      fetchIncrementalDataOnly,

      // Export functions
      exportFullAnalytics,
      exportIncrementalAnalytics,
      loadFromHostedFile,
      getExportStats,
    }),
    [
      chatSessions,
      buttonClicks,
      tourInteractions,
      deviceAnalytics,
      visitorLocations,
      loading,
      lastUpdated,
      totalSessions,
      totalButtonClicks,
      totalTourInteractions,
      uniqueVisitors,
      fetchAllData,
      trackButtonClick,
      trackTourInteraction,
      trackVisitorLocation,
      refreshData,
      clearCache,
      getCacheStats,
      forceRefresh,
      fetchIncrementalDataOnly,
      exportFullAnalytics,
      exportIncrementalAnalytics,
      loadFromHostedFile,
      getExportStats,
    ]
  );

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}
