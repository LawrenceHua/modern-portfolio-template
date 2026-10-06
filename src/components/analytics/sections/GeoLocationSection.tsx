'use client';

import { useMemo } from 'react';
import {
  FiGlobe,
  FiMapPin,
  FiUsers,
  FiTrendingUp,
  FiMousePointer,
} from 'react-icons/fi';
import { useAnalytics } from '../AnalyticsProvider';

// Helper function to format time ago
function getTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return timestamp.toLocaleDateString();
}

interface GeoLocationSectionProps {
  timeRange: '1d' | '7d' | '30d' | 'all';
}

export default function GeoLocationSection({
  timeRange,
}: GeoLocationSectionProps) {
  const analytics = useAnalytics();

  const geoData = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    // Filter all data by time range
    const filteredSessions = analytics.chatSessions.filter(
      (s) => s.startTime >= startDate
    );
    const filteredClicks = analytics.buttonClicks.filter(
      (c) => c.timestamp >= startDate
    );
    const filteredVisitors = analytics.visitorLocations.filter(
      (v) => v.timestamp >= startDate
    );

    // Create recent visitors list for "Recently Visited From"
    const recentVisitors: Array<{
      location: string;
      country: string;
      city: string;
      timestamp: Date;
      type: 'session' | 'click' | 'visit';
      sessionId?: string;
      buttonType?: string;
      pathname?: string;
    }> = [];

    // Add visitor locations (page visits)
    filteredVisitors.forEach((visitor) => {
      recentVisitors.push({
        location: `${visitor.location.city}, ${visitor.location.country}`,
        country: visitor.location.country,
        city: visitor.location.city,
        timestamp: visitor.timestamp,
        type: 'visit',
        sessionId: visitor.sessionId,
        pathname: visitor.pathname,
      });
    });

    // Add sessions to recent visitors
    filteredSessions.forEach((session) => {
      recentVisitors.push({
        location: `${session.location.city}, ${session.location.country}`,
        country: session.location.country,
        city: session.location.city,
        timestamp: session.startTime,
        type: 'session',
        sessionId: session.sessionId,
      });
    });

    // Add clicks to recent visitors
    filteredClicks.forEach((click) => {
      recentVisitors.push({
        location: `${click.location.city}, ${click.location.country}`,
        country: click.location.country,
        city: click.location.city,
        timestamp: click.timestamp,
        type: 'click',
        buttonType: click.buttonType,
      });
    });

    // Sort by most recent first
    recentVisitors.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    // Aggregate location data
    const locationData: Record<
      string,
      {
        country: string;
        city: string;
        sessions: number;
        clicks: number;
        visits: number;
        totalActivity: number;
        lastActivity: Date;
      }
    > = {};

    // Process sessions
    filteredSessions.forEach((session) => {
      const key = `${session.location.city}, ${session.location.country}`;
      if (!locationData[key]) {
        locationData[key] = {
          country: session.location.country,
          city: session.location.city,
          sessions: 0,
          clicks: 0,
          visits: 0,
          totalActivity: 0,
          lastActivity: session.startTime,
        };
      }
      locationData[key].sessions++;
      locationData[key].totalActivity++;
      if (session.startTime > locationData[key].lastActivity) {
        locationData[key].lastActivity = session.startTime;
      }
    });

    // Process clicks
    filteredClicks.forEach((click) => {
      const key = `${click.location.city}, ${click.location.country}`;
      if (!locationData[key]) {
        locationData[key] = {
          country: click.location.country,
          city: click.location.city,
          sessions: 0,
          clicks: 0,
          visits: 0,
          totalActivity: 0,
          lastActivity: click.timestamp,
        };
      }
      locationData[key].clicks++;
      locationData[key].totalActivity++;
      if (click.timestamp > locationData[key].lastActivity) {
        locationData[key].lastActivity = click.timestamp;
      }
    });

    // Process visitor locations
    filteredVisitors.forEach((visitor) => {
      const key = `${visitor.location.city}, ${visitor.location.country}`;
      if (!locationData[key]) {
        locationData[key] = {
          country: visitor.location.country,
          city: visitor.location.city,
          sessions: 0,
          clicks: 0,
          visits: 0,
          totalActivity: 0,
          lastActivity: visitor.timestamp,
        };
      }
      locationData[key].visits++;
      locationData[key].totalActivity++;
      if (visitor.timestamp > locationData[key].lastActivity) {
        locationData[key].lastActivity = visitor.timestamp;
      }
    });

    const locations = Object.entries(locationData)
      .map(([key, data]) => ({ key, ...data }))
      .sort((a, b) => b.totalActivity - a.totalActivity);

    // Group locations by country for better organization
    const locationsByCountry = locations.reduce(
      (acc, location) => {
        if (!acc[location.country]) {
          acc[location.country] = [];
        }
        acc[location.country].push(location);
        return acc;
      },
      {} as Record<string, typeof locations>
    );

    return {
      locations,
      locationsByCountry,
      recentVisitors: recentVisitors.slice(0, 20), // Show last 20 visitors
      totalLocations: locations.length,
      totalSessions: filteredSessions.length,
      totalClicks: filteredClicks.length,
      totalVisits: filteredVisitors.length,
      totalCountries: Object.keys(locationsByCountry).length,
    };
  }, [
    analytics.chatSessions,
    analytics.buttonClicks,
    analytics.visitorLocations,
    timeRange,
  ]);

  return (
    <div className="h-full overflow-y-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Geographic Analytics</h2>
          <p className="text-gray-400 text-sm">
            {geoData.totalCountries} countries • {geoData.totalLocations} unique
            locations
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/80 text-sm font-medium">Countries</p>
              <p className="text-2xl font-bold text-white">
                {geoData.totalCountries}
              </p>
            </div>
            <FiGlobe className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/80 text-sm font-medium">Sessions</p>
              <p className="text-2xl font-bold text-white">
                {geoData.totalSessions}
              </p>
            </div>
            <FiUsers className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/80 text-sm font-medium">Clicks</p>
              <p className="text-2xl font-bold text-white">
                {geoData.totalClicks}
              </p>
            </div>
            <FiMousePointer className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-white/80 text-sm font-medium">Visits</p>
              <p className="text-2xl font-bold text-white">
                {geoData.totalVisits}
              </p>
            </div>
            <FiMapPin className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </div>

      {/* Empty State */}
      {geoData.totalLocations === 0 && (
        <div className="flex items-center justify-center h-48">
          <div className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700">
            <FiGlobe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">No Geographic Data</h3>
            <p className="text-gray-400 text-sm">
              Location analytics will appear here once users visit your site.
            </p>
          </div>
        </div>
      )}

      {/* All Locations - Grouped by Country */}
      {geoData.totalLocations > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiGlobe className="h-5 w-5 text-teal-400" />
            All Visitor Locations ({geoData.totalLocations})
          </h3>

          <div className="space-y-6">
            {Object.entries(geoData.locationsByCountry)
              .sort(([, a], [, b]) => {
                const aTotal = a.reduce(
                  (sum, loc) => sum + loc.totalActivity,
                  0
                );
                const bTotal = b.reduce(
                  (sum, loc) => sum + loc.totalActivity,
                  0
                );
                return bTotal - aTotal;
              })
              .map(([country, locations]) => {
                const countryTotal = locations.reduce(
                  (sum, loc) => sum + loc.totalActivity,
                  0
                );
                return (
                  <div
                    key={country}
                    className="border border-gray-600 rounded-lg p-3"
                  >
                    {/* Country Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-600">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="h-4 w-4 text-teal-400" />
                        <h4 className="font-semibold text-white">{country}</h4>
                        <span className="text-xs bg-teal-600 text-white px-2 py-1 rounded-full">
                          {locations.length}{' '}
                          {locations.length === 1 ? 'city' : 'cities'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-teal-400">
                          {countryTotal} total activity
                        </div>
                        <div className="text-xs text-gray-400">
                          {locations.reduce(
                            (sum, loc) => sum + loc.sessions,
                            0
                          )}{' '}
                          sessions •
                          {locations.reduce((sum, loc) => sum + loc.clicks, 0)}{' '}
                          clicks •
                          {locations.reduce((sum, loc) => sum + loc.visits, 0)}{' '}
                          visits
                        </div>
                      </div>
                    </div>

                    {/* Cities in Country */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                      {locations
                        .sort((a, b) => b.totalActivity - a.totalActivity)
                        .map((location, index) => (
                          <div
                            key={location.key}
                            className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="w-6 text-center font-bold text-teal-400 text-sm">
                                  #{index + 1}
                                </span>
                                <div>
                                  <div className="font-medium text-white">
                                    {location.city}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Last activity:{' '}
                                    {getTimeAgo(location.lastActivity)}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-white mb-1">
                                {location.totalActivity} total
                              </div>
                              <div className="text-xs text-gray-400 space-y-0.5">
                                {location.sessions > 0 && (
                                  <div className="text-blue-400">
                                    {location.sessions} sessions
                                  </div>
                                )}
                                {location.clicks > 0 && (
                                  <div className="text-green-400">
                                    {location.clicks} clicks
                                  </div>
                                )}
                                {location.visits > 0 && (
                                  <div className="text-purple-400">
                                    {location.visits} visits
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {geoData.recentVisitors.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp className="h-5 w-5 text-green-400" />
            Recent Activity (Last 20)
          </h3>
          <div className="space-y-2">
            {geoData.recentVisitors.map((visitor, index) => {
              const timeAgo = getTimeAgo(visitor.timestamp);
              return (
                <div
                  key={`${visitor.location}-${visitor.timestamp.getTime()}-${index}`}
                  className="flex justify-between items-center p-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        visitor.type === 'session'
                          ? 'bg-blue-400'
                          : visitor.type === 'click'
                            ? 'bg-green-400'
                            : 'bg-purple-400'
                      }`}
                    />
                    <FiMapPin className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="font-medium text-white">
                        {visitor.city}
                      </div>
                      <div className="text-sm text-gray-400">
                        {visitor.country}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-yellow-400">
                      {timeAgo}
                    </div>
                    <div className="text-sm text-gray-400">
                      {visitor.type === 'session'
                        ? 'Chat Session'
                        : visitor.type === 'click'
                          ? `${visitor.buttonType || 'Button Click'}`
                          : visitor.pathname || 'Page Visit'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
