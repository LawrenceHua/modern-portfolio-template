'use client';
import { siteConfig } from '@/config/site';

import { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import type { Message, FilePreview } from '../types/chatbot';
import { trackChatbotEvent } from '../lib/analytics';
import {
  getSessionId,
  updateSessionActivity,
  clearSession,
} from '../lib/session';

const WELCOME_MESSAGE: Message = {
  role: 'assistant' as const,
  content: `👋 Hey there! I'm ${siteConfig.name}'s AI assistant!

I can help you discover what makes ${siteConfig.name} tick as a ${siteConfig.title}.

Try asking me something like "What's ${siteConfig.name}'s biggest accomplishment?" or "How does ${siteConfig.name} approach problem-solving?"`,
  timestamp: new Date(),
};

export function useChatbot(isOpen: boolean) {
  // Initialize with welcome message like the original
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);

  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isCalendarMode, setIsCalendarMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Restore missing state variables from original
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoveMode, setIsLoveMode] = useState(false);
  const [awaitingGirlfriendPassword, setAwaitingGirlfriendPassword] =
    useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fileError, setFileError] = useState('');
  const [hasUserSentMessage, setHasUserSentMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null); // Changed to textarea like original
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track conversation start when chatbot opens
  useEffect(() => {
    if (isOpen) {
      trackChatbotEvent('conversation_started', {
        timestamp: new Date().toISOString(),
        initialMessageLength: messages[0]?.content.length || 0,
      });
    }
  }, [isOpen]);

  // Detect mobile/desktop with proper responsive handling like original
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const isDesktop = !isMobile;

  // Auto-scroll function for smooth scrolling to bottom like original
  const scrollToBottom = (delay: number = 100) => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }, delay);
  };

  // Function to determine if a query will likely take longer (more restrictive)
  const willTakeLonger = (message: string): boolean => {
    const lowerMessage = message.toLowerCase().trim();

    // INSTANT RESPONSES: Quick button clicks should NEVER show loading
    const instantButtonResponses = [
      'skills',
      'skill',
      'experience',
      'experiences',
      'projects',
      'portfolio',
      'education',
      'degree',
      'contact',
      'connect',
      'ai',
      'artificial intelligence',
      'machine learning',
      'ml',
      'technologies',
      'tech stack',
    ];

    // If it's a simple button click (single word or very short phrase), make it instant
    if (
      instantButtonResponses.includes(lowerMessage) ||
      lowerMessage.length <= 15
    ) {
      return false;
    }

    const longRunningTriggers = [
      `tell me about ${siteConfig.name.toLowerCase()}'s experience`,
      `${siteConfig.name.toLowerCase()}'s background`,
      `what has ${siteConfig.name.toLowerCase()} done`,
      `${siteConfig.name.toLowerCase()}'s work history`,
      `${siteConfig.name.toLowerCase()}'s resume`,
      `${siteConfig.name.toLowerCase()}'s cv`,
      `all of ${siteConfig.name.toLowerCase()}'s skills`,
      `${siteConfig.name.toLowerCase()}'s technical abilities`,
      `${siteConfig.name.toLowerCase()}'s expertise`,
      `${siteConfig.name.toLowerCase()}'s accomplishments`,
      `${siteConfig.name.toLowerCase()}'s achievements`,
      `${siteConfig.name.toLowerCase()}'s portfolio`,
      `${siteConfig.name.toLowerCase()}'s projects`,
      'comprehensive',
      'detailed',
      'everything about',
      'full background',
      'complete experience',
      'entire portfolio',
    ];

    // More restrictive - require longer phrases or specific comprehensive requests
    return (
      longRunningTriggers.some((trigger) => lowerMessage.includes(trigger)) ||
      (lowerMessage.includes(`${siteConfig.name.toLowerCase()}`) &&
        (lowerMessage.includes('experience') ||
          lowerMessage.includes('background')) &&
        lowerMessage.length > 25)
    ); // Only for longer, detailed queries
  };

  // Get a varied loading message (restored from original)
  const getLoadingMessage = (): string => 'Thinking...';

  // API call function that can be reused (restored from original)
  const sendMessageToAPI = async (
    messageText: string,
    currentMessages: Message[]
  ) => {
    // Check if this query will likely take longer
    const isLongRunning = willTakeLonger(messageText);

    // Add predictive loading message for longer queries
    if (isLongRunning) {
      const loadingMessage: Message = {
        role: 'assistant',
        content: getLoadingMessage(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, loadingMessage]);

      // Scroll to bottom after adding loading message
      scrollToBottom();

      // Small delay to show the loading message
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('history', JSON.stringify(currentMessages.slice(-10))); // Only send last 10 messages for faster processing
      formData.append('sessionId', getSessionId());

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Check if this is the friend easter egg response using the flag from backend
      const isspecialTopicResponse = data.isspecialTopicResponse;

      // Check if password is needed
      const needsPassword = data.needsPassword;
      setAwaitingGirlfriendPassword(!!needsPassword);

      if (isspecialTopicResponse && !needsPassword) {
        setIsLoveMode(true);
      }

      // Replace loading message with actual response, or append if no loading message
      setMessages((prev) => {
        // Check if the last message is our loading message
        const lastMessage = prev[prev.length - 1];
        const isLoadingMessage =
          lastMessage &&
          (lastMessage.content.includes('⏳ Bear with me while I gather') ||
            lastMessage.content.includes(
              `🔍 Pulling up ${siteConfig.name}'s`
            ) ||
            lastMessage.content.includes(`📊 Analyzing ${siteConfig.name}'s`) ||
            lastMessage.content.includes('💼 Compiling his') ||
            lastMessage.content.includes('🚀 Loading') ||
            lastMessage.content.includes('⚡ Gathering insights') ||
            lastMessage.content.includes(`🛠️ Compiling ${siteConfig.name}'s`));

        if (isLoadingMessage && isLongRunning) {
          // Replace the loading message with the actual response
          return [
            ...prev.slice(0, -1),
            {
              role: 'assistant',
              content: data.response,
              timestamp: new Date(),
            },
          ];
        } else {
          // Append normally if no loading message
          return [
            ...prev,
            {
              role: 'assistant',
              content: data.response,
              timestamp: new Date(),
            },
          ];
        }
      });
    } catch (error) {
      console.error('Chatbot error:', error);

      // Replace loading message with error response, or append if no loading message
      setMessages((prev) => {
        const lastMessage = prev[prev.length - 1];
        const isLoadingMessage =
          lastMessage &&
          (lastMessage.content.includes('⏳ Bear with me while I gather') ||
            lastMessage.content.includes(
              `🔍 Pulling up ${siteConfig.name}'s`
            ) ||
            lastMessage.content.includes(`📊 Analyzing ${siteConfig.name}'s`) ||
            lastMessage.content.includes('💼 Compiling his') ||
            lastMessage.content.includes('🚀 Loading') ||
            lastMessage.content.includes('⚡ Gathering insights') ||
            lastMessage.content.includes(`🛠️ Compiling ${siteConfig.name}'s`));

        const errorMessage = {
          role: 'assistant' as const,
          content: `I'm sorry, I'm having trouble connecting right now. Please try again later or reach out to ${siteConfig.name} directly.`,
          timestamp: new Date(),
        };

        if (isLoadingMessage && isLongRunning) {
          // Replace the loading message with the error message
          return [...prev.slice(0, -1), errorMessage];
        } else {
          // Append normally if no loading message
          return [...prev, errorMessage];
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear session when chatbot is closed (restored from original)
  useEffect(() => {
    if (!isOpen) {
      clearSession();
    }
  }, [isOpen]);

  // Focus input when chatbot opens (mobile + desktop with gentle mobile handling) - restored from original
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      // Small delay to ensure the component is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          try {
            if (isMobile) {
              // For mobile, set focus but prevent auto-scroll until user explicitly taps
              // This prepares the input for keyboard activation on touch
              inputRef.current.focus({ preventScroll: true });
            } else {
              // Normal focus for desktop
              inputRef.current.focus();
            }
          } catch (error) {
            console.log('Initial focus failed:', error);
          }
        }
      }, 100);
    }
  }, [isOpen, isMinimized, isMobile]);

  // Auto-focus input after first message and subsequent assistant responses (mobile + desktop) - restored from original
  useEffect(() => {
    if (showCalendar) {
      // Skip auto-focus while calendar picker is open to prevent scroll jump
      return;
    }
    if (hasUserSentMessage && !isLoading && !isMinimized && inputRef.current) {
      // Small delay to ensure the assistant response is fully rendered
      setTimeout(() => {
        if (inputRef.current) {
          try {
            // For mobile, ensure input stays ready for keyboard
            if (isMobile) {
              // Keep input ready for keyboard activation
              inputRef.current.focus({ preventScroll: true });
            } else {
              // Normal focus for desktop
              inputRef.current.focus();
            }
          } catch (error) {
            // Fallback if focus fails
            console.log('Auto-focus failed:', error);
          }
        }
      }, 300);
    }
  }, [
    messages,
    isLoading,
    hasUserSentMessage,
    isMobile,
    isMinimized,
    showCalendar,
  ]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-scroll when calendar shows/hides
  useEffect(() => {
    if (showCalendar) {
      scrollToBottom();
    }
  }, [showCalendar]);

  // Auto-scroll when loading state changes (for new assistant responses)
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  // Auto-scroll when file error appears
  useEffect(() => {
    if (fileError) {
      scrollToBottom();
    }
  }, [fileError]);

  const sendMessage = async (messageText: string, files?: File[]) => {
    if (!messageText.trim() && (!files || files.length === 0)) return;

    const currentMessages = [...messages];
    const sessionId = getSessionId();
    updateSessionActivity();

    // Track message send event
    const eventData = {
      eventType: 'message_sent',
      sessionId: sessionId,
      messageLength: messageText.length,
      hasFiles: files ? files.length > 0 : false,
      fileTypes:
        files && files.length > 0
          ? Array.from(new Set(files.map((f) => f.type || 'unknown')))
          : [],
      timestamp: new Date().toISOString(),
    };

    trackChatbotEvent('message_sent', eventData);

    // Add user message IMMEDIATELY with flushSync for instant appearance
    const userMessage: Message = {
      role: 'user',
      content: messageText,
      files: files?.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
      })),
      timestamp: new Date(),
    };

    // Use flushSync to force immediate DOM update - user message appears instantly
    flushSync(() => {
      setInputValue('');
      setSelectedFiles([]);
      setMessages((prev) => [...prev, userMessage]);
      setHasUserSentMessage(true);
    });

    // Handle file uploads with custom API call
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append('message', messageText);
      formData.append('history', JSON.stringify(currentMessages.slice(-10))); // Only send last 10 messages for faster processing
      formData.append('sessionId', sessionId);
      files.forEach((file) => {
        formData.append('files', file);
      });

      setIsLoading(true);

      try {
        const response = await fetch('/api/chatbot', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();

        // Check if this is the friend easter egg response using the flag from backend
        const isspecialTopicResponse = data.isspecialTopicResponse;
        const needsPassword = data.needsPassword;
        setAwaitingGirlfriendPassword(!!needsPassword);

        if (isspecialTopicResponse && !needsPassword) {
          setIsLoveMode(true);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          },
        ]);
      } catch (error) {
        console.error('Chatbot error:', error);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `I'm sorry, I'm having trouble connecting right now. Please try again later or reach out to ${siteConfig.name} directly.`,
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use the shared API function for text-only messages
      sendMessageToAPI(messageText, [...currentMessages, userMessage]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && selectedFiles.length === 0) || isLoading) return;
    sendMessage(inputValue, selectedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    const files = Array.from(e.target.files || []);

    // Track file selection
    if (files.length > 0) {
      trackChatbotEvent('files_selected', {
        fileCount: files.length,
        fileSizes: files.map((f) => f.size),
        fileTypes: files.map((f) => f.type),
        messageCount: messages.length,
      });
    }

    // Limit file size to 10MB
    const tooLarge = files.some((file) => file.size > 10 * 1024 * 1024);
    if (tooLarge) {
      trackChatbotEvent('file_error', {
        errorType: 'size_limit',
        fileCount: files.length,
      });
      setFileError(
        'File size exceeds the 10MB limit. Please select a smaller file.'
      );
      scrollToBottom();
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    if (files.length > 0) {
      scrollToBottom();
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Check if the last assistant message should trigger the calendar (restored from original)
  const shouldShowCalendar = () => {
    const lastMessage = messages[messages.length - 1];
    return (
      lastMessage &&
      lastMessage.role === 'assistant' &&
      lastMessage.content.includes(
        'When would you like to schedule the meeting'
      )
    );
  };

  // Show calendar when appropriate
  useEffect(() => {
    if (shouldShowCalendar() && !showCalendar) {
      setShowCalendar(true);
    }
  }, [messages, showCalendar]);

  return {
    // State
    messages,
    isLoading,
    inputValue,
    selectedFiles,
    isCalendarMode,
    isMobile,
    isDesktop,
    isMinimized,
    isFullscreen,
    isLoveMode,
    awaitingGirlfriendPassword,
    showMenu,
    showCalendar,
    fileError,
    hasUserSentMessage,

    // Refs
    messagesEndRef,
    inputRef,
    fileInputRef,

    // Actions
    setInputValue,
    setIsCalendarMode,
    setIsMinimized,
    setIsFullscreen,
    setIsLoveMode,
    setAwaitingGirlfriendPassword,
    setShowMenu,
    setShowCalendar,
    setFileError,
    setHasUserSentMessage,
    sendMessage,
    sendMessageToAPI,
    handleSubmit,
    handleFileSelect,
    removeFile,
    scrollToBottom,
    getLoadingMessage,
    willTakeLonger,
    shouldShowCalendar,
  };
}
