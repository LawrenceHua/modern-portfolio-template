// Analytics Cache Manager
// Reduces Firebase reads by caching data locally and fetching only new entries

interface CacheEntry {
  data: any[];
  lastUpdated: number;
  lastDocId?: string; // For incremental fetching
}

interface AnalyticsCache {
  sessions: CacheEntry;
  messages: CacheEntry;
  buttonClicks: CacheEntry;
  tourInteractions: CacheEntry;
  deviceAnalytics: CacheEntry;
  visitorLocations: CacheEntry;
  version: string;
}

const CACHE_VERSION = 'v2.1';
const CACHE_KEY = 'analytics_cache';
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB limit

class AnalyticsCacheManager {
  private cache: AnalyticsCache | null = null;

  constructor() {
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (typeof window === 'undefined') return;
      const cacheString = localStorage.getItem(CACHE_KEY);
      if (!cacheString) return;
      this.cache = JSON.parse(cacheString);
      console.log('📦 Analytics cache loaded from localStorage');
    } catch (error) {
      console.warn('Failed to load analytics cache:', error);
      this.cache = null;
    }
  }

  private saveCache(): void {
    try {
      if (!this.cache) return;

      const cacheString = JSON.stringify(this.cache);

      // Check size limit
      if (cacheString.length > MAX_CACHE_SIZE) {
        console.warn('📦 Cache too large, implementing cleanup...');
        this.cleanupCache();
        return;
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEY, cacheString);
      }
      console.log('📦 Analytics cache saved to localStorage');
    } catch (error: any) {
      console.warn('Failed to save analytics cache:', error);
      if (error.name === 'QuotaExceededError') {
        this.cleanupCache();
      }
    }
  }

  private cleanupCache(): void {
    if (!this.cache) return;

    console.log('🧹 Cleaning up analytics cache...');

    // Keep only recent data (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Clean each collection
    Object.keys(this.cache).forEach((key) => {
      if (key === 'version') return;

      const collection = this.cache![key as keyof AnalyticsCache] as CacheEntry;
      if (collection && collection.data) {
        collection.data = collection.data.filter((item: any) => {
          const timestamp =
            item.timestamp?.toDate?.() || new Date(item.timestamp);
          return timestamp.getTime() > thirtyDaysAgo;
        });
      }
    });

    this.saveCache();
  }

  private initializeCache(): void {
    this.cache = {
      sessions: { data: [], lastUpdated: 0 },
      messages: { data: [], lastUpdated: 0 },
      buttonClicks: { data: [], lastUpdated: 0 },
      tourInteractions: { data: [], lastUpdated: 0 },
      deviceAnalytics: { data: [], lastUpdated: 0 },
      visitorLocations: { data: [], lastUpdated: 0 },
      version: CACHE_VERSION,
    };
  }

  public getCachedData(
    collection: keyof Omit<AnalyticsCache, 'version'>
  ): any[] {
    if (!this.cache) {
      this.initializeCache();
    }

    const entry = this.cache![collection];

    // Return cached data if it exists
    if (entry && entry.data) {
      console.log(
        `📦 Using cached ${collection} data (${entry.data.length} items)`
      );
      return [...entry.data]; // Return copy to prevent mutation
    }

    return [];
  }

  public updateCache(
    collection: keyof Omit<AnalyticsCache, 'version'>,
    newData: any[],
    isIncremental: boolean = false
  ): void {
    if (!this.cache) {
      this.initializeCache();
    }

    const entry = this.cache![collection];

    if (isIncremental && entry.data.length > 0) {
      // Merge new data with existing, avoiding duplicates
      const existingIds = new Set(entry.data.map((item) => item.id));
      const uniqueNewData = newData.filter((item) => !existingIds.has(item.id));

      entry.data = [...entry.data, ...uniqueNewData];
      console.log(
        `📦 Incremental update: ${uniqueNewData.length} new ${collection} items`
      );
    } else {
      // Full replacement
      entry.data = [...newData];
      console.log(
        `📦 Full update: ${newData.length} ${collection} items cached`
      );
    }

    entry.lastUpdated = Date.now();

    // Update last doc ID for incremental fetching
    if (newData.length > 0) {
      const lastItem = newData[newData.length - 1];
      entry.lastDocId = lastItem.id;
    }

    this.saveCache();
  }

  public getLastDocId(
    collection: keyof Omit<AnalyticsCache, 'version'>
  ): string | undefined {
    if (!this.cache) return undefined;
    return this.cache[collection].lastDocId;
  }

  public isCacheValid(
    collection: keyof Omit<AnalyticsCache, 'version'>
  ): boolean {
    if (!this.cache) return false;

    const entry = this.cache[collection];

    // Cache is valid if it exists and has been updated at least once
    return entry && entry.lastUpdated > 0;
  }

  public clearCache(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_KEY);
    }
    this.cache = null;
    console.log('📦 Analytics cache cleared');
  }

  public getCacheStats(): any {
    if (!this.cache) return { status: 'empty' };

    const stats: any = { version: CACHE_VERSION };

    Object.keys(this.cache).forEach((key) => {
      if (key === 'version') return;

      const collection = this.cache![key as keyof AnalyticsCache] as CacheEntry;
      stats[key] = {
        count: collection.data?.length || 0,
        lastUpdated: new Date(collection.lastUpdated).toLocaleString(),
        isValid: this.isCacheValid(
          key as keyof Omit<AnalyticsCache, 'version'>
        ),
      };
    });

    return stats;
  }

  public forceCacheRefresh(
    collection?: keyof Omit<AnalyticsCache, 'version'>
  ): void {
    if (!this.cache) return;

    if (collection) {
      // Reset specific collection
      this.cache[collection].lastUpdated = 0;
      console.log(`📦 Forced refresh for ${collection}`);
    } else {
      // Reset all collections
      Object.keys(this.cache).forEach((key) => {
        if (key !== 'version') {
          (this.cache![key as keyof AnalyticsCache] as CacheEntry).lastUpdated =
            0;
        }
      });
      console.log('📦 Forced refresh for all collections');
    }
  }
}

// Singleton instance
export const analyticsCacheManager = new AnalyticsCacheManager();

// Helper function for Firebase incremental queries
