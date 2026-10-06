'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { ChatInterface } from './ChatInterface';
import { trackButtonClick } from '../../lib/analytics';

interface FloatingChatbotProps {
  isExternallyOpen?: boolean;
  onExternalClose?: () => void;
}

export default function FloatingChatbot({
  isExternallyOpen = false,
  onExternalClose,
}: FloatingChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasBeenClicked, setHasBeenClicked] = useState(false);

  // Handle external control (from tour CTA buttons)
  useEffect(() => {
    if (isExternallyOpen && !isOpen) {
      setIsOpen(true);
      // Mark as clicked since it was opened externally
      if (!hasBeenClicked) {
        setHasBeenClicked(true);
        localStorage.setItem('chatbot-clicked', 'true');
      }
      // Track external opening
      trackButtonClick('chatbot', 'opened_from_tour');
    }
  }, [isExternallyOpen, isOpen, hasBeenClicked, isMobile]);

  // Check if chatbot has been clicked before on component mount
  useEffect(() => {
    const chatbotClicked = localStorage.getItem('chatbot-clicked');
    if (chatbotClicked === 'true') {
      setHasBeenClicked(true);
    }
  }, []);

  // Detect mobile/desktop
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handleToggle = () => {
    const newState = !isOpen;
    setIsOpen(newState);

    // Mark as clicked for the first time and store in localStorage
    if (!hasBeenClicked) {
      setHasBeenClicked(true);
      localStorage.setItem('chatbot-clicked', 'true');
    }

    // Track chatbot open/close
    trackButtonClick('chatbot', newState ? 'opened' : 'closed');
  };

  const handleClose = () => {
    setIsOpen(false);
    // Notify external control that chatbot was closed
    if (onExternalClose) {
      onExternalClose();
    }

    // Track chatbot close
    trackButtonClick('chatbot', 'closed_manually');
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            onClick={handleToggle}
            className="fixed bottom-6 right-6 z-50 group"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Main Button */}
            <div className="relative">
              {/* Gradient Background */}
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 via-blue-600 to-purple-700 rounded-full shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 flex items-center justify-center group-hover:from-purple-600 group-hover:via-blue-700 group-hover:to-purple-800">
                <FiMessageCircle className="w-7 h-7 text-white" />
              </div>

              {/* Glowing Border Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-blue-600 to-purple-700 opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300" />

              {/* Pulse Animation - Only show if not clicked before */}
              {!hasBeenClicked && (
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 animate-ping opacity-20" />
              )}

              {/* Notification Dot - Only show if not clicked before */}
              {!hasBeenClicked && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full border-2 border-white shadow-lg">
                  <div className="w-full h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse" />
                </div>
              )}
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-slate-900 text-white text-sm font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                💬 Chat with {siteConfig.name}'s AI
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Interface */}
      <ChatInterface isOpen={isOpen} onClose={handleClose} />
    </>
  );
}
