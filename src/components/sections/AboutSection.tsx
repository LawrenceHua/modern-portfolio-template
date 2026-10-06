'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.3,
        duration: isMobile ? 0 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.8,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="about"
      ref={ref}
      className="relative py-20 bg-white dark:bg-slate-950 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-gray-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-gray-500/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto max-w-6xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-black dark:text-white sm:text-5xl">
            {siteConfig.aboutCopy.copy0}
            <span className="text-black dark:text-white">
              {siteConfig.name}
            </span>
          </h2>
          <div className="mx-auto h-1 w-24 bg-black dark:bg-white rounded-full" />
        </motion.div>

        {/* Main Content */}
        <div className="space-y-12">
          {/* Story Section */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 shadow-xl">
              <h3 className="mb-6 text-2xl font-bold text-black dark:text-white text-center">
                {siteConfig.about.title}
              </h3>

              <div className="space-y-4 text-gray-700 dark:text-gray-300 max-w-4xl mx-auto">
                <p className="text-lg leading-relaxed">
                  {siteConfig.about.paragraphs[0]}
                </p>

                <p>{siteConfig.about.paragraphs[1]}</p>

                <p>{siteConfig.about.paragraphs[2]}</p>

                <p>{siteConfig.about.paragraphs[3]}</p>
              </div>

              {/* Icon Formula */}
              <motion.div
                className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                  {/* Product Strategy */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700">
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🎯
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {siteConfig.aboutCopy.copy1}
                    </span>
                  </motion.div>

                  <span className="text-gray-600 dark:text-gray-400 font-bold text-xl">
                    +
                  </span>

                  {/* User Research */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700">
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🔍
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {siteConfig.aboutCopy.copy2}
                    </span>
                  </motion.div>

                  <span className="text-gray-600 dark:text-gray-400 font-bold text-xl">
                    +
                  </span>

                  {/* Data Analysis */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.1, y: -2 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 mb-2 relative rounded-full bg-gray-100 dark:bg-gray-800 p-3 sm:p-4 shadow-lg group-hover:shadow-xl transition-all duration-200 border border-gray-200 dark:border-gray-700">
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        📊
                      </div>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {siteConfig.aboutCopy.copy3}
                    </span>
                  </motion.div>

                  <span className="text-gray-600 dark:text-gray-400 font-bold text-2xl">
                    =
                  </span>

                  {/* Result */}
                  <motion.div
                    className="flex flex-col items-center group"
                    whileHover={{ scale: 1.15, y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 mb-2 relative rounded-full bg-gray-100 dark:bg-gray-800 p-5 sm:p-6 shadow-xl group-hover:shadow-2xl transition-all duration-200 border border-gray-200 dark:border-gray-700">
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🚀
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-400 whitespace-nowrap">
                      {siteConfig.title}
                    </span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* What I Bring and Core Values */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Key Facts */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 shadow-xl">
                <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
                  What I Bring
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white">
                        <span className="text-black dark:text-white">
                          {siteConfig.aboutCopy.copy4}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Hands-on experience with{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {siteConfig.aboutCopy.copy5}
                        </span>
                        ,{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {siteConfig.aboutCopy.copy6}
                        </span>
                        , and
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {' '}
                          AI integrations
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white">
                        <span className="text-black dark:text-white">
                          {siteConfig.aboutCopy.copy7}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        From{' '}
                        <span className="font-medium">
                          {siteConfig.aboutCopy.copy8}
                        </span>{' '}
                        to{' '}
                        <span className="font-medium">
                          {siteConfig.aboutCopy.copy9}
                        </span>
                        , driving{' '}
                        <span className="font-bold text-gray-600 dark:text-gray-400">
                          20%+ adoption improvements
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-black dark:text-white">
                        <span className="text-black dark:text-white">
                          {siteConfig.aboutCopy.copy10}
                        </span>
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Leading{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {siteConfig.aboutCopy.copy11}
                        </span>
                        , managing{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {siteConfig.aboutCopy.copy12}
                        </span>
                        , and driving{' '}
                        <span className="font-medium text-gray-600 dark:text-gray-400">
                          {siteConfig.aboutCopy.copy13}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Values */}
            <motion.div variants={itemVariants}>
              <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 shadow-xl">
                <h3 className="mb-6 text-2xl font-bold text-black dark:text-white">
                  Core Values
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🎯</div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      {siteConfig.aboutCopy.copy14}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🚀</div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      {siteConfig.aboutCopy.copy15}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">📊</div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      {siteConfig.aboutCopy.copy16}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="mb-2 text-2xl">🤝</div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      {siteConfig.aboutCopy.copy17}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Beyond the Resume - Full Width */}
          <motion.div variants={itemVariants}>
            <div className="rounded-2xl bg-gray-50 dark:bg-gray-900 p-8 shadow-xl">
              <h3 className="mb-6 text-2xl font-bold text-black dark:text-white text-center">
                {siteConfig.aboutCopy.copy18}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-4xl mx-auto text-center leading-relaxed">
                {siteConfig.about.paragraphs[3]}
              </p>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div variants={itemVariants} className="mt-16 text-center">
          <p className="mb-6 text-lg text-gray-600 dark:text-gray-300">
            {siteConfig.aboutCopy.copy24}
          </p>
          <motion.button
            onClick={() => {
              const skillsSection = document.getElementById('skills');
              if (skillsSection) {
                const elementPosition =
                  skillsSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 120;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl bg-black dark:bg-white text-white dark:text-black px-8 py-4 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            {siteConfig.aboutCopy.copy25}
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
