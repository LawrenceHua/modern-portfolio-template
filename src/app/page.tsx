'use client';
import { trackButtonClick as recordButtonClick } from '@/lib/analytics';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBriefcase,
  FiTrendingUp,
  FiUsers,
  FiActivity,
  FiTarget,
  FiStar,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiCalendar,
  FiArrowDown,
  FiArrowUp,
  FiArrowLeft,
  FiArrowRight,
  FiUser,
  FiTool,
  FiBookOpen,
  FiPause,
  FiPlay,
} from 'react-icons/fi';
import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ModernNavigation } from '../components/layout/ModernNavigation';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import { SkillsSection } from '../components/sections/SkillsSection';
import { TimelineSection } from '../components/sections/TimelineSection';
import { ProjectsSection } from '../components/sections/ProjectsSection';
// import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { ContactSection } from '../components/sections/ContactSection';
import FloatingChatbot from '../components/chatbot/FloatingChatbot';
import VisitorTracker from '../components/analytics/VisitorTracker';
import { geolocationManager } from '../lib/geolocation';

// Firebase config (using environment variables)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

interface TourStep {
  id: string;
  title: string;
  content: string;
  targetSection: string;
  icon: React.ReactNode;
  color: string;
  duration: number;
  highlights?: string[];
  position:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'center'
    | 'bottom-center'
    | 'work-experience-top'
    | 'education-left'
    | 'bottom-right-lower'
    | 'education-below'
    | 'skills-title-left'
    | 'education-right-of-arrows'
    | 'work-experience-left-of-arrows'
    | 'project-next-to-arrows'
    | 'project-next-to-arrows-2';
}

const tourSteps: TourStep[] = [
  {
    id: 'intro',
    title: `👋 Welcome! I'm ${siteConfig.name}.`,
    content: siteConfig.tour.intro,
    targetSection: 'hero',
    icon: <FiUser className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 8000,
    position: 'center',
  },
  {
    id: 'skills',
    title: '🛠️ My Core Skills',
    content: siteConfig.tour.skills,
    targetSection: 'skills',
    icon: <FiTool className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 10000,
    highlights: [
      'Product Management',
      'User Research',
      'Cross-functional Leadership',
    ],
    position: 'center',
  },
  {
    id: 'education',
    title: '🎓 Educational Background',
    content: siteConfig.tour.education,
    targetSection: 'timeline',
    icon: <FiBookOpen className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 10000,
    highlights: ['Business Degree', 'Technical Background'],
    position: 'center',
  },
  {
    id: 'experience',
    title: '💼 Professional Journey',
    content: siteConfig.tour.experience,
    targetSection: 'timeline',
    icon: <FiBriefcase className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 12000,
    highlights: ['Product Manager', 'Product Strategy', 'User Experience'],
    position: 'center',
  },
  {
    id: 'project-1',
    title: siteConfig.projectsData.all[0].title,
    content: siteConfig.tour.project,
    targetSection: 'projects',
    icon: <FiTarget className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 10000,
    highlights: ['Product Launch', 'User Engagement', 'Business Impact'],
    position: 'center',
  },
  {
    id: 'project-2',
    title: siteConfig.projectsData.all[1].title,
    content: siteConfig.tour.project,
    targetSection: 'projects',
    icon: <FiTrendingUp className="w-5 h-5" />,
    color: 'from-gray-600 to-gray-700',
    duration: 10000,
    highlights: ['Feature Development', 'User Satisfaction', 'Retention'],
    position: 'center',
  },
];

