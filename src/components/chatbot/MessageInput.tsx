'use client';
import { siteConfig } from '@/config/site';

import React from 'react';
import { FiSend, FiTrash2, FiImage, FiFile, FiMenu } from 'react-icons/fi';

interface MessageInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  selectedFiles: File[];
  handleSubmit: (
    e: React.FormEvent<Element> | React.KeyboardEvent<Element>
  ) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: (index: number) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isMobile: boolean;
  fileError?: string;
  setFileError?: (error: string) => void;
  scrollToBottom?: () => void;
  showMenu?: boolean;
  setShowMenu?: (show: boolean) => void;
}

function getFileIcon(file: File) {
  if (file.type.startsWith('image/'))
    return <FiImage className="h-4 w-4 text-blue-500" />;
  if (file.type.includes('pdf'))
    return <FiFile className="h-4 w-4 text-red-500" />;
  return <FiFile className="h-4 w-4 text-gray-500" />;
}

export function MessageInput({
  inputValue,
  setInputValue,
  selectedFiles,
  handleSubmit,
  handleFileSelect,
  removeFile,
  isLoading,
  inputRef,
  fileInputRef,
  isMobile,
  fileError,
  setFileError,
  scrollToBottom,
  showMenu = false,
  setShowMenu,
}: MessageInputProps) {
  return (
    <div className="space-y-3">
      {/* File Error Display */}
      {fileError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
          {fileError}
        </div>
      )}

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
            >
              {getFileIcon(file)}
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-500 hover:text-red-700 transition-colors"
                title="Remove file"
              >
                <FiTrash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Form - Perfectly Aligned Layout */}
      <form onSubmit={handleSubmit} className="flex gap-3 items-center">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Message Input - Takes full width */}
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<Element>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onTouchStart={(e) => {
              // Ensure keyboard appears on mobile when tapping input
              if (isMobile && inputRef.current) {
                // Brief delay to ensure touch is registered, then focus
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.focus();
                    // Scroll to input if needed
                    inputRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }
                }, 50);
              }
            }}
            onFocus={() => {
              // When input gets focus, ensure it's visible on mobile
              if (isMobile && inputRef.current) {
                setTimeout(() => {
                  if (inputRef.current) {
                    inputRef.current.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }
                }, 300); // Delay to account for keyboard animation
              }
            }}
            placeholder={
              isMobile
                ? 'Ask me anything'
                : `Ask me anything about ${siteConfig.name}`
            }
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500"
            rows={1}
            disabled={isLoading}
            style={{
              height: isMobile ? '44px' : '52px',
              lineHeight: '1.4',
              padding: '12px 16px',
              maxHeight: isMobile ? '100px' : '120px',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              fontFamily: 'inherit',
              fontSize: '16px',
              borderWidth: '1px',
              minHeight: isMobile ? '44px' : '52px',
              resize: 'none',
            }}
          />
        </div>

        {/* Right Side Buttons - Hamburger Menu + Send */}
        <div className="flex gap-2">
          {/* Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setShowMenu && setShowMenu(!showMenu)}
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 dark:from-slate-700 dark:to-slate-800 dark:hover:from-slate-600 dark:hover:to-slate-700 text-slate-600 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-600 transition-all duration-200 hover:scale-105 active:scale-95"
            title="Open menu"
            disabled={isLoading}
            style={{
              width: isMobile ? '44px' : '52px',
              height: isMobile ? '44px' : '52px',
              boxSizing: 'border-box',
              borderWidth: '1px',
              flexShrink: 0,
              minWidth: isMobile ? '44px' : '52px',
              minHeight: isMobile ? '44px' : '52px',
            }}
          >
            <FiMenu className="h-5 w-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={
              isLoading || (!inputValue.trim() && selectedFiles.length === 0)
            }
            className="flex-shrink-0 flex items-center justify-center bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 text-white rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md"
            title="Send message"
            style={{
              width: isMobile ? '44px' : '52px',
              height: isMobile ? '44px' : '52px',
              boxSizing: 'border-box',
              borderWidth: '0px',
              flexShrink: 0,
              minWidth: isMobile ? '44px' : '52px',
              minHeight: isMobile ? '44px' : '52px',
            }}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <FiSend className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
