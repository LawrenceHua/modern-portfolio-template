'use client';

import { useState, useMemo } from 'react';
import {
  FiMessageCircle,
  FiUser,
  FiCpu,
  FiClock,
  FiSmartphone,
  FiMapPin,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiTarget,
} from 'react-icons/fi';
import { useAnalytics } from '../AnalyticsProvider';

interface ChatSessionsSectionProps {
  timeRange: '1d' | '7d' | '30d' | 'all';
}

export default function ChatSessionsSection({
  timeRange,
}: ChatSessionsSectionProps) {
  const analytics = useAnalytics();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<
    'all' | 'recruiter' | 'high-engagement' | 'unique-users'
  >('all');
  const [sortBy, setSortBy] = useState<
    'recent' | 'oldest' | 'duration' | 'messages'
  >('recent');
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set()
  );
  const [selectedUserIP, setSelectedUserIP] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'sessions' | 'users'>('sessions');

  // Filter by time range first
  const timeFilteredSessions = useMemo(() => {
    if (timeRange === 'all') return analytics.chatSessions;

    const now = new Date();
    let cutoffDate: Date;

    switch (timeRange) {
      case '1d':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return analytics.chatSessions;
    }

    console.log(
      `DEBUG: ChatSessions filtering for ${timeRange}, cutoff: ${cutoffDate.toISOString()}`
    );

    return analytics.chatSessions.filter((session) => {
      const sessionDate =
        session.startTime instanceof Date
          ? session.startTime
          : new Date(session.startTime);
      const isWithinRange = sessionDate >= cutoffDate;

      if (!isWithinRange) {
        console.log(
          `DEBUG: Filtering out session ${session.sessionId} with date ${sessionDate.toISOString()}`
        );
      }

      return isWithinRange;
    });
  }, [analytics.chatSessions, timeRange]);

  // Group sessions by unique users (IP addresses)
  const userGroups = useMemo(() => {
    const groups: Record<string, any[]> = {};

    timeFilteredSessions.forEach((session) => {
      const userKey =
        session.location.ip || `unknown-${session.sessionId.slice(0, 8)}`;
      if (!groups[userKey]) {
        groups[userKey] = [];
      }
      groups[userKey].push(session);
    });

    // Sort sessions within each group by recency
    Object.keys(groups).forEach((userKey) => {
      groups[userKey].sort(
        (a, b) => b.startTime.getTime() - a.startTime.getTime()
      );
    });

    return groups;
  }, [timeFilteredSessions]);

  // Get unique user statistics
  const uniqueUserStats = useMemo(() => {
    const users = Object.keys(userGroups);
    const totalSessions = timeFilteredSessions.length;
    const usersWithMultipleSessions = users.filter(
      (ip) => userGroups[ip].length > 1
    );

    return {
      totalUniqueUsers: users.length,
      totalSessions,
      averageSessionsPerUser:
        users.length > 0 ? (totalSessions / users.length).toFixed(1) : '0',
      returningUsers: usersWithMultipleSessions.length,
      returningUserRate:
        users.length > 0
          ? ((usersWithMultipleSessions.length / users.length) * 100).toFixed(1)
          : '0',
    };
  }, [userGroups, timeFilteredSessions]);

  // Process sessions or users based on view mode
  const processedData = useMemo(() => {
    if (viewMode === 'users') {
      // Return user data for user view
      let users = Object.entries(userGroups).map(([ip, sessions]) => ({
        ip,
        sessions,
        sessionCount: sessions.length,
        totalMessages: sessions.reduce((sum, s) => sum + s.messageCount, 0),
        lastActivity: sessions[0].startTime, // Already sorted by recency
        firstActivity: sessions[sessions.length - 1].startTime,
        avgEngagement:
          sessions.reduce((sum, s) => sum + s.engagementScore, 0) /
          sessions.length,
        locations: [
          ...new Set(
            sessions.map((s) => `${s.location.city}, ${s.location.country}`)
          ),
        ],
        devices: [...new Set(sessions.map((s) => s.deviceType))],
        isRecruiter: sessions.some((s) => s.isRecruiterSession),
      }));

      // Filter users if specific IP selected
      if (selectedUserIP) {
        users = users.filter((user) => user.ip === selectedUserIP);
      }

      // Apply search filter for users
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        users = users.filter(
          (user) =>
            user.ip.toLowerCase().includes(searchLower) ||
            user.locations.some((loc) =>
              loc.toLowerCase().includes(searchLower)
            ) ||
            user.sessions.some((session) =>
              session.messages.some((msg: any) =>
                msg.content.toLowerCase().includes(searchLower)
              )
            )
        );
      }

      // Sort users
      return users.sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return b.lastActivity.getTime() - a.lastActivity.getTime();
          case 'oldest':
            return a.firstActivity.getTime() - b.firstActivity.getTime();
          case 'messages':
            return b.totalMessages - a.totalMessages;
          case 'duration':
            return b.sessionCount - a.sessionCount;
          default:
            return b.lastActivity.getTime() - a.lastActivity.getTime();
        }
      });
    } else {
      // Session view logic
      let filtered = selectedUserIP
        ? timeFilteredSessions.filter(
            (session) => session.location.ip === selectedUserIP
          )
        : timeFilteredSessions;

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (session) =>
            session.sessionId.toLowerCase().includes(searchLower) ||
            session.location.city.toLowerCase().includes(searchLower) ||
            session.location.country.toLowerCase().includes(searchLower) ||
            (session.location.ip &&
              session.location.ip.toLowerCase().includes(searchLower)) ||
            session.tags.some((tag) =>
              tag.toLowerCase().includes(searchLower)
            ) ||
            session.messages.some((msg) =>
              msg.content.toLowerCase().includes(searchLower)
            )
        );
      }

      // Apply additional filters
      if (filterBy === 'recruiter') {
        filtered = filtered.filter((session) => session.isRecruiterSession);
      } else if (filterBy === 'high-engagement') {
        filtered = filtered.filter((session) => session.engagementScore >= 7);
      }

      // Sort sessions
      const sorted = [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'recent':
            return b.startTime.getTime() - a.startTime.getTime();
          case 'oldest':
            return a.startTime.getTime() - b.startTime.getTime();
          case 'duration':
            return b.totalDuration - a.totalDuration;
          case 'messages':
            return b.messageCount - a.messageCount;
          default:
            return b.startTime.getTime() - a.startTime.getTime();
        }
      });

      return sorted;
    }
  }, [
    timeFilteredSessions,
    userGroups,
    viewMode,
    selectedUserIP,
    searchTerm,
    filterBy,
    sortBy,
  ]);

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '< 1m';
    if (minutes < 60) return `${Math.round(minutes)}m`;
    return `${Math.round(minutes / 60)}h ${Math.round(minutes % 60)}m`;
  };

  const getEngagementColor = (score: number) => {
    if (score >= 8) return 'text-green-400';
    if (score >= 6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSessionPriorityColor = (session: any) => {
    // High-value sessions get special styling
    if (session.messageCount >= 10 || session.engagementScore >= 8)
      return 'border-green-500';
    if (session.messageCount >= 6 || session.engagementScore >= 6)
      return 'border-yellow-500';
    return 'border-gray-600';
  };

  const SessionCard = ({ session, index }: { session: any; index: number }) => {
    const uniqueId = `${session.sessionId}-${index}`;
    const isExpanded = selectedSession === uniqueId;
    const isHighValue =
      session.messageCount >= 8 || session.engagementScore >= 7;

    return (
      <div
        className={`bg-gray-700 rounded-lg border-2 ${getSessionPriorityColor(session)} overflow-hidden ${isHighValue ? 'ring-1 ring-blue-400/30' : ''}`}
      >
        {/* Session Header */}
        <div
          className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
          onClick={() => setSelectedSession(isExpanded ? null : uniqueId)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <FiMessageCircle className="h-5 w-5 text-blue-400" />
                <span className="font-medium text-base">
                  {session.messageCount} Message
                  {session.messageCount !== 1 ? 's' : ''} Session
                </span>
              </div>

              {session.isRecruiterSession && (
                <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full">
                  Recruiter
                </span>
              )}

              {session.engagementScore >= 8 && (
                <FiStar className="h-5 w-5 text-yellow-400" />
              )}

              {session.messageCount >= 10 && (
                <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
                  Extended Conversation
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-400">
                <div className="font-bold text-blue-400 text-lg">
                  {session.messageCount} messages
                </div>
                <div
                  className={`${getEngagementColor(session.engagementScore)} text-base`}
                >
                  {session.engagementScore.toFixed(1)} engagement
                </div>
              </div>

              {isExpanded ? (
                <FiChevronUp className="h-5 w-5" />
              ) : (
                <FiChevronDown className="h-5 w-5" />
              )}
            </div>
          </div>

          {/* Session Meta */}
          <div className="mt-3 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              {formatDuration(session.totalDuration / 60000)}
            </div>

            <div className="flex items-center gap-2">
              <FiSmartphone className="h-4 w-4" />
              {session.deviceType}
            </div>

            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4" />
              {session.location.city}, {session.location.country}
            </div>

            <div className="text-gray-500">
              {session.startTime.toLocaleDateString()}{' '}
              {session.startTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Expanded Session Details */}
        {isExpanded && (
          <div className="border-t border-gray-600 bg-gray-800">
            {/* Messages - Full width, no height constraint */}
            <div className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-3 text-lg">
                <FiMessageCircle className="h-5 w-5" />
                Full Conversation ({session.messageCount} messages)
                <span className="text-sm text-gray-400 ml-auto">
                  ↓ Chronological order (first → last)
                </span>
              </h4>

              <div className="space-y-4">
                {session.messages
                  ?.sort((a: any, b: any) => {
                    // Sort messages chronologically: first message at top, last message at bottom
                    let aTime: number;
                    let bTime: number;

                    // Handle Firestore Timestamp objects
                    if (a.timestamp?.toDate) {
                      aTime = a.timestamp.toDate().getTime();
                    } else if (a.timestamp instanceof Date) {
                      aTime = a.timestamp.getTime();
                    } else if (a.timestamp?.seconds) {
                      aTime = a.timestamp.seconds * 1000; // Convert Firestore timestamp
                    } else {
                      aTime = new Date(a.timestamp || 0).getTime();
                    }

                    if (b.timestamp?.toDate) {
                      bTime = b.timestamp.toDate().getTime();
                    } else if (b.timestamp instanceof Date) {
                      bTime = b.timestamp.getTime();
                    } else if (b.timestamp?.seconds) {
                      bTime = b.timestamp.seconds * 1000; // Convert Firestore timestamp
                    } else {
                      bTime = new Date(b.timestamp || 0).getTime();
                    }

                    return aTime - bTime; // Ascending order: conversation flows naturally
                  })
                  ?.map((message: any, msgIndex: number) => (
                    <div
                      key={msgIndex}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-600 text-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {message.role === 'user' ? (
                            <FiUser className="h-4 w-4" />
                          ) : (
                            <FiCpu className="h-4 w-4" />
                          )}
                          <span className="text-sm opacity-75 capitalize font-medium">
                            {message.role}
                          </span>
                          <span className="text-xs opacity-50 ml-auto">
                            {(() => {
                              if (message.timestamp?.toDate) {
                                return message.timestamp
                                  .toDate()
                                  .toLocaleTimeString();
                              } else if (message.timestamp instanceof Date) {
                                return message.timestamp.toLocaleTimeString();
                              } else if (message.timestamp?.seconds) {
                                return new Date(
                                  message.timestamp.seconds * 1000
                                ).toLocaleTimeString();
                              } else if (message.timestamp) {
                                return new Date(
                                  message.timestamp
                                ).toLocaleTimeString();
                              }
                              return 'No timestamp';
                            })()}
                          </span>
                        </div>

                        <div className="text-base leading-relaxed whitespace-pre-wrap">
                          {message.content || 'No content available'}
                        </div>
                      </div>
                    </div>
                  )) || (
                  <div className="text-center text-gray-400 py-8 text-base">
                    No message details available for this session
                  </div>
                )}
              </div>
            </div>

            {/* Session Analytics */}
            <div className="border-t border-gray-600 p-6 bg-gray-750">
              <h5 className="font-medium mb-4 text-lg">Session Analytics</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="font-bold text-blue-400 text-2xl">
                    {session.messageCount}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Messages</div>
                </div>

                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div
                    className={`font-bold text-2xl ${getEngagementColor(session.engagementScore)}`}
                  >
                    {session.engagementScore.toFixed(1)}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Engagement</div>
                </div>

                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="font-bold text-purple-400 text-2xl">
                    {formatDuration(session.totalDuration / 60000)}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Duration</div>
                </div>

                <div className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="font-bold text-green-400 text-2xl">
                    {session.deviceType}
                  </div>
                  <div className="text-gray-400 text-sm mt-1">Device</div>
                </div>
              </div>

              {/* Additional Session Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h6 className="font-medium text-blue-400 mb-2">
                    Session Details
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Session ID:</span>{' '}
                      {session.sessionId}
                    </div>
                    <div>
                      <span className="text-gray-400">Start Time:</span>{' '}
                      {session.startTime.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-400">User Agent:</span>{' '}
                      {session.userAgent || 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h6 className="font-medium text-green-400 mb-2">
                    Location & Context
                  </h6>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-400">Country:</span>{' '}
                      {session.location.country}
                    </div>
                    <div>
                      <span className="text-gray-400">Region:</span>{' '}
                      {session.location.region}
                    </div>
                    <div>
                      <span className="text-gray-400">IP:</span>{' '}
                      {session.location.ip || 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // UserCard component for displaying unique users
  const UserCard = ({ user, index }: { user: any; index: number }) => {
    const isExpanded = selectedUserIP === user.ip;

    return (
      <div className="bg-gray-700 rounded-lg border-2 border-purple-500 overflow-hidden">
        <div
          className="p-4 cursor-pointer hover:bg-gray-600 transition-colors"
          onClick={() => setSelectedUserIP(isExpanded ? null : user.ip)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <FiUser className="h-5 w-5 text-purple-400" />
                <span className="font-medium text-base">
                  User {user.ip} ({user.sessionCount} session
                  {user.sessionCount !== 1 ? 's' : ''})
                </span>
              </div>

              {user.isRecruiter && (
                <span className="px-3 py-1 bg-orange-500 text-white text-sm rounded-full">
                  Recruiter
                </span>
              )}

              {user.sessionCount > 1 && (
                <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
                  Returning User
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right text-sm text-gray-400">
                <div className="font-bold text-purple-400 text-lg">
                  {user.totalMessages} messages
                </div>
                <div className="text-green-400 text-base">
                  {user.avgEngagement.toFixed(1)} avg engagement
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              Last: {user.lastActivity.toLocaleDateString()}
            </div>

            <div className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4" />
              {user.locations.join('; ')}
            </div>

            <div className="flex items-center gap-2">
              <FiSmartphone className="h-4 w-4" />
              {user.devices.join(', ')}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-gray-600 bg-gray-800 p-4">
            <h4 className="font-medium mb-4 text-lg">
              All Sessions from User {user.ip}
            </h4>
            <div className="space-y-4">
              {user.sessions.map((session: any, idx: number) => (
                <SessionCard
                  key={`${session.sessionId}-${idx}`}
                  session={session}
                  index={idx}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {viewMode === 'users' ? 'Unique Users' : 'Chat Sessions'}
            {selectedUserIP && ` - User ${selectedUserIP}`}
          </h2>
          <p className="text-gray-400">
            {viewMode === 'users'
              ? 'Grouped by unique IP addresses'
              : 'All conversation sessions recorded'}
            {sortBy === 'recent' && ' • Showing newest first ↓'}
            {sortBy === 'oldest' && ' • Showing oldest first ↓'}
            {sortBy === 'duration' && ' • Sorted by duration ↓'}
            {sortBy === 'messages' && ' • Sorted by message count ↓'}
          </p>
        </div>

        <div className="text-sm text-gray-400">
          {viewMode === 'users' ? (
            <>
              {uniqueUserStats.totalUniqueUsers} unique users •{' '}
              {uniqueUserStats.totalSessions} total sessions
              <br />
              <span className="text-xs">
                {uniqueUserStats.averageSessionsPerUser} avg sessions/user •{' '}
                {uniqueUserStats.returningUserRate}% returning
              </span>
            </>
          ) : (
            <>
              Showing {processedData.length} of {analytics.chatSessions.length}{' '}
              total conversations
              <br />
              <span className="text-xs">All sessions displayed</span>
            </>
          )}
        </div>
      </div>

      {/* Unique User Stats */}
      {viewMode === 'users' && (
        <div className="bg-gray-700 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="font-bold text-purple-400 text-2xl">
                {uniqueUserStats.totalUniqueUsers}
              </div>
              <div className="text-gray-400 text-sm">Unique Users</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-400 text-2xl">
                {uniqueUserStats.returningUsers}
              </div>
              <div className="text-gray-400 text-sm">Returning Users</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-blue-400 text-2xl">
                {uniqueUserStats.averageSessionsPerUser}
              </div>
              <div className="text-gray-400 text-sm">Avg Sessions/User</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-yellow-400 text-2xl">
                {uniqueUserStats.returningUserRate}%
              </div>
              <div className="text-gray-400 text-sm">Returning Rate</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-gray-700 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('sessions')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'sessions'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setViewMode('users')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'users'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              Users
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={
                viewMode === 'users'
                  ? 'Search users/IPs...'
                  : 'Search messages...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Filter */}
          {viewMode === 'sessions' && (
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as any)}
              className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Sessions</option>
              <option value="recruiter">Recruiter Sessions Only</option>
              <option value="high-engagement">High Engagement Only</option>
            </select>
          )}

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="recent">Recent First (Newest → Oldest)</option>
            <option value="oldest">Oldest First (Oldest → Newest)</option>
            <option value="duration">
              {viewMode === 'users'
                ? 'Sort by Session Count'
                : 'Sort by Duration'}
            </option>
            <option value="messages">Sort by Message Count</option>
          </select>
        </div>

        {/* Clear User Filter */}
        {selectedUserIP && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-400">Filtered to user:</span>
            <span className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full">
              {selectedUserIP}
            </span>
            <button
              onClick={() => setSelectedUserIP(null)}
              className="px-3 py-1 bg-red-600 text-white text-sm rounded-full hover:bg-red-700"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {processedData.length > 0 ? (
          viewMode === 'users' ? (
            (processedData as any[]).map((user, index) => (
              <UserCard key={`${user.ip}-${index}`} user={user} index={index} />
            ))
          ) : (
            (processedData as any[]).map((session, index) => (
              <SessionCard
                key={`${session.sessionId}-${index}`}
                session={session}
                index={index}
              />
            ))
          )
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-700 rounded-xl p-8 max-w-md mx-auto">
              <FiMessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-4">
                {viewMode === 'users'
                  ? 'No Users Found'
                  : 'No Chat Sessions Found'}
              </h3>
              <p className="text-gray-400">
                {analytics.chatSessions.length === 0
                  ? 'No chat sessions recorded yet. Sessions will appear once users interact with your chatbot.'
                  : 'No sessions match your current filters. Try adjusting your search criteria or time range.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