// Tour Arrows Component
const TourArrows = ({
  isActive,
  currentStep,
  isPaused,
}: {
  isActive: boolean;
  currentStep: number;
  isPaused: boolean;
}) => {
  if (!isActive) return null;

  // Define which timeline experiences each step points to
  const stepTargets = {
    0: [], // Step 1: Intro - no arrows
    1: [
      'skill-product-strategy',
      'skill-data-analysis',
      'skill-stakeholder-management',
    ], // Step 2: Skills - pointing to the 3 specific skill titles
    2: ['timeline', 'timeline'], // Step 3: Education - pointing to degree titles
    3: ['work-experience-title'], // Step 4: Work Experience - single arrow at title
    4: ['project-featured-0'], // Step 5: Sample Project Project - pointing to project card
    5: ['project-featured-1'], // Step 6: Example Company Project
  };

  const targets = stepTargets[currentStep as keyof typeof stepTargets] || [];

  return (
    <AnimatePresence>
      {targets.map((target, index) => (
        <motion.div
          key={`${currentStep}-${target}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ delay: index * 0.2, duration: 0.4 }}
          className={`${isPaused ? 'absolute' : 'fixed'} z-50 pointer-events-none will-change-transform`}
          style={{
            ...getArrowPosition(target, currentStep, isPaused),
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="relative">
            {/* Simplified Animated Arrow - Reduced animation for better performance */}
            <motion.div
              animate={{
                y: [0, -4, 0], // Reduced animation distance
              }}
              transition={{
                duration: 2, // Slower animation for better performance
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`flex items-center justify-center w-8 h-8 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white shadow-lg md:shadow-2xl border-2 md:border-4 border-white`}
            >
              <FiArrowDown className="w-4 h-4 md:w-8 md:h-8" />
            </motion.div>

            {/* Simplified Arrow tail/line */}
            <div
              className={`absolute top-6 md:top-12 left-1/2 transform -translate-x-1/2 w-0.5 md:w-1 bg-gradient-to-b ${tourSteps[currentStep].color} rounded-full`}
              style={{ height: window.innerWidth < 768 ? '30px' : '60px' }}
            />

            {/* Simplified pulse effect with reduced animation */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1], // Reduced scale range
                opacity: [0.4, 0, 0.4], // Reduced opacity range
              }}
              transition={{
                duration: 2.5, // Slower for better performance
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`absolute inset-0 w-8 h-8 md:w-16 md:h-16 rounded-full bg-gradient-to-r ${tourSteps[currentStep].color}`}
            />
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
};

// Radar Arrow Component - shows direction to tour content when user scrolls away
const RadarArrow = ({
  isActive,
  currentStep,
  onScrollToSection,
}: {
  isActive: boolean;
  currentStep: number;
  onScrollToSection: (sectionId: string, stepIndex?: number) => void;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      return;
    }

    // Radar should work even when paused - especially when paused and scrolled away

    // Debounced scroll position check for better performance
    let timeoutId: NodeJS.Timeout;
    const checkScrollPosition = () => {
      const currentStepData = tourSteps[currentStep];
      const targetElement = document.getElementById(
        currentStepData.targetSection
      );

      if (!targetElement) return;

      const rect = targetElement.getBoundingClientRect();
      const elementTop = rect.top;
      const elementBottom = rect.bottom;
      const viewportHeight = window.innerHeight;

      // Calculate if the target element is visible in viewport
      const isElementVisible = elementTop < viewportHeight && elementBottom > 0;

      // Calculate distance and direction
      let scrollDirection: 'up' | 'down' = 'down';
      let scrollDistance = 0;

      if (elementTop > viewportHeight) {
        // Element is below viewport
        scrollDirection = 'down';
        scrollDistance = elementTop - viewportHeight;
      } else if (elementBottom < 0) {
        // Element is above viewport
        scrollDirection = 'up';
        scrollDistance = Math.abs(elementBottom);
      }

      // Show radar if element is not visible and user has scrolled away significantly
      const threshold = 300; // Increased threshold to reduce flickering
      const shouldShow = !isElementVisible && scrollDistance > threshold;

      setIsVisible(shouldShow);
      setDirection(scrollDirection);
      setDistance(scrollDistance);
    };

    // Debounced scroll handler for better performance
    const debouncedScrollCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScrollPosition, 100); // 100ms debounce
    };

    // Check on scroll and resize with debouncing
    checkScrollPosition();
    window.addEventListener('scroll', debouncedScrollCheck, { passive: true });
    window.addEventListener('resize', debouncedScrollCheck, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', debouncedScrollCheck);
      window.removeEventListener('resize', debouncedScrollCheck);
    };
  }, [isActive, currentStep]);

  const scrollToTarget = () => {
    const currentStepData = tourSteps[currentStep];
    onScrollToSection(currentStepData.targetSection, currentStep);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      className="fixed top-1/2 right-6 -translate-y-1/2 z-40 cursor-pointer"
      onClick={scrollToTarget}
    >
      <div className="relative">
        {/* Simplified Radar Background - reduced animation complexity */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{
            duration: 4, // Slower rotation for better performance
            repeat: Infinity,
            ease: 'linear',
          }}
          className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-dashed border-purple-400 dark:border-purple-300"
        />

        {/* Simplified Inner Ring */}
        <div className="absolute inset-2 md:inset-3 rounded-full border border-purple-400 dark:border-purple-300 opacity-60" />

        {/* Central Arrow - simplified animation */}
        <div
          className={`absolute inset-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-gradient-to-r ${tourSteps[currentStep].color} rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          <motion.div
            animate={{
              y: direction === 'up' ? [-1, -3, -1] : [1, 3, 1],
            }}
            transition={{
              duration: 2, // Slower animation
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {direction === 'up' ? (
              <FiArrowUp className="w-6 h-6 md:w-8 md:h-8 text-white" />
            ) : (
              <FiArrowDown className="w-6 h-6 md:w-8 md:h-8 text-white" />
            )}
          </motion.div>
        </div>

        {/* Simplified Distance Indicator */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap">
          {direction === 'up' ? '↑' : '↓'} {Math.round(distance / 100)}00px
        </div>
      </div>

      {/* Simplified Help Text */}
      <div className="absolute -left-32 top-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm px-3 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-90">
        <div className="font-semibold">
          Tour content {direction === 'up' ? 'above' : 'below'}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          Click to navigate
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get arrow positions for different timeline elements
const getArrowPosition = (
  targetId: string,
  currentStep: number,
  isPaused: boolean = false
) => {
  if (typeof window === 'undefined') {
    return { top: '50%', left: '50%', right: 'auto' };
  }

  const targetElement = document.getElementById(targetId);

  if (targetElement) {
    const rect = targetElement.getBoundingClientRect();
    const isMobile = window.innerWidth < 768;

    // Mobile: smaller arrows (32px), less spacing
    // Desktop: larger arrows (64px), more spacing
    const arrowSize = isMobile ? 16 : 32; // Half of actual arrow size for centering
    const topOffset = isMobile ? 40 : 70; // Less spacing above target on mobile

    if (isPaused) {
      // When paused, use absolute positioning relative to page (sticks to target element)
      const absoluteTop = rect.top + window.pageYOffset - topOffset;
      const absoluteLeft =
        rect.left + window.pageXOffset + rect.width / 2 - arrowSize;

      return {
        top: `${absoluteTop}px`,
        left: `${absoluteLeft}px`,
        right: 'auto',
      };
    } else {
      // When active, use fixed positioning relative to viewport
      const top = rect.top - topOffset;
      const left = rect.left + rect.width / 2 - arrowSize;

      return { top: `${top}px`, left: `${left}px`, right: 'auto' };
    }
  }

  // Fallback if element not found (e.g., during transitions)
  return { top: '-500px', left: '-500px', right: 'auto' };
};

export default function ModernHome() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [contactFormType, setContactFormType] = useState<
    'none' | 'message' | 'calendar'
  >('message');

  // Tour state
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [showFinalCTA, setShowFinalCTA] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Tour invitation popup state
  const [showTourInvitation, setShowTourInvitation] = useState(false);
  const [tourInvitationDismissed, setTourInvitationDismissed] = useState(false);

  // Cat easter egg state
  const [showCats, setShowCats] = useState(false);

  // Firebase state
  const [db, setDb] = useState<any>(null);

  // Mobile debug logging function
  const debugLog = (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') console.debug(message, data);
  };

  // Component mount debugging
  useEffect(() => {
    console.log('🏠 ModernHome component mounted');
    return () => {
      console.log('🏠 ModernHome component unmounting');
    };
  }, []);

  // Initialize Firebase and start tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let app;
      if (!getApps().length) {
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) return;
        app = initializeApp(firebaseConfig);
        console.log('🔥 Firebase app initialized');
      } else {
        app = getApps()[0];
        console.log('🔥 Using existing Firebase app');
      }
      const firestore = getFirestore(app);
      setDb(firestore);
      console.log('🔥 Firestore database ready');

      // Start page view tracking
      trackPageView(firestore);
      // Start device analytics tracking
      trackDeviceInfo(firestore);
    }
  }, []);

  // Tour tracking functions
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  // Track important button clicks for analytics
  const trackButtonClick = recordButtonClick;

  // Device analytics tracking function
  const trackDeviceInfo = async (firestore: any) => {
    if (!firestore) {
      console.warn('❌ Firestore not initialized, cannot track device info');
      return;
    }

    try {
      console.log('📱 Tracking device analytics...');

      // Get geolocation data using centralized manager
      let geoData = null;
      try {
        geoData = await geolocationManager.getGeolocation();
        console.log('🌍 Geolocation data obtained for device analytics');
      } catch (geoError) {
        console.log(
          '🌍 Geolocation fetch failed for device analytics, using defaults:',
          geoError
        );
      }

      // Helper function to determine device type
      const determineDeviceType = (userAgent: string) => {
        const ua = userAgent.toLowerCase();
        if (
          ua.includes('mobile') ||
          ua.includes('android') ||
          ua.includes('iphone')
        ) {
          return 'mobile';
        } else if (ua.includes('tablet') || ua.includes('ipad')) {
          return 'tablet';
        } else {
          return 'desktop';
        }
      };

      // Helper function to extract browser info
      const extractBrowserInfo = (userAgent: string) => {
        const ua = userAgent.toLowerCase();
        if (
          ua.includes('chrome') &&
          !ua.includes('edg') &&
          !ua.includes('opr')
        ) {
          return 'Chrome';
        } else if (ua.includes('firefox')) {
          return 'Firefox';
        } else if (ua.includes('safari') && !ua.includes('chrome')) {
          return 'Safari';
        } else if (ua.includes('edg')) {
          return 'Edge';
        } else if (ua.includes('opr')) {
          return 'Opera';
        } else {
          return 'Unknown';
        }
      };

      // Helper function to extract OS info
      const extractOSInfo = (userAgent: string) => {
        const ua = userAgent.toLowerCase();
        if (ua.includes('windows')) {
          return 'Windows';
        } else if (ua.includes('mac')) {
          return 'macOS';
        } else if (ua.includes('linux')) {
          return 'Linux';
        } else if (ua.includes('android')) {
          return 'Android';
        } else if (
          ua.includes('ios') ||
          ua.includes('iphone') ||
          ua.includes('ipad')
        ) {
          return 'iOS';
        } else {
          return 'Unknown';
        }
      };

      const deviceInfo = {
        sessionId: getSessionId(),
        deviceType: determineDeviceType(navigator.userAgent),
        browser: extractBrowserInfo(navigator.userAgent),
        os: extractOSInfo(navigator.userAgent),
        screenSize: `${window.screen.width}x${window.screen.height}`,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
        country: geoData?.country_name || 'Unknown',
        region: geoData?.region || 'Unknown',
        city: geoData?.city || 'Unknown',
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        timezone: geoData?.timezone || 'Unknown',
        ip: geoData?.ip || 'Unknown',
      };

      const deviceDocRef = await addDoc(
        collection(firestore, 'analytics_device_info_v2'),
        deviceInfo
      );

      console.log('✅ Device analytics tracked successfully', {
        docId: deviceDocRef.id,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        screenSize: deviceInfo.screenSize,
      });
    } catch (error) {
      console.error('❌ Error tracking device analytics:', error);
    }
  };

  const trackTourEvent = async (
    eventType:
      | 'viewed'
      | 'clicked'
      | 'completed'
      | 'skipped'
      | 'tour_cta_action',
    stepId?: string,
    stepIndex?: number,
    ctaAction?: 'message' | 'meeting' | 'restart'
  ) => {
    console.log(
      `📊 trackTourEvent called with: ${eventType}, stepId: ${stepId}, stepIndex: ${stepIndex}`
    );

    if (!db) {
      console.warn('❌ Firebase not initialized, cannot track tour event');
      return;
    }

    try {
      console.log('📊 Creating tour event object...');
      // Create base tour event matching v2 collection structure
      const tourEvent: any = {
        tourStep: stepId || 'unknown',
        action: eventType,
        sessionId: getSessionId(),
        timeOnStep: (stepIndex || 0) * 1000, // Convert to milliseconds
        timestamp: serverTimestamp(),
        location: {
          country: 'Unknown',
          region: 'Unknown',
          city: 'Unknown',
        },
        metadata: {
          stepIndex: stepIndex || 0,
          ctaAction: ctaAction || null,
          userAgent: navigator.userAgent,
          referrer: document.referrer || 'direct',
        },
      };

      console.log('📊 Base tour event created:', {
        ...tourEvent,
        timestamp: 'serverTimestamp()',
      });

      // Try to add geolocation using centralized manager
      try {
        const geoData = await geolocationManager.getGeolocation();
        tourEvent.location.country = geoData.country_name || 'Unknown';
        tourEvent.location.region = geoData.region || 'Unknown';
        tourEvent.location.city = geoData.city || 'Unknown';
        console.log('🌍 Geolocation added to tour event:', {
          country: tourEvent.location.country,
          region: tourEvent.location.region,
          city: tourEvent.location.city,
        });
      } catch (geoError) {
        console.log('🌍 Geolocation fetch failed, using defaults:', geoError);
      }

      console.log('📊 Saving to Firebase...');
      const docRef = await addDoc(
        collection(db, 'analytics_tour_interactions_v2'),
        tourEvent
      );
      console.log(`✅ Tour event tracked successfully: ${eventType}`, {
        docId: docRef.id,
        eventData: { ...tourEvent, timestamp: 'serverTimestamp()' },
      });
    } catch (error) {
      console.error('❌ Error tracking tour event:', error);
    }
  };

  // Page view tracking function with time tracking
  const trackPageView = async (firestore: any) => {
    if (!firestore) {
      console.warn('❌ Firestore not initialized, cannot track page view');
      return;
    }

    const startTime = Date.now();
    let pageViewDocRef: any = null;

    try {
      console.log('📊 Tracking page view...');

      // Get geolocation data using centralized manager
      let geoData = null;
      try {
        geoData = await geolocationManager.getGeolocation();
        console.log('🌍 Geolocation data obtained for page view');
      } catch (geoError) {
        console.log('🌍 Geolocation fetch failed, using defaults:', geoError);
      }

      const pageView = {
        page: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer || 'direct',
        screenSize: `${window.screen.width}x${window.screen.height}`,
        timeOnPage: 0,
        sessionId: getSessionId(),
        timestamp: serverTimestamp(),
        country: geoData?.country_name || 'Unknown',
        region: geoData?.region || 'Unknown',
        city: geoData?.city || 'Unknown',
        latitude: geoData?.latitude || null,
        longitude: geoData?.longitude || null,
        timezone: geoData?.timezone || 'Unknown',
        ip: geoData?.ip || 'Unknown',
      };

      pageViewDocRef = await addDoc(
        collection(firestore, 'page_views'),
        pageView
      );
      console.log('✅ Page view tracked successfully', {
        docId: pageViewDocRef.id,
        userAgent: navigator.userAgent,
        isMobile: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent),
      });

      // Track time spent on page
      const updateTimeOnPage = async () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000); // seconds
        if (timeSpent > 5 && pageViewDocRef) {
          // Only update if spent more than 5 seconds
          try {
            const { updateDoc } = await import('firebase/firestore');
            await updateDoc(pageViewDocRef, { timeOnPage: timeSpent });
            console.log(`⏱️ Updated time on page: ${timeSpent}s`);
          } catch (error) {
            console.error('❌ Error updating time on page:', error);
          }
        }
      };

      // Update time when user leaves page
      const handleBeforeUnload = () => {
        updateTimeOnPage();
      };

      // Update time when page becomes hidden (mobile app switching, etc.)
      const handleVisibilityChange = () => {
        if (document.hidden) {
          updateTimeOnPage();
        }
      };

      // Update time periodically (every 30 seconds) for long sessions
      const timeUpdateInterval = setInterval(updateTimeOnPage, 30000);

      // Add event listeners
      window.addEventListener('beforeunload', handleBeforeUnload);
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function (though this won't run on page unload)
      setTimeout(
        () => {
          clearInterval(timeUpdateInterval);
        },
        30 * 60 * 1000
      ); // Stop after 30 minutes max
    } catch (error) {
      console.error('❌ Error tracking page view:', error);
    }
  };

  // Letter-by-letter highlighting function
  const renderHighlightedText = (text: string, highlightIndex: number) => {
    const characters = text.split('');

    return (
      <span className="text-gray-600 dark:text-gray-300 leading-relaxed">
        {characters.map((char, index) => (
          <span
            key={index}
            className={`transition-colors duration-200 ease-out ${
              highlightIndex === -2
                ? 'text-gray-600 dark:text-gray-300' // Show full text without highlighting
                : highlightIndex === -1
                  ? 'text-gray-600 dark:text-gray-300' // All highlights cleared
                  : index <= highlightIndex
                    ? 'text-white dark:text-white drop-shadow-[0_0_8px_rgba(59,130,246,0.6)] dark:drop-shadow-[0_0_12px_rgba(96,165,250,0.8)]'
                    : 'text-gray-400 dark:text-gray-500 opacity-60'
            }`}
          >
            {char}
          </span>
        ))}
      </span>
    );
  };

  const handleSendMessage = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger message flow
    setTimeout(() => {
      // This will trigger the /message command in the chatbot
      const event = new CustomEvent('triggerChatbotCommand', {
        detail: { command: 'message' },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const handleScheduleMeeting = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger meeting flow
    setTimeout(() => {
      // This will trigger the /meeting command in the chatbot
      const event = new CustomEvent('triggerChatbotCommand', {
        detail: { command: 'meeting' },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const handleContactFormToggle = (formType: 'message' | 'calendar') => {
    setContactFormType(formType);
  };

  const handleCatsToggle = (show: boolean) => {
    setShowCats(show);
  };

  // Tour functions
  const startTour = () => {
    console.log('🚀 Starting tour...');
    console.log('🔥 Firebase DB status:', db ? 'Ready' : 'Not initialized');

    setIsActive(true);
    setCurrentStep(0);
    setShowFinalCTA(false);
    setHighlightedIndex(0);
    setCountdown(0);
    setCurrentCharacterIndex(-2); // Show full text initially
    setIsPaused(false);

    // Turn on cats when tour starts! 🐱
    setShowCats(true);

    // Track tour start
    console.log('📊 About to track tour start event...');
    trackTourEvent('viewed', tourSteps[0].id, 0);

    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Start with first step after a delay
    setTimeout(() => {
      scrollToSection(tourSteps[0].targetSection, 0);
    }, 1000);
  };

  const scrollToSection = (sectionId: string, stepIndex?: number) => {
    const actualStep = stepIndex !== undefined ? stepIndex : currentStep;
    debugLog(`🔧 scrollToSection called`, {
      sectionId,
      currentStep: actualStep + 1,
      stepIndex,
      isMobile: window.innerWidth < 768,
    });

    const element = document.getElementById(sectionId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;

      // For mobile, center the content in the viewport for better visibility
      if (isMobile) {
        debugLog(
          `🎯 Mobile detected (width: ${window.innerWidth}), Step: ${actualStep + 1}, Section: ${sectionId}`
        );
        const viewportHeight = window.innerHeight;
        const elementHeight = elementRect.height;

        // Calculate position to center the element in viewport
        const centerOffset = (viewportHeight - elementHeight) / 2;
        const finalScrollPosition =
          absoluteElementTop - Math.max(centerOffset, 100);

        // Debug step 4 condition before special handling
        if (sectionId === 'timeline' && actualStep === 3) {
          debugLog('🔍 Checking Step 4 condition', {
            sectionId,
            currentStep: actualStep,
            condition: 'timeline && currentStep === 3',
            match: true,
          });
        } else if (sectionId === 'timeline') {
          debugLog('❌ Timeline but wrong step', {
            sectionId,
            currentStep: actualStep,
            expectedStep: 3,
          });
        }

        // Special handling for specific sections on mobile
        if (sectionId === 'skills' && actualStep === 1) {
          // Step 2: Skills - scroll to TOP of skills section for proper framing
          debugLog('🛠️ Step 2: Scrolling to top of skills section');
          const skillsSection = document.getElementById('skills');
          if (skillsSection) {
            const skillsRect = skillsSection.getBoundingClientRect();
            const skillsAbsoluteTop = skillsRect.top + window.pageYOffset;
            // Position at the top of skills section with minimal offset
            const finalPosition = skillsAbsoluteTop - 100;
            debugLog('🛠️ Step 2: Skills section top positioning', {
              finalPosition,
              skillsAbsoluteTop,
              offset: -100,
            });
            window.scrollTo({ top: finalPosition, behavior: 'smooth' });
            return;
          }
          // Fallback positioning - minimal offset
          const finalPosition = absoluteElementTop - 50;
          debugLog('🛠️ Step 2: Skills fallback positioning', { finalPosition });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        } else if (sectionId === 'timeline' && actualStep === 2) {
          // Step 3: Education step - focus on education section
          debugLog('🎓 Step 3: Scrolling to education section');

          // Try multiple selectors to find education items
          let educationItems = document.querySelectorAll(
            '[id^="timeline-university"], [id^="timeline-carnegie"], [id^="timeline-spanish"]'
          );

          // If first selector doesn't work, try broader selectors
          if (educationItems.length === 0) {
            educationItems = document.querySelectorAll(
              '[id*="university"], [id*="carnegie"]'
            );
          }

          debugLog('🎓 Step 3: Education items found', {
            count: educationItems.length,
            firstSelector:
              '[id^="timeline-university"], [id^="timeline-carnegie"], [id^="timeline-spanish"]',
          });

          if (educationItems.length > 0) {
            const firstEducationItem = educationItems[0];
            const firstItemRect = firstEducationItem.getBoundingClientRect();
            const firstItemAbsoluteTop = firstItemRect.top + window.pageYOffset;
            // Position to show the education section with reduced offset
            const finalPosition = firstItemAbsoluteTop - 150;
            debugLog('🎓 Step 3: Education positioning successful', {
              finalPosition,
              firstItemAbsoluteTop,
              offset: -150,
            });
            window.scrollTo({ top: finalPosition, behavior: 'smooth' });
            return;
          }

          // Enhanced fallback - look for education section specifically
          debugLog(
            '🎓 Step 3: Education items not found, trying timeline section'
          );
          const timelineSection = document.getElementById('timeline');
          if (timelineSection) {
            const timelineRect = timelineSection.getBoundingClientRect();
            const timelineAbsoluteTop = timelineRect.top + window.pageYOffset;
            // Position at the top of timeline (education section) with reduced offset
            const finalPosition = timelineAbsoluteTop - 50;
            debugLog('🎓 Step 3: Timeline education fallback', {
              finalPosition,
              timelineAbsoluteTop,
              offset: -50,
            });
            window.scrollTo({ top: finalPosition, behavior: 'smooth' });
            return;
          }

          // Final fallback
          debugLog('🎓 Step 3: Using final fallback positioning');
          const finalPosition = absoluteElementTop - 100;
          debugLog('🎓 Step 3: Final fallback', { finalPosition });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        } else if (sectionId === 'timeline' && actualStep === 3) {
          // Work experience step - position below the work experience title on mobile
          debugLog('✅ STEP 4 CONDITION MET: timeline + actualStep === 3');
          debugLog('🎯 Mobile Step 4: Positioning below work experience title');

          // Try to find the work experience title first
          const workExperienceTitle = document.getElementById(
            'work-experience-title'
          );
          if (workExperienceTitle) {
            const workRect = workExperienceTitle.getBoundingClientRect();
            const workAbsoluteTop = workRect.top + window.pageYOffset;
            // Position below the work experience title but moved up by one card length (170px)
            const finalPosition = workAbsoluteTop + workRect.height + 20 - 170;
            debugLog(
              '🎯 Mobile Step 4: Work experience title positioning (moved up by one card)',
              {
                finalPosition,
                workAbsoluteTop,
                titleHeight: workRect.height,
                offset: 20,
                cardOffset: -170,
              }
            );
            window.scrollTo({ top: finalPosition, behavior: 'smooth' });
            return;
          }

          // Fallback to timeline section if work experience title not found
          const timelineSection = document.getElementById('timeline');
          if (timelineSection) {
            const timelineRect = timelineSection.getBoundingClientRect();
            const timelineAbsoluteTop = timelineRect.top + window.pageYOffset;
            // Position at the top of timeline with reduced offset
            const finalPosition = timelineAbsoluteTop - 50;
            debugLog('🎯 Mobile Step 4: Timeline fallback positioning', {
              finalPosition,
              timelineAbsoluteTop,
              offset: -50,
            });
            window.scrollTo({ top: finalPosition, behavior: 'smooth' });
            return;
          }

          debugLog('🎯 Mobile Step 4: Using final fallback');
          // Final fallback
          const finalPosition = absoluteElementTop - 100;
          debugLog('🎯 Mobile Step 4: Final fallback, scrolling to:', {
            finalPosition,
            absoluteElementTop,
            offset: -100,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        } else if (sectionId === 'projects') {
          // Projects step - different handling for step 5 and 6
          if (actualStep === 4) {
            // Step 5: Sample Project project
            debugLog('🎯 Mobile Step 5: Scrolling to Sample Project project');
            const sampleProjectProject =
              document.getElementById('project-featured-0');
            if (sampleProjectProject) {
              const projectRect = sampleProjectProject.getBoundingClientRect();
              const projectAbsoluteTop = projectRect.top + window.pageYOffset;
              const finalPosition = projectAbsoluteTop - 100;
              debugLog('🎯 Mobile Step 5: Sample Project positioning', {
                finalPosition,
                projectAbsoluteTop,
                offset: -100,
              });
              window.scrollTo({ top: finalPosition, behavior: 'smooth' });
              return;
            }
          } else if (actualStep === 5) {
            // Step 6: Example Company project
            debugLog('🎯 Mobile Step 6: Scrolling to Example Company project');
            const secondProject = document.getElementById('project-featured-1');
            if (secondProject) {
              const projectRect = secondProject.getBoundingClientRect();
              const projectAbsoluteTop = projectRect.top + window.pageYOffset;
              const finalPosition = projectAbsoluteTop - 100;
              debugLog(
                '🎯 Mobile Step 6: Example Company project positioning',
                {
                  finalPosition,
                  projectAbsoluteTop,
                  offset: -100,
                }
              );
              window.scrollTo({ top: finalPosition, behavior: 'smooth' });
              return;
            }
          }

          // Fallback: Projects step - center on projects section with reduced offset
          debugLog('🎯 Mobile Projects: Using fallback positioning');
          const finalPosition = absoluteElementTop - 150;
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        } else {
          // Default mobile case
          debugLog('🔄 Mobile default case', {
            sectionId,
            currentStep: actualStep + 1,
          });
        }

        window.scrollTo({
          top: finalScrollPosition,
          behavior: 'smooth',
        });
        return;
      } else {
        // Desktop/non-mobile case
        debugLog('🖥️ Desktop detected', {
          width: window.innerWidth,
          currentStep: actualStep + 1,
          sectionId,
        });
      }

      // Desktop handling (unchanged)
      // Special handling for Step 2 (skills) - position to TOP of skills section
      if (sectionId === 'skills' && isActive && actualStep === 1) {
        debugLog('🛠️ Step 2 Desktop: Scrolling to top of skills section');
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
          const skillsRect = skillsSection.getBoundingClientRect();
          const skillsAbsoluteTop = skillsRect.top + window.pageYOffset;
          // Position at the TOP of the skills section for desktop
          const finalPosition = skillsAbsoluteTop - 150;
          debugLog('🛠️ Step 2 Desktop: Skills positioning', {
            finalPosition,
            skillsAbsoluteTop,
            offset: -150,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }
      }

      // Special handling for Step 3 (education) targeting timeline - go directly to final position
      if (sectionId === 'timeline' && isActive && actualStep === 2) {
        debugLog(
          '🎓 Step 3 Desktop: Scrolling directly to education final position'
        );

        // Try to find specific education items first for most accurate positioning
        const educationItems = document.querySelectorAll(
          '[id^="timeline-university"], [id^="timeline-carnegie"]'
        );

        if (educationItems.length > 0) {
          const firstEducationItem = educationItems[0];
          const firstItemRect = firstEducationItem.getBoundingClientRect();
          const firstItemAbsoluteTop = firstItemRect.top + window.pageYOffset;
          const finalPosition = firstItemAbsoluteTop - 300; // Increased offset to stay higher
          debugLog('🎓 Step 3 Desktop: Education item positioning', {
            finalPosition,
            firstItemAbsoluteTop,
            offset: -300,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }

        // Fallback to timeline section
        const timelineSection = document.getElementById('timeline');
        if (timelineSection) {
          const timelineRect = timelineSection.getBoundingClientRect();
          const timelineAbsoluteTop = timelineRect.top + window.pageYOffset;
          const finalPosition = timelineAbsoluteTop - 200; // Increased offset to stay higher
          debugLog('🎓 Step 3 Desktop: Timeline fallback positioning', {
            finalPosition,
            timelineAbsoluteTop,
            offset: -200,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }
      }

      // Special handling for step 4 (experience) targeting timeline - go directly to final position
      if (sectionId === 'timeline' && isActive && actualStep === 3) {
        debugLog(
          '💼 Step 4 Desktop: Scrolling directly to work experience final position'
        );

        // Use same approach as Step 3 for consistency but target work experience area
        const workExperienceTitle = document.getElementById(
          'work-experience-title'
        );
        if (workExperienceTitle) {
          const workRect = workExperienceTitle.getBoundingClientRect();
          const workAbsoluteTop = workRect.top + window.pageYOffset;
          const finalPosition = workAbsoluteTop - 350; // Increased offset to stay higher
          debugLog('💼 Step 4 Desktop: Work experience title positioning', {
            finalPosition,
            workAbsoluteTop,
            offset: -350,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }

        // Fallback to same position as education
        const timelineSection = document.getElementById('timeline');
        if (timelineSection) {
          const timelineRect = timelineSection.getBoundingClientRect();
          const timelineAbsoluteTop = timelineRect.top + window.pageYOffset;
          const finalPosition = timelineAbsoluteTop - 200; // Increased offset to stay higher
          debugLog('💼 Step 4 Desktop: Timeline fallback positioning', {
            finalPosition,
            timelineAbsoluteTop,
            offset: -200,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }
      }

      // Special handling for projects (steps 5 and 6) - go directly to final position
      if (
        sectionId === 'projects' &&
        isActive &&
        (actualStep === 4 || actualStep === 5)
      ) {
        debugLog(
          `🎯 Step ${actualStep + 1} Desktop: Scrolling directly to projects final position`
        );
        const projectsSection = document.getElementById('projects');
        if (projectsSection) {
          const projectsRect = projectsSection.getBoundingClientRect();
          const projectsAbsoluteTop = projectsRect.top + window.pageYOffset;
          const finalPosition = projectsAbsoluteTop - 100; // Good offset to show projects clearly
          debugLog(`🎯 Step ${actualStep + 1} Desktop: Projects positioning`, {
            finalPosition,
            projectsAbsoluteTop,
            offset: -100,
          });
          window.scrollTo({ top: finalPosition, behavior: 'smooth' });
          return;
        }
      }

      // Special handling for work-experience-bottom to show all work items
      if (sectionId === 'work-experience-bottom') {
        const offset = 100; // Desktop offset
        const finalScrollPosition = absoluteElementTop - offset;

        window.scrollTo({
          top: finalScrollPosition,
          behavior: 'smooth',
        });
        return;
      }

      // Default desktop positioning
      const offset = 50; // Reduced for better framing
      const finalScrollPosition = absoluteElementTop - offset;

      window.scrollTo({
        top: finalScrollPosition,
        behavior: 'smooth',
      });
    }
  };

  const scrollToSpecificElement = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const isMobile = window.innerWidth < 768;
      const elementRect = element.getBoundingClientRect();
      const absoluteElementTop = elementRect.top + window.pageYOffset;

      if (isMobile) {
        // On mobile, position the specific element in the upper portion of the viewport
        const finalPosition = absoluteElementTop - 100; // Reduced offset
        window.scrollTo({ top: finalPosition, behavior: 'smooth' });
      } else {
        // Desktop handling with reduced offset
        const offset = 50; // Reduced for better framing
        const finalScrollPosition = absoluteElementTop - offset;
        window.scrollTo({
          top: finalScrollPosition,
          behavior: 'smooth',
        });
      }
    }
  };

  // Helper function to find arrow target elements and calculate positions relative to them
  const getArrowBasedPosition = (
    currentStep: number,
    side: 'left' | 'right'
  ) => {
    const stepTargets = {
      1: [
        'skill-product-strategy',
        'skill-data-analysis',
        'skill-stakeholder-management',
      ], // Step 2: Skills
      2: ['timeline', 'timeline'], // Step 3: Education
      3: ['work-experience-title'], // Step 4: Work Experience
      4: ['project-featured-0'], // Step 5: Project 1
      5: ['project-featured-1'], // Step 6: Project 2
    };

    const targets = stepTargets[currentStep as keyof typeof stepTargets] || [];
    if (targets.length === 0) return null;

    // Use the first target as reference point
    const targetElement = document.getElementById(targets[0]);
    if (!targetElement) return null;

    const rect = targetElement.getBoundingClientRect();
    const popupWidth = 384; // max-w-md = 448px, but use 384 for safety
    const arrowOffset = 100; // Distance from arrow

    let left, top;

    if (side === 'right') {
      // Position to the right of the target element
      left = rect.right + arrowOffset;
      // If too close to right edge, move left
      if (left + popupWidth > window.innerWidth) {
        left = window.innerWidth - popupWidth - 24;
      }
    } else {
      // Position to the left of the target element
      left = rect.left - popupWidth - arrowOffset;
      // If too close to left edge, move right
      if (left < 24) {
        left = 24;
      }
    }

    // Vertically center with target, but keep in viewport
    top = rect.top + rect.height / 2 - 150; // Assume popup height ~300px
    if (top < 24) top = 24;
    if (top + 300 > window.innerHeight) top = window.innerHeight - 324;

    return { top: `${top}px`, left: `${left}px`, right: 'auto' };
  };

  const getPopupPosition = (position: string, isPaused: boolean = false) => {
    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      // For mobile, adjust positioning based on paused state
      if (isPaused) {
        // When paused on mobile, calculate absolute position to stay in current viewport
        const scrollTop = window.pageYOffset;
        const scrollLeft = window.pageXOffset;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        return {
          top: `${scrollTop + viewportHeight / 2}px`,
          left: `${scrollLeft + viewportWidth / 2}px`,
          transform: 'translate(-50%, -50%)',
          right: 'auto',
        };
      } else {
        // When active on mobile, use fixed positioning (relative to viewport)
        return {
          top: '50vh',
          left: '50vw',
          transform: 'translate(-50%, -50%)',
          right: 'auto',
        };
      }
    }

    // Desktop positioning - when paused, calculations include page scroll to stick to content
    if (isPaused) {
      // When paused, calculate absolute positions that stick to page content
      const scrollTop = window.pageYOffset;
      const scrollLeft = window.pageXOffset;

      // Add scroll offset to make positions stick to page content, not screen
      const adjustPosition = (pos: any) => {
        if (pos.top && typeof pos.top === 'string' && pos.top.includes('px')) {
          const topValue = parseInt(pos.top);
          pos.top = `${topValue + scrollTop}px`;
        }
        if (
          pos.left &&
          typeof pos.left === 'string' &&
          pos.left.includes('px')
        ) {
          const leftValue = parseInt(pos.left);
          pos.left = `${leftValue + scrollLeft}px`;
        }
        if (
          pos.right &&
          typeof pos.right === 'string' &&
          pos.right.includes('px')
        ) {
          const rightValue = parseInt(pos.right);
          pos.right = `${rightValue + scrollLeft}px`;
        }
        return pos;
      };
    }

    // Desktop positioning with new dynamic arrow-based positions
    let basePosition;

    switch (position) {
      // New dynamic positions based on arrow locations
      case 'skills-title-left':
        // Step 2: Position near skills title on the left
        const skillsSection = document.getElementById('skills');
        if (skillsSection) {
          const rect = skillsSection.getBoundingClientRect();
          basePosition = {
            top: `${rect.top + 150}px`,
            left: '24px',
            right: 'auto',
          };
        } else {
          basePosition = { top: '400px', left: '24px', right: 'auto' };
        }
        break;

      case 'education-right-of-arrows':
        // Step 3: Position to the right of education arrows
        const educationPos = getArrowBasedPosition(2, 'right');
        basePosition = educationPos || {
          top: '400px',
          right: '24px',
          left: 'auto',
        };
        break;

      case 'work-experience-left-of-arrows':
        // Step 4: Position to the left of work experience arrows
        const workExperiencePos = getArrowBasedPosition(3, 'left');
        basePosition = workExperiencePos || {
          top: '500px',
          left: '24px',
          right: 'auto',
        };
        break;

      case 'project-next-to-arrows':
        // Step 5: Position next to project arrows (right side for first project)
        const project1Pos = getArrowBasedPosition(4, 'right');
        basePosition = project1Pos || {
          bottom: '200px',
          right: '24px',
          left: 'auto',
        };
        break;

      case 'project-next-to-arrows-2':
        // Step 6: Position next to project arrows (left side for second project)
        const project2Pos = getArrowBasedPosition(5, 'left');
        basePosition = project2Pos || {
          bottom: '80px',
          left: '24px',
          right: 'auto',
        };
        break;

      // Keep existing static positions for backward compatibility
      case 'top-left':
        // For Step 2 (Skills), position at very top-left of skills section without covering content
        if (currentStep === 1) {
          const skillsSection = document.getElementById('skills');
          if (skillsSection) {
            const rect = skillsSection.getBoundingClientRect();
            // Position above the skills content, not overlapping with "Product Strategy"
            basePosition = {
              top: `${rect.top - 20}px`, // Position above the skills section
              left: '24px',
              right: 'auto',
            };
          } else {
            basePosition = { top: '80px', left: '24px', right: 'auto' };
          }
        } else {
          basePosition = { top: '80px', left: '24px', right: 'auto' };
        }
        break;
      case 'top-right':
        basePosition = { top: '80px', right: '24px', left: 'auto' };
        break;
      case 'bottom-left':
        basePosition = { bottom: '80px', left: '24px', right: 'auto' };
        break;
      case 'bottom-right':
        basePosition = { bottom: '80px', right: '24px', left: 'auto' };
        break;
      case 'bottom-center':
        basePosition = {
          bottom: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          right: 'auto',
        };
        break;
      case 'center':
        basePosition = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          right: 'auto',
        };
        break;
      case 'work-experience-top':
        basePosition = {
          top: '300px',
          right: '24px',
          left: 'auto',
        };
        break;
      case 'education-left':
        basePosition = {
          top: '400px',
          left: '24px',
          right: 'auto',
        };
        break;
      case 'bottom-right-lower':
        basePosition = { bottom: '20px', right: '24px', left: 'auto' };
        break;
      case 'education-below':
        basePosition = { top: '450px', right: '24px', left: 'auto' };
        break;
      default:
        basePosition = { top: '80px', right: '24px', left: 'auto' };
        break;
    }

    // Apply scroll offset adjustment when paused (makes popup stick to page content)
    if (isPaused && basePosition) {
      const scrollTop = window.pageYOffset;
      const scrollLeft = window.pageXOffset;

      const adjustedPosition = { ...basePosition } as any;

      if (
        adjustedPosition.top &&
        typeof adjustedPosition.top === 'string' &&
        adjustedPosition.top.includes('px')
      ) {
        const topValue = parseInt(adjustedPosition.top);
        adjustedPosition.top = `${topValue + scrollTop}px`;
      }
      if (
        adjustedPosition.left &&
        typeof adjustedPosition.left === 'string' &&
        adjustedPosition.left.includes('px')
      ) {
        const leftValue = parseInt(adjustedPosition.left);
        adjustedPosition.left = `${leftValue + scrollLeft}px`;
      }
      if (
        adjustedPosition.right &&
        typeof adjustedPosition.right === 'string' &&
        adjustedPosition.right.includes('px')
      ) {
        const rightValue = parseInt(adjustedPosition.right);
        adjustedPosition.right = `${rightValue + scrollLeft}px`;
      }

      return adjustedPosition;
    }

    return basePosition;
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setHighlightedIndex(0);
      setCountdown(0);
      setCurrentCharacterIndex(0);
      setIsPaused(false);

      // Track button click
      trackTourEvent(
        'clicked',
        `next-button-step-${currentStep + 1}`,
        currentStep
      );

      // Track tour step progression
      trackTourEvent('viewed', tourSteps[nextStepIndex].id, nextStepIndex);

      // Debug logging for step advancement
      debugLog(`🔄 Advancing to Step ${nextStepIndex + 1}`, {
        stepId: tourSteps[nextStepIndex].id,
        targetSection: tourSteps[nextStepIndex].targetSection,
      });

      // All steps now use consistent scrollToSection logic (no special cases here)
      debugLog(
        `🚀 Step ${nextStepIndex + 1}: Scrolling to ${tourSteps[nextStepIndex].targetSection}`
      );
      scrollToSection(tourSteps[nextStepIndex].targetSection, nextStepIndex);
    } else {
      // Tour complete, show final CTA
      // Note: Testimonials section removed from template

      // Track tour completion
      trackTourEvent('completed', 'final', tourSteps.length);

      setIsActive(false);
      // Show final CTA after scroll completes
      setTimeout(() => {
        setShowFinalCTA(true);
      }, 800);
    }
  };

  const prevStep = () => {
    if (currentStep === 0) {
      // Restart tour
      startTour();
    } else {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      setHighlightedIndex(0);
      setCountdown(0);
      setCurrentCharacterIndex(0);
      setIsPaused(false);

      // Track button click
      trackTourEvent(
        'clicked',
        `prev-button-step-${currentStep + 1}`,
        currentStep
      );

      // Track going back to previous step
      trackTourEvent('viewed', tourSteps[prevStepIndex].id, prevStepIndex);

      // All steps use consistent scrollToSection logic
      scrollToSection(tourSteps[prevStepIndex].targetSection, prevStepIndex);
    }
  };

  const closeTour = () => {
    // Track tour abandonment if not at the end
    if (currentStep < tourSteps.length - 1) {
      trackTourEvent('skipped', tourSteps[currentStep].id, currentStep);
    }

    setIsActive(false);
    setShowFinalCTA(false);
    setCountdown(0);
    setCurrentCharacterIndex(0);
    setIsPaused(false);

    // Turn off cats when tour ends! 🐱
    setShowCats(false);

    // Ensure scrolling is restored
    document.body.style.overflow = 'unset';
    document.documentElement.style.overflow = 'unset';
  };

  const [showTourPopup, setShowTourPopup] = useState(true);

  const togglePause = () => {
    const wasPaused = isPaused;
    setIsPaused(!isPaused);

    trackTourEvent(
      'clicked',
      wasPaused ? 'resume-button' : 'pause-button',
      currentStep
    );

    if (wasPaused && isActive) {
      setShowTourPopup(false); // Hide popup during scroll
      const currentStepData = tourSteps[currentStep];
      scrollToSection(currentStepData.targetSection, currentStep);
      setTimeout(() => {
        setShowTourPopup(true); // Show popup after scroll completes
      }, 600); // Adjust delay as needed for scroll duration
    }
  };

  const handleFinalCTAAction = (action: 'message' | 'meeting') => {
    // Track CTA action
    trackTourEvent('tour_cta_action', 'final_cta', tourSteps.length, action);

    // Close tour (this will also turn off cats)
    closeTour();

    // Trigger the appropriate action immediately since we're already at testimonials
    if (action === 'message') {
      handleSendMessage();
    } else {
      handleScheduleMeeting();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Show card immediately when step changes, start highlighting after delay
  useEffect(() => {
    if (isActive) {
      // Always show full text immediately when step changes (even if paused)
      setCurrentCharacterIndex(-2); // -2 means show full text, -1 means show no text
    }
  }, [isActive, currentStep]);

  // Separate effect for highlighting animation (only when not paused)
  useEffect(() => {
    if (isActive && !isPaused) {
      let interval: NodeJS.Timeout | null = null;

      // Wait 1 second before starting the highlighting animation
      const initialDelay = setTimeout(() => {
        const currentStepData = tourSteps[currentStep];
        const characters = currentStepData.content.split('');
        const totalCharacters = characters.length;
        const highlightDuration = currentStepData.duration - 4000; // Reserve 4 seconds (1s initial + 3s pause)
        const intervalTime = 50; // 50ms per character for smooth letter-by-letter highlighting
        const totalIntervals = highlightDuration / intervalTime;
        const charactersPerInterval = totalCharacters / totalIntervals;

        let currentCharacterCount = 0;

        interval = setInterval(() => {
          currentCharacterCount += charactersPerInterval;
          const newIndex = Math.floor(currentCharacterCount);

          // Only update if the index actually changed to reduce re-renders
          setCurrentCharacterIndex((prev) =>
            prev !== newIndex ? newIndex : prev
          );

          if (currentCharacterCount >= totalCharacters) {
            if (interval) clearInterval(interval);
            // After highlighting is complete, wait 1 second then move to next step
            setTimeout(() => {
              setCurrentCharacterIndex(-2); // Show full text without highlighting
              nextStep();
            }, 1000); // 1 second pause after completion
          }
        }, intervalTime);
      }, 1000); // 1-second delay before starting

      return () => {
        clearTimeout(initialDelay);
        if (interval) clearInterval(interval);
      };
    }
  }, [isActive, currentStep, isPaused]);

  // Enhanced scroll lock effect - blocks user scrolling but allows tour navigation
  useEffect(() => {
    // Lock scrolling only when tour is active AND not paused (applies to all steps)
    const shouldLockScroll = isActive && !isPaused;

    const preventUserScroll = (e: WheelEvent | TouchEvent) => {
      // Only prevent user-initiated scroll events, not programmatic ones
      if (e.isTrusted) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const preventKeyboardScroll = (e: KeyboardEvent) => {
      const scrollKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'PageUp',
        'PageDown',
        'Home',
        'End',
        'Space',
      ];
      if (scrollKeys.includes(e.key) && e.isTrusted) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    if (shouldLockScroll) {
      // CSS overflow prevention for visual effect
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';

      // Event listener prevention for user scroll only (not programmatic)
      document.addEventListener('wheel', preventUserScroll, { passive: false });
      document.addEventListener('touchmove', preventUserScroll, {
        passive: false,
      });
      document.addEventListener('keydown', preventKeyboardScroll, {
        passive: false,
      });

      // Prevent scrolling on window
      window.addEventListener('wheel', preventUserScroll, { passive: false });
      window.addEventListener('touchmove', preventUserScroll, {
        passive: false,
      });
    } else {
      // Allow scrolling when tour is inactive, paused, or when user pauses any step
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';

      // Remove event listeners
      document.removeEventListener('wheel', preventUserScroll);
      document.removeEventListener('touchmove', preventUserScroll);
      document.removeEventListener('keydown', preventKeyboardScroll);
      window.removeEventListener('wheel', preventUserScroll);
      window.removeEventListener('touchmove', preventUserScroll);
    }

    // Cleanup function to ensure scrolling is restored
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';

      // Remove all event listeners
      document.removeEventListener('wheel', preventUserScroll);
      document.removeEventListener('touchmove', preventUserScroll);
      document.removeEventListener('keydown', preventKeyboardScroll);
      window.removeEventListener('wheel', preventUserScroll);
      window.removeEventListener('touchmove', preventUserScroll);
    };
  }, [isActive, isPaused]);

  // Optimized highlight cycling with reduced frequency
  useEffect(() => {
    if (isActive && tourSteps[currentStep].highlights && !isPaused) {
      const interval = setInterval(() => {
        setHighlightedIndex(
          (prev) =>
            (prev + 1) % (tourSteps[currentStep].highlights?.length || 1)
        );
      }, 3000); // Increased to 3 seconds for better performance

      return () => clearInterval(interval);
    }
  }, [isActive, currentStep, isPaused]);

  useEffect(() => {
    if (showFinalCTA) {
      const timer = setTimeout(() => {
        setShowFinalCTA(false);
        // Turn off cats when final CTA auto-closes
        setShowCats(false);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [showFinalCTA]);

  // Tour invitation popup effect - show after 3 seconds of landing
  useEffect(() => {
    if (!isActive && !tourInvitationDismissed && !showFinalCTA) {
      // Simple 3 second timer after landing on the site
      const timer = setTimeout(() => {
        if (!isActive && !tourInvitationDismissed && !showFinalCTA) {
          setShowTourInvitation(true);
        }
      }, 4000); // Show after 4 seconds

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isActive, tourInvitationDismissed, showFinalCTA, showTourInvitation]);

  const handleTourInvitationAccept = () => {
    console.log('🎯 Tour invitation accepted! Starting tour...');
    setShowTourInvitation(false);
    setTourInvitationDismissed(true);
    // Track click on "Take Tour" button
    trackTourEvent('clicked', 'tour-invitation-accept', 0);
    startTour(); // This will automatically turn on cats via startTour function
  };

  const handleTourInvitationDismiss = () => {
    setShowTourInvitation(false);
    setTourInvitationDismissed(true);
    // Track invitation dismissal
    trackTourEvent('clicked', 'tour-invitation-dismiss', 0);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Modern Navigation */}
      <ModernNavigation tourActive={isActive} />

      {/* Modern Hero Section */}
      <HeroSection
        onStartTour={startTour}
        tourActive={isActive}
        showCats={showCats}
        onCatsToggle={handleCatsToggle}
        trackButtonClick={trackButtonClick}
      />

      {/* Modern About Section */}
      <AboutSection />

      {/* Modern Skills Section */}
      <SkillsSection />

      {/* Timeline Section */}
      <TimelineSection tourActive={isActive} currentStep={currentStep} />

      {/* Projects Section */}
      <ProjectsSection />

      {/* Testimonials Section */}
      {/* <TestimonialsSection /> */}

      {/* Contact Section */}
      <ContactSection
        externalFormType={contactFormType}
        onFormTypeChange={setContactFormType}
        tourActive={isActive}
      />

      {/* Floating Chatbot */}
      <FloatingChatbot
        isExternallyOpen={isChatbotOpen}
        onExternalClose={() => setIsChatbotOpen(false)}
      />

      {/* Tour Arrows */}
      <TourArrows
        isActive={isActive}
        currentStep={currentStep}
        isPaused={isPaused}
      />

      {/* Radar Arrow - shows direction to tour content when scrolled away */}
      <RadarArrow
        isActive={isActive}
        currentStep={currentStep}
        onScrollToSection={scrollToSection}
      />

      {/* Tour Invitation Popup */}
      <AnimatePresence>
        {showTourInvitation && !isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-40 p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={handleTourInvitationDismiss}
            />

            {/* Popup Content */}
            <div className="relative max-w-sm w-full">
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 p-1 rounded-2xl shadow-2xl">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 relative">
                  {/* Close button */}
                  <button
                    onClick={handleTourInvitationDismiss}
                    className="absolute top-3 right-3 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                  >
                    <FiX className="w-4 h-4" />
                  </button>

                  {/* Content */}
                  <div className="text-center">
                    {/* Header with Icon */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                      <div className="p-3">
                        <span className="text-2xl">👋</span>
                      </div>
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        Hey there!
                      </h3>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={handleTourInvitationAccept}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <div className="space-y-1">
                        <div className="text-sm opacity-90">
                          Let me show you
                        </div>
                        <div className="text-lg font-bold text-yellow-300">
                          {siteConfig.tour.invitation}
                        </div>
                        <div className="inline-block bg-white/20 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/30">
                          <span className="text-sm font-bold">In 1 Minute</span>
                        </div>
                      </div>
                    </motion.button>
                  </div>

                  {/* Small dismiss option */}
                  <button
                    onClick={handleTourInvitationDismiss}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Step Popups */}
      <AnimatePresence>
        {isActive && showTourPopup && (
          <motion.div
            key={`step-${currentStep}`}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`${isPaused ? 'absolute' : 'fixed'} z-50 max-w-xs md:max-w-md will-change-transform`}
            style={{
              ...getPopupPosition(tourSteps[currentStep].position, isPaused),
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              perspective: '1000px',
            }}
            onClick={togglePause}
          >
            <div
              className={`bg-gradient-to-br ${tourSteps[currentStep].color} p-1 rounded-2xl shadow-2xl cursor-pointer ${isPaused ? 'backdrop-blur-sm' : ''}`}
            >
              <div
                className={`bg-white dark:bg-gray-900 rounded-xl p-3 md:p-6 relative transition-all duration-300 ${isPaused ? 'backdrop-blur-md bg-white/90 dark:bg-gray-900/90' : ''}`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTour();
                  }}
                  className="absolute top-1.5 right-1.5 md:top-3 md:right-3 px-1.5 py-0.5 md:px-3 md:py-1 text-xs font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-md transition-colors min-h-[24px] min-w-[32px] md:min-h-[32px] md:min-w-[44px] flex items-center justify-center"
                >
                  STOP
                </button>

                {/* Pause Indicator - only show when paused */}
                {isPaused && (
                  <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3 flex items-center gap-1 md:gap-2 text-blue-600 dark:text-blue-400">
                    <FiPause className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-xs font-semibold hidden md:inline">
                      PAUSED - You can scroll
                    </span>
                    <span className="text-xs font-semibold md:hidden">
                      PAUSED
                    </span>
                  </div>
                )}

                {/* Mobile Navigation Buttons - Bottom */}
                <div className="flex md:hidden justify-between items-center mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      prevStep();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-md shadow-md transition-all duration-300"
                  >
                    <FiChevronLeft className="w-3 h-3" />
                    <span className="text-xs">
                      {currentStep === 0 ? 'Restart' : 'Back'}
                    </span>
                  </motion.button>
                  <span className="text-xs text-gray-500 px-2">
                    {currentStep + 1}/{tourSteps.length}
                  </span>
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      nextStep();
                    }}
                    whileTap={{ scale: 0.9 }}
                    className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-md shadow-md transition-all duration-300"
                  >
                    <span className="text-xs">Next</span>
                    <FiChevronRight className="w-3 h-3" />
                  </motion.button>
                </div>

                {/* Desktop Navigation Buttons - Side */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevStep();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden md:block absolute top-1/2 -left-4 -translate-y-1/2 p-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title={currentStep === 0 ? 'Restart tour' : 'Previous step'}
                >
                  <FiChevronLeft className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextStep();
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 z-10"
                  title="Skip to next step"
                >
                  <FiChevronRight className="w-4 h-4" />
                </motion.button>

                <div className="flex items-start gap-1.5 md:gap-3 mb-2 md:mb-4">
                  <div
                    className={`p-1.5 md:p-3 bg-gradient-to-br ${tourSteps[currentStep].color} rounded-md md:rounded-xl text-white flex-shrink-0`}
                  >
                    <div className="w-4 h-4 md:w-6 md:h-6 flex items-center justify-center">
                      {tourSteps[currentStep].icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm md:text-lg text-gray-900 dark:text-white mb-1 md:mb-2 line-clamp-2">
                      {tourSteps[currentStep].title}
                    </h3>
                    <div className="text-xs md:text-base leading-tight md:leading-relaxed">
                      {renderHighlightedText(
                        tourSteps[currentStep].content,
                        currentCharacterIndex
                      )}
                    </div>
                  </div>
                </div>

                {/* Key highlights */}
                {tourSteps[currentStep].highlights && (
                  <div className="mb-2 md:mb-4 flex flex-wrap gap-1 md:gap-2">
                    {tourSteps[currentStep].highlights.map(
                      (highlight, index) => (
                        <span
                          key={highlight}
                          className={`px-1.5 py-0.5 md:px-3 md:py-1 text-xs font-semibold rounded-full bg-gradient-to-r ${tourSteps[currentStep].color} text-white ${
                            highlightedIndex === index
                              ? 'opacity-100'
                              : 'opacity-70'
                          }`}
                        >
                          {highlight}
                        </span>
                      )
                    )}
                  </div>
                )}

                {/* Step indicator - Desktop only */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex gap-2">
                    {tourSteps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          index === currentStep
                            ? `bg-gradient-to-r ${tourSteps[currentStep].color} scale-110`
                            : index < currentStep
                              ? 'bg-green-500'
                              : 'bg-gray-300 opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    Step {currentStep + 1} of {tourSteps.length} •{' '}
                    <span className="hidden md:inline">
                      {isPaused
                        ? 'Tap card to resume tour'
                        : 'Tap card to pause & scroll freely'}
                    </span>
                    <span className="md:hidden">
                      {isPaused
                        ? 'Tap anywhere to resume'
                        : 'Tap to pause & scroll'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final CTA */}
      <AnimatePresence>
        {showFinalCTA && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={closeTour}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl md:rounded-3xl p-3 md:p-8 max-w-xs md:max-w-md mx-auto text-center relative shadow-2xl border-2 border-purple-500"
            >
              <button
                onClick={closeTour}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>

              <div className="mb-4 md:mb-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">🎯</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 md:mb-3">
                  Thanks for exploring
                </h2>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {siteConfig.tour.closing}
                </p>
              </div>

              <div className="flex flex-col gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                  <motion.button
                    onClick={() => handleFinalCTAAction('message')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 md:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                  >
                    <FiMessageCircle className="w-4 h-4" />
                    <span className="text-sm md:text-base">Send Message</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleFinalCTAAction('meeting')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 md:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg md:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 min-h-[48px]"
                  >
                    <FiCalendar className="w-4 h-4" />
                    <span className="text-sm md:text-base">
                      Schedule Meeting
                    </span>
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => {
                    // Track restart action
                    trackTourEvent(
                      'tour_cta_action',
                      'final_cta',
                      tourSteps.length,
                      'restart'
                    );
                    startTour();
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center gap-2 px-4 py-2 md:py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 text-sm min-h-[44px]"
                >
                  <span>🔄</span>
                  <span>That was fun, do it again!</span>
                </motion.button>
              </div>

              <p className="text-xs text-gray-400">
                This popup will close automatically in 15 seconds
              </p>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Back to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-20 left-3 md:left-4 z-40 p-2.5 md:p-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
        title="Back to top"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      </button>
    </main>
  );
}
