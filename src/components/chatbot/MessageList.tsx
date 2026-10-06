'use client';
import { siteConfig } from '@/config/site';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiCpu,
  FiImage,
  FiFile,
  FiMessageCircle,
  FiHeart,
} from 'react-icons/fi';
import type { Message } from '../../types/chatbot';
import { formatMessage } from '../../lib/messageFormatter';
import styles from './Chatbot.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  getLoadingMessage: (message: string, currentMessages?: Message[]) => string;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isMobile: boolean;
  isLoveMode?: boolean;
}

function getFileIcon(file: { type: string; name: string }) {
  if (file.type.startsWith('image/')) return <FiImage className="h-4 w-4" />;
  if (file.type.includes('pdf')) return <FiFile className="h-4 w-4" />;
  return <FiFile className="h-4 w-4" />;
}

export function MessageList({
  messages,
  isLoading,
  getLoadingMessage,
  messagesEndRef,
  isMobile,
  isLoveMode = false,
}: MessageListProps) {
  const lastUserMessage = messages.filter((m) => m.role === 'user').pop();

  return (
    <div className="flex-1 overflow-y-auto px-4 py-3">
      {messages.map((message, index) => (
        <motion.div
          key={index}
          initial={
            message.role === 'user'
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 10 }
          }
          animate={{ opacity: 1, y: 0 }}
          transition={
            message.role === 'user'
              ? { duration: 0 }
              : {
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: 'easeOut',
                }
          }
          className={`flex ${
            message.role === 'user' ? 'justify-end' : 'justify-start'
          } mb-3`}
        >
          <div
            className={`${styles.messageBubble} ${styles[message.role]} flex items-start gap-2`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                  : isLoveMode
                    ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
              }`}
            >
              {message.role === 'user' ? (
                <FiUser className="w-3 h-3" />
              ) : (
                <FiCpu className="w-3 h-3" />
              )}
            </div>

            {/* Message Content */}
            <div className="flex-1 min-w-0">
              {/* Role Label */}
              <div className="mb-1">
                <span
                  className={`text-xs font-semibold ${
                    message.role === 'user'
                      ? 'text-white/90'
                      : isLoveMode
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-purple-600 dark:text-purple-400'
                  }`}
                >
                  {message.role === 'user'
                    ? 'You'
                    : isLoveMode
                      ? `${siteConfig.name}'s Love Bot 💕`
                      : `${siteConfig.name}'s AI`}
                </span>
              </div>

              {/* Message Text */}
              <div
                className={`text-sm leading-normal ${
                  message.role === 'user'
                    ? 'text-white'
                    : 'text-slate-700 dark:text-slate-200'
                }`}
                dangerouslySetInnerHTML={{
                  __html:
                    message.content.includes('<ul style=') ||
                    message.content.includes('<li style=')
                      ? message.content // Already formatted on backend
                      : formatMessage(message.content, isLoveMode), // Format on frontend
                }}
              />

              {/* File Previews */}
              {message.files && message.files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {message.files.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className={`flex items-center gap-2 p-2 rounded-lg border ${
                        message.role === 'user'
                          ? 'bg-white/10 border-white/20'
                          : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
                      }`}
                    >
                      <div
                        className={`${
                          message.role === 'user'
                            ? 'text-white/80'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {getFileIcon(file)}
                      </div>
                      <span
                        className={`text-xs font-medium truncate ${
                          message.role === 'user'
                            ? 'text-white/90'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {file.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-white/70'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {message.timestamp?.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Loading Message - Only show if no recent predictive loading message exists */}
      {isLoading &&
        (() => {
          const lastMessage = messages[messages.length - 1];
          const hasRecentLoadingMessage =
            lastMessage &&
            lastMessage.role === 'assistant' &&
            lastMessage.timestamp &&
            Date.now() - lastMessage.timestamp.getTime() < 2000; // Within last 2 seconds
          return !hasRecentLoadingMessage;
        })() && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-3"
          >
            <div
              className={`${styles.messageBubble} ${styles.assistant} flex items-start gap-2`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                  isLoveMode
                    ? 'bg-gradient-to-br from-pink-400 to-pink-600 text-white'
                    : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
                }`}
              >
                <FiCpu className="w-3 h-3" />
              </div>

              {/* Loading Content */}
              <div className="flex-1 min-w-0">
                <div className="mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isLoveMode
                        ? 'text-pink-600 dark:text-pink-400'
                        : 'text-purple-600 dark:text-purple-400'
                    }`}
                  >
                    {isLoveMode
                      ? `${siteConfig.name}'s Love Bot 💕`
                      : `${siteConfig.name}'s AI`}
                  </span>
                </div>

                <div
                  className={`${styles.loadingMessage} flex items-center gap-2`}
                >
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isLoveMode ? 'bg-pink-400' : 'bg-purple-400'
                        } animate-pulse`}
                        style={{
                          animationDelay: `${i * 0.2}s`,
                          animationDuration: '1s',
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {getLoadingMessage('Thinking...')}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

      <div ref={messagesEndRef} />
    </div>
  );
}
