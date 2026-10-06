'use client';
import { siteConfig } from '@/config/site';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiPlay,
  FiPause,
  FiClock,
  FiCalendar,
  FiHeadphones,
  FiRss,
  FiArrowLeft,
  FiMic,
  FiDownload,
} from 'react-icons/fi';
import Link from 'next/link';

const episodes = siteConfig.episodes;

export default function PodcastPage() {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = (episodeId: string) => {
    if (currentlyPlaying === episodeId) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentlyPlaying(episodeId);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Portfolio
            </Link>
            <a
              href="/api/rss"
              className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <FiRss className="w-5 h-5 mr-2" />
              RSS Feed
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <FiMic className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {siteConfig.podcast.title}
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto">
              {siteConfig.podcast.description}
            </p>
            <div className="flex items-center justify-center mt-8 space-x-6 text-indigo-100">
              <span className="flex items-center">
                <FiHeadphones className="w-5 h-5 mr-2" />
                {episodes.length} Episodes
              </span>
              <span className="flex items-center">
                <FiCalendar className="w-5 h-5 mr-2" />
                Weekly
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">
            Latest Episodes
          </h2>
          <div className="space-y-6">
            {episodes.map((episode, index) => (
              <motion.article
                key={episode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4">
                    <button
                      onClick={() => handlePlay(episode.id)}
                      className="flex-shrink-0 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      {currentlyPlaying === episode.id && isPlaying ? (
                        <FiPause className="w-6 h-6" />
                      ) : (
                        <FiPlay className="w-6 h-6 ml-1" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400 mb-1">
                        <span className="font-medium text-indigo-600 dark:text-indigo-400">
                          EP {String(episodes.length - index).padStart(3, '0')}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <FiCalendar className="w-4 h-4 mr-1" />
                          {new Date(episode.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <FiClock className="w-4 h-4 mr-1" />
                          {episode.duration}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        {episode.title}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-300 mb-4">
                        {episode.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {episode.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      className="flex-shrink-0 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                      title="Download episode"
                    >
                      <FiDownload className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {currentlyPlaying === episode.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-indigo-600 rounded-full" />
                      </div>
                      <span className="text-sm text-slate-500">
                        12:34 / {episode.duration}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      Audio playback coming soon! This is a demo interface.
                    </p>
                  </motion.div>
                )}
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
