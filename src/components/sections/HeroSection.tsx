'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FiFileText, FiMessageCircle, FiArrowDown } from 'react-icons/fi';
import { FaLinkedin } from 'react-icons/fa';

// 🎯 CUSTOMIZATION: Update your personal information here
// Change the profile image, name, title, and description

interface HeroSectionProps {
  onStartTour?: () => void;
  tourActive?: boolean;
  showCats?: boolean;
  onCatsToggle?: (show: boolean) => void;
  trackButtonClick?: (buttonType: string, buttonText: string) => void;
}

export function HeroSection({
  onStartTour,
  tourActive = false,
  showCats = false,
  onCatsToggle,
  trackButtonClick,
}: HeroSectionProps = {}) {
  const prefersReducedMotion = useReducedMotion();
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

  // Default text gallery with mobile-friendly versions
  const textGallery = siteConfig.hero.specialties.map((text) => ({
    text,
    mobileText: text,
    gradient: 'from-white via-gray-300 to-gray-500',
  }));

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!prefersReducedMotion && !tourActive) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % textGallery.length);
      }, 3000); // Slower for better mobile experience

      return () => clearInterval(interval);
    }
  }, [textGallery.length, prefersReducedMotion, tourActive]);

  // Simplified animations for mobile - instant on mobile, normal on desktop
  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.2,
        duration: isMobile ? 0 : 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: isMobile ? 1 : 0, y: isMobile ? 0 : 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: 'easeOut',
      },
    },
  };

  const pulseVariants = {
    animate:
      prefersReducedMotion || isMobile
        ? {}
        : {
            scale: [1, 1.05, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
          },
  };

  const textVariants = {
    initial: {
      opacity: isMobile ? 1 : 0,
      y: isMobile ? 0 : 20,
      scale: 1,
      filter: 'blur(0px)',
    },
    animate: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: isMobile ? 0 : 0.6,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: isMobile ? 1 : 0,
      y: isMobile ? 0 : -20,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: isMobile ? 0 : 0.4,
        ease: 'easeIn',
      },
    },
  };

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black"
    >
      {/* Simplified Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-white/5 to-gray-500/5 blur-2xl" />

        {/* Static Background Elements - No animations for performance */}
        {!isMobile && !prefersReducedMotion && (
          <>
            <div
              className={`absolute top-1/4 right-1/4 h-40 w-40 rounded-full bg-gradient-to-r ${textGallery[currentIndex].gradient} blur-3xl opacity-10`}
            />
            <div
              className={`absolute bottom-1/3 left-1/3 h-32 w-32 rounded-full bg-gradient-to-r ${textGallery[currentIndex].gradient} blur-2xl opacity-5`}
            />
          </>
        )}
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 text-center"
      >
        {/* Profile Image with Cat Easter Egg */}
        <motion.div
          variants={itemVariants}
          className="mb-6 sm:mb-8 flex justify-center relative"
        >
          {/* Tuxedo Cat - Left Side */}
          <AnimatePresence>
            {showCats && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: -20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{ opacity: 0, scale: 0, x: -20 }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 sm:-translate-x-20 md:-translate-x-24 lg:-translate-x-28 z-10"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                  <Image
                    src="/images/icons/tuxedo-cat.svg"
                    alt="Tuxedo Cat"
                    width={112}
                    height={112}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clickable Profile Picture */}
          <motion.div
            variants={pulseVariants}
            animate="animate"
            className="relative h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-48 lg:w-48 overflow-hidden rounded-full border-4 border-white/50 bg-white shadow-2xl shadow-white/25 cursor-pointer group"
            onClick={() => onCatsToggle?.(!showCats)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Image
              src={siteConfig.images.profile}
              alt={siteConfig.name}
              fill
              className="object-cover transition-all duration-300 group-hover:brightness-110"
              priority
            />
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 to-transparent" />

            {/* Subtle hint overlay */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-t from-gray-300/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </motion.div>

          {/* Grey Cat - Right Side */}
          <AnimatePresence>
            {showCats && (
              <motion.div
                initial={{ opacity: 0, scale: 0, x: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{ opacity: 0, scale: 0, x: 20 }}
                transition={{
                  duration: 0.8,
                  ease: 'easeOut',
                  delay: 0.2,
                }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 sm:translate-x-20 md:translate-x-24 lg:translate-x-28 z-10"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28">
                  <Image
                    src="/images/icons/grey-cat.svg"
                    alt="Grey Cat"
                    width={112}
                    height={112}
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Name and Title */}
        <motion.div variants={itemVariants} className="mb-4 sm:mb-6 relative">
          <h1
            className="mb-2 sm:mb-4 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => onCatsToggle?.(!showCats)}
          >
            {siteConfig.name.split(' ')[0]}{' '}
            <span className="bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
              {siteConfig.name.split(' ').slice(1).join(' ')}
            </span>
          </h1>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium text-gray-200">
            {siteConfig.title}
          </div>
        </motion.div>

        {/* Enhanced Dynamic Value Proposition */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-12 text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 leading-relaxed"
        >
          <div className="flex flex-col items-center space-y-3 sm:space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center px-2"
            >
              {siteConfig.hero.description}
            </motion.div>

            {/* Dynamic Animated Text Gallery */}
            <div className="relative h-12 sm:h-16 md:h-20 lg:h-24 flex items-center justify-center w-full max-w-4xl px-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  variants={textVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span
                    className={`font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl bg-gradient-to-r ${textGallery[currentIndex].gradient} bg-clip-text text-transparent text-center leading-tight`}
                    style={{
                      wordBreak: 'break-word',
                      hyphens: 'auto',
                    }}
                  >
                    {isMobile
                      ? textGallery[currentIndex].mobileText
                      : textGallery[currentIndex].text}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Simple Underline - Desktop only */}
              {!isMobile && !prefersReducedMotion && (
                <div
                  className={`absolute bottom-0 h-1 bg-gradient-to-r ${textGallery[currentIndex].gradient} rounded-full max-w-sm mx-auto transition-all duration-300`}
                />
              )}
            </div>
          </div>
        </motion.div>

        {/* Key Highlights */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-14 flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 px-2"
        >
          <button
            onClick={() => {
              const timelineSection = document.getElementById('timeline');
              timelineSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-white" />
            <span className="whitespace-nowrap">
              {siteConfig.hero.highlights[0]}
            </span>
          </button>
          <button
            onClick={() => {
              const timelineSection = document.getElementById('timeline');
              timelineSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gray-300" />
            <span className="whitespace-nowrap">
              Product Management Experience
            </span>
          </button>
          <Link
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 sm:space-x-2 rounded-full bg-white/5 px-2 sm:px-4 py-1 sm:py-2 backdrop-blur-sm hover:bg-white/10 transition-all duration-200 hover:scale-105"
          >
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-gray-500" />
            <span className="whitespace-nowrap">Product Leader</span>
          </Link>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="mb-8 sm:mb-14 flex flex-col gap-3 sm:gap-4 md:flex-row md:justify-center px-4"
        >
          <Link
            href={siteConfig.links.resume}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-white to-gray-300 px-6 sm:px-8 py-3 sm:py-4 text-black font-semibold transition-all duration-300 hover:from-gray-200 hover:to-gray-400 hover:scale-105 hover:shadow-lg hover:shadow-white/25"
            onClick={() =>
              trackButtonClick?.('download_resume', 'Download Resume')
            }
          >
            <FiFileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            Download Resume
          </Link>

          <motion.button
            onClick={() => {
              trackButtonClick?.('start_tour', 'Take Product Tour');
              onStartTour?.();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-white to-gray-300 px-6 sm:px-8 py-3 sm:py-4 text-black font-semibold transition-all duration-300 hover:from-gray-200 hover:to-gray-400 hover:scale-105 hover:shadow-lg hover:shadow-white/25"
          >
            <span className="mr-2 text-lg">🎯</span>
            Take Product Tour
          </motion.button>

          <Link
            href={siteConfig.links.linkedin}
            target="_blank"
            className="group flex items-center justify-center rounded-lg bg-gradient-to-r from-[#0077B5] to-[#006399] px-6 sm:px-8 py-3 sm:py-4 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
            onClick={() => trackButtonClick?.('linkedin_profile', 'LinkedIn')}
          >
            <FaLinkedin className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:scale-110" />
            LinkedIn
          </Link>
        </motion.div>

        {/* Main CTA */}
        <motion.div variants={itemVariants} className="mb-8 relative px-4">
          <motion.button
            onClick={() => {
              trackButtonClick?.('lets_connect', "Let's Connect!");
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                const elementPosition =
                  contactSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 120;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
            whileHover={!isMobile ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
            className="w-full max-w-lg rounded-xl bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg lg:text-xl font-bold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-gray-500/25"
          >
            Looking for {siteConfig.title}?
            <br />
            Let's Connect!
          </motion.button>
        </motion.div>

        {/* Left Side Scroll Indicator - Desktop only */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
            className="absolute -left-16 top-1/2 -translate-y-1/2 -translate-x-8 flex flex-col items-center space-y-4 z-20 md:-left-12 md:-translate-x-6 hidden lg:flex"
          >
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="flex flex-col items-center space-y-3"
            >
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
              <button
                onClick={() => {
                  const aboutSection = document.getElementById('about');
                  if (aboutSection) {
                    const elementPosition =
                      aboutSection.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - 120;
                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth',
                    });
                  }
                }}
                className="group flex flex-col items-center justify-center space-y-2 text-slate-400 hover:text-blue-400 transition-all duration-300 cursor-pointer hover:scale-105"
              >
                <div className="transform -rotate-90 whitespace-nowrap text-xs font-medium tracking-wider uppercase flex items-center justify-center group-hover:text-blue-300 transition-colors duration-300">
                  Explore
                </div>
                <div className="w-px h-8 bg-gradient-to-b from-blue-400 to-transparent group-hover:from-blue-300 group-hover:shadow-sm group-hover:shadow-blue-400/50 transition-all duration-300 mx-auto"></div>
                <div className="flex items-center justify-center">
                  <FiArrowDown className="h-4 w-4 group-hover:translate-y-1 transition-transform duration-300" />
                </div>
              </button>
              <div className="w-px h-16 bg-gradient-to-b from-transparent via-blue-400 to-transparent"></div>
            </motion.div>
          </motion.div>
        )}

        {/* Main Scroll Indicator - Mobile */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-center lg:hidden w-full"
        >
          <button
            onClick={() => {
              const aboutSection = document.getElementById('about');
              if (aboutSection) {
                const elementPosition =
                  aboutSection.getBoundingClientRect().top;
                const offsetPosition =
                  elementPosition + window.pageYOffset - 120;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
            className="mb-3 text-sm text-slate-400 hover:text-blue-400 transition-all duration-300 cursor-pointer text-center font-medium hover:scale-105"
          >
            Explore my work
          </button>
          <motion.div
            animate={
              !prefersReducedMotion
                ? {
                    y: [0, 10, 0],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="flex items-center justify-center w-full"
          >
            <button
              onClick={() => {
                const aboutSection = document.getElementById('about');
                if (aboutSection) {
                  const elementPosition =
                    aboutSection.getBoundingClientRect().top;
                  const offsetPosition =
                    elementPosition + window.pageYOffset - 120;
                  window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                  });
                }
              }}
              className="flex items-center justify-center"
            >
              <FiArrowDown className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400 hover:text-blue-300 transition-colors duration-200" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
