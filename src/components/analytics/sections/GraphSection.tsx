'use client';

import { useState, useMemo } from 'react';
import {
  FiCalendar,
  FiBarChart,
  FiUsers,
  FiMousePointer,
  FiMessageCircle,
  FiGlobe,
  FiSmartphone,
  FiTarget,
  FiClock,
  FiActivity,
  FiEye,
  FiCheck,
  FiX,
} from 'react-icons/fi';
import { useAnalytics } from '../AnalyticsProvider';

interface GraphSectionProps {
  timeRange: '1d' | '7d' | '30d' | 'all';
}

export default function GraphSection({ timeRange }: GraphSectionProps) {
  const analytics = useAnalytics();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  // Filter all data by selected date
  const dayData = useMemo(() => {
    const selected = new Date(selectedDate);
    const startOfDay = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate()
    );
    const endOfDay = new Date(
      selected.getFullYear(),
      selected.getMonth(),
      selected.getDate() + 1
    );

    // Filter all data types by the selected date
    const daySessions = analytics.chatSessions.filter((session) => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startOfDay && sessionDate < endOfDay;
    });

    const dayButtonClicks = analytics.buttonClicks.filter((click) => {
      const clickDate = new Date(click.timestamp);
      return clickDate >= startOfDay && clickDate < endOfDay;
    });

    const dayTourInteractions = analytics.tourInteractions.filter((tour) => {
      const tourDate = new Date(tour.timestamp);
      return tourDate >= startOfDay && tourDate < endOfDay;
    });

    // Calculate comprehensive metrics
    const totalEvents =
      daySessions.length + dayButtonClicks.length + dayTourInteractions.length;
    const uniqueVisitors = new Set([
      ...daySessions.map((s) => s.sessionId),
      ...dayButtonClicks.map((c) => c.sessionId),
      ...dayTourInteractions.map((t) => t.sessionId),
    ]).size;

    // Chat session metrics
    const totalMessages = daySessions.reduce(
      (sum, session) => sum + session.messageCount,
      0
    );
    const avgSessionDuration =
      daySessions.length > 0
        ? daySessions.reduce((sum, session) => sum + session.totalDuration, 0) /
          daySessions.length /
          1000 // Convert to seconds
        : 0;

    // Button click breakdown
    const buttonBreakdown = dayButtonClicks.reduce(
      (acc, click) => {
        const key = click.buttonText || click.buttonType || 'Unknown';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Tour metrics
    const tourViews = dayTourInteractions.filter(
      (t) => t.action === 'viewed'
    ).length;
    const tourClicks = dayTourInteractions.filter(
      (t) => t.action === 'clicked'
    ).length;
    const tourCompleted = dayTourInteractions.filter(
      (t) => t.action === 'completed'
    ).length;
    const tourSkipped = dayTourInteractions.filter(
      (t) => t.action === 'skipped'
    ).length;

    // Hour-by-hour activity
    const hourlyActivity = Array.from({ length: 24 }, (_, hour) => {
      const hourStart = new Date(startOfDay.getTime() + hour * 60 * 60 * 1000);
      const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000);

      const hourSessions = daySessions.filter((s) => {
        const sDate = new Date(s.startTime);
        return sDate >= hourStart && sDate < hourEnd;
      }).length;

      const hourClicks = dayButtonClicks.filter((c) => {
        const cDate = new Date(c.timestamp);
        return cDate >= hourStart && cDate < hourEnd;
      }).length;

      const hourTours = dayTourInteractions.filter((t) => {
        const tDate = new Date(t.timestamp);
        return tDate >= hourStart && tDate < hourEnd;
      }).length;

      return {
        hour,
        sessions: hourSessions,
        clicks: hourClicks,
        tours: hourTours,
        total: hourSessions + hourClicks + hourTours,
      };
    });

    return {
      selectedDate: startOfDay,
      daySessions,
      dayButtonClicks,
      dayTourInteractions,
      totalEvents,
      uniqueVisitors,
      totalMessages,
      avgSessionDuration,
      buttonBreakdown,
      tourViews,
      tourClicks,
      tourCompleted,
      tourSkipped,
      hourlyActivity,
    };
  }, [analytics, selectedDate]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Daily Analytics Graph</h2>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-gray-400 text-sm hover:text-gray-300 transition-colors cursor-pointer"
          >
            {formatDate(selectedDate)} • {dayData.totalEvents} total events
          </button>
        </div>

        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <FiCalendar className="h-4 w-4" />
          Select Date
        </button>
      </div>

      {showCalendar && (
        <div className="bg-gray-800 border border-gray-600 rounded-xl p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Select Date</h3>
            <p className="text-gray-400 text-sm">
              Choose a date to view analytics for that day
            </p>
          </div>
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={(e) => {
              // Fix timezone issue by parsing the date components manually
              const dateStr = e.target.value;
              const [year, month, day] = dateStr.split('-').map(Number);
              setSelectedDate(new Date(year, month - 1, day));
              setShowCalendar(false);
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:border-blue-500 focus:outline-none"
            max={new Date().toISOString().split('T')[0]}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowCalendar(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">
                {dayData.totalEvents}
              </p>
            </div>
            <FiActivity className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Unique Visitors</p>
              <p className="text-2xl font-bold text-white">
                {dayData.uniqueVisitors}
              </p>
            </div>
            <FiUsers className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Chat Sessions</p>
              <p className="text-2xl font-bold text-white">
                {dayData.daySessions.length}
              </p>
              <p className="text-white/70 text-xs">
                {dayData.totalMessages} messages
              </p>
            </div>
            <FiMessageCircle className="h-6 w-6 text-white/80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">Button Clicks</p>
              <p className="text-2xl font-bold text-white">
                {dayData.dayButtonClicks.length}
              </p>
              <p className="text-white/70 text-xs">User interactions</p>
            </div>
            <FiMousePointer className="h-6 w-6 text-white/80" />
          </div>
        </div>
      </div>

      {/* Hourly Activity Chart */}
      {dayData.totalEvents > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiBarChart className="h-5 w-5 text-blue-400" />
            Hourly Activity Breakdown
          </h3>

          <div className="space-y-2">
            {dayData.hourlyActivity
              .filter((h) => h.total > 0)
              .map((hour) => (
                <div key={hour.hour} className="flex items-center gap-3">
                  <div className="text-sm font-medium w-12">
                    {hour.hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 bg-gray-700 rounded-full h-6 overflow-hidden">
                    <div className="flex h-full">
                      {hour.sessions > 0 && (
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            width: `${(hour.sessions / hour.total) * 100}%`,
                          }}
                          title={`${hour.sessions} sessions`}
                        >
                          {hour.sessions > 2 && hour.sessions}
                        </div>
                      )}
                      {hour.clicks > 0 && (
                        <div
                          className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            width: `${(hour.clicks / hour.total) * 100}%`,
                          }}
                          title={`${hour.clicks} clicks`}
                        >
                          {hour.clicks > 2 && hour.clicks}
                        </div>
                      )}
                      {hour.tours > 0 && (
                        <div
                          className="bg-orange-500 flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            width: `${(hour.tours / hour.total) * 100}%`,
                          }}
                          title={`${hour.tours} tours`}
                        >
                          {hour.tours > 2 && hour.tours}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm font-semibold w-8 text-right">
                    {hour.total}
                  </div>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Sessions ({dayData.daySessions.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Clicks ({dayData.dayButtonClicks.length})</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-orange-500 rounded"></div>
              <span>Tours ({dayData.dayTourInteractions.length})</span>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Details */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiMessageCircle className="h-5 w-5 text-green-400" />
            Chat Sessions
          </h3>

          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Total Messages</p>
              <p className="text-xl font-bold text-green-400">
                {dayData.totalMessages}
              </p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3">
              <p className="text-sm text-gray-400">Avg Duration</p>
              <p className="text-xl font-bold text-blue-400">
                {dayData.avgSessionDuration.toFixed(1)}s
              </p>
            </div>
            {dayData.daySessions.length > 0 && (
              <div className="text-xs text-gray-400">
                {dayData.daySessions.length} session
                {dayData.daySessions.length !== 1 ? 's' : ''} recorded
              </div>
            )}
          </div>
        </div>

        {/* Tour Analytics */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiTarget className="h-5 w-5 text-purple-400" />
            Tour Analytics
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <FiEye className="h-4 w-4 text-blue-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-blue-400">
                {dayData.tourViews}
              </p>
              <p className="text-xs text-gray-400">Views</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <FiMousePointer className="h-4 w-4 text-green-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-green-400">
                {dayData.tourClicks}
              </p>
              <p className="text-xs text-gray-400">Clicks</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <FiCheck className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-emerald-400">
                {dayData.tourCompleted}
              </p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-3 text-center">
              <FiX className="h-4 w-4 text-red-400 mx-auto mb-1" />
              <p className="text-lg font-bold text-red-400">
                {dayData.tourSkipped}
              </p>
              <p className="text-xs text-gray-400">Skipped</p>
            </div>
          </div>
        </div>

        {/* Button Breakdown */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiMousePointer className="h-5 w-5 text-orange-400" />
            Button Interactions
          </h3>

          {Object.keys(dayData.buttonBreakdown).length > 0 ? (
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {Object.entries(dayData.buttonBreakdown)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 8)
                .map(([button, count]) => (
                  <div
                    key={button}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm truncate flex-1 mr-2">
                      {button}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="bg-gray-700 rounded-full h-2 w-12">
                        <div
                          className="bg-orange-500 h-2 rounded-full"
                          style={{
                            width: `${(count / dayData.dayButtonClicks.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="font-bold text-orange-400 text-sm w-4 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <FiMousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No button clicks</p>
            </div>
          )}
        </div>
      </div>

      {/* Activity Timeline */}
      {dayData.totalEvents > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FiClock className="h-5 w-5 text-yellow-400" />
            Activity Timeline
          </h3>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[
              ...dayData.daySessions.map((s) => ({
                type: 'session',
                time: s.startTime,
                data: s,
              })),
              ...dayData.dayButtonClicks.map((c) => ({
                type: 'click',
                time: c.timestamp,
                data: c,
              })),
              ...dayData.dayTourInteractions.map((t) => ({
                type: 'tour',
                time: t.timestamp,
                data: t,
              })),
            ]
              .sort(
                (a, b) =>
                  new Date(b.time).getTime() - new Date(a.time).getTime()
              )
              .slice(0, 25)
              .map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-700 rounded-lg"
                >
                  <div className="text-xs font-mono text-gray-400 w-16">
                    {new Date(event.time).toLocaleTimeString('en-US', {
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>

                  {event.type === 'session' && (
                    <>
                      <FiMessageCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                      <span className="text-sm flex-1">
                        Chat session started •{' '}
                        {(event.data as any).messageCount} messages
                      </span>
                    </>
                  )}

                  {event.type === 'click' && (
                    <>
                      <FiMousePointer className="h-4 w-4 text-orange-400 flex-shrink-0" />
                      <span className="text-sm flex-1">
                        Clicked "{(event.data as any).buttonText}"
                      </span>
                    </>
                  )}

                  {event.type === 'tour' && (
                    <>
                      <FiTarget className="h-4 w-4 text-purple-400 flex-shrink-0" />
                      <span className="text-sm flex-1">
                        Tour {(event.data as any).action}:{' '}
                        {(event.data as any).tourStep}
                      </span>
                    </>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {dayData.totalEvents === 0 && (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <FiBarChart className="h-16 w-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">
            No Activity on {formatDate(selectedDate)}
          </h3>
          <p className="text-gray-400 mb-6">
            No analytics data was recorded for this date.
          </p>
        </div>
      )}
    </div>
  );
}
