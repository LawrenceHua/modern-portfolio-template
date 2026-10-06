'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { geolocationManager } from '../../lib/geolocation';

export default function VisitorTracker() {
  const pathname = usePathname();
  const hasTrackedRef = useRef<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) return;
    const trackVisitorLocation = async () => {
      try {
        // Prevent duplicate tracking for the same pathname in a short time
        const trackingKey = `${pathname}-${Date.now()}`;
        if (hasTrackedRef.current.has(pathname)) {
          console.log('🌍 Skipping duplicate visitor tracking for:', pathname);
          return;
        }

        // Mark as tracked for this session
        hasTrackedRef.current.add(pathname);

        // Get or create session ID
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId =
            'visitor-' +
            Date.now() +
            '-' +
            Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('sessionId', sessionId);
        }

        // Use centralized geolocation manager
        const geoData = await geolocationManager.getGeolocation();

        // Track visitor location
        await fetch('/api/track-visitor-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || null,
            pathname: pathname || '/',
            locationData: geoData, // Pass the geo data directly to avoid another API call
          }),
        });

        console.log('🌍 Visitor location tracked for:', pathname);
      } catch (error) {
        console.error('Failed to track visitor location:', error);
      }
    };

    // Debounce tracking to prevent rapid-fire calls
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      trackVisitorLocation();
    }, 100); // 100ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null; // This component renders nothing
}
