'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, AlertCircle, Moon, Sun } from 'lucide-react';
import { ThemeProvider, useTheme } from '../providers/ThemeProvider';

interface NavigationProps {
  sections?: Array<{ id: string; label: string; href: string }>;
  tourActive?: boolean;
}

const defaultSections = [
  { id: 'hero', label: 'Home', href: '#hero' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'skills', label: 'Skills', href: '#skills' },
  { id: 'timeline', label: 'Timeline', href: '#timeline' },
  { id: 'projects', label: 'Projects', href: '#projects' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export function ModernNavigation({
  sections = defaultSections,
  tourActive = false,
}: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);

      // Update active section based on scroll position with improved logic
      const sectionElements = sections.map((section) => ({
        id: section.id,
        element: document.getElementById(section.id),
      }));

      // Find the section that's currently most visible in the viewport
      let currentSection = 'hero'; // default
      let maxVisibility = 0;

      sectionElements.forEach(({ id, element }) => {
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;

          // Calculate how much of the section is visible
          const visibleTop = Math.max(
            0,
            Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
          );
          const visibilityRatio =
            visibleTop / Math.min(rect.height, viewportHeight);

          // Consider a section active if it's significantly visible or if we're near its top
          if (rect.top <= 150 && rect.bottom >= 150) {
            if (visibilityRatio > maxVisibility) {
              maxVisibility = visibilityRatio;
              currentSection = id;
            }
          }
        }
      });

      setActiveSection(currentSection);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const scrollToSection = (href: string) => {
    const targetId = href.replace('#', '');
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      // Calculate the position with offset for fixed header and to show the title
      const elementPosition = targetElement.getBoundingClientRect().top;
      // Use larger offset for Projects section to ensure proper visibility
      const offset = targetId === 'projects' ? 140 : 120;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }

    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={tourActive ? false : { y: -100 }}
      animate={tourActive ? false : { y: 0 }}
      transition={tourActive ? {} : { duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-black/90 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Alert */}
          <motion.div
            initial={tourActive ? false : { opacity: 0, x: -20 }}
            animate={tourActive ? false : { opacity: 1, x: 0 }}
            transition={tourActive ? {} : { delay: 0.2 }}
            className="flex flex-col items-start"
          >
            <button
              onClick={() => scrollToSection('#hero')}
              className="text-xl font-bold text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 transition-colors duration-200"
            >
              {siteConfig.name}
              <span className="text-gray-700 dark:text-gray-400">.</span>
            </button>

            {/* Job Alert Below Name */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-1"
            >
              <button
                className="flex items-center space-x-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 px-1.5 py-0.5 text-white shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform duration-200 text-[10px]"
                onClick={() => {
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
              >
                <div>
                  <AlertCircle className="h-2 w-2" />
                </div>
                <span className="font-semibold whitespace-nowrap">
                  Open to PM roles!
                </span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Side - Desktop Navigation, Theme Toggle, and Mobile Menu */}
          <div className="flex items-center space-x-2">
            {/* Desktop Navigation - Compact horizontal layout */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:flex items-center space-x-1"
            >
              {sections.map((section, index) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  onClick={() => scrollToSection(section.href)}
                  className={`relative px-2 py-1 text-xs font-medium transition-colors duration-200 rounded-md ${
                    activeSection === section.id
                      ? 'text-gray-700 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30'
                      : 'text-gray-700 dark:text-gray-300 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  {section.label}
                </motion.button>
              ))}
            </motion.div>

            {/* Theme Toggle */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-gray-700 lg:hidden"
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {isMobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden lg:hidden"
            >
              <div className="space-y-2 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 px-4 py-6 rounded-b-2xl shadow-lg">
                {/* Mobile Job Alert */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-4 flex justify-center"
                >
                  <button
                    className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 px-3 py-2 text-white shadow-md backdrop-blur-md cursor-pointer hover:scale-105 transition-transform duration-200 text-sm"
                    onClick={() => {
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
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div>
                      <AlertCircle className="h-2.5 w-2.5" />
                    </div>
                    <span className="font-semibold whitespace-nowrap">
                      Open to AI PM/APM roles!
                    </span>
                  </button>
                </motion.div>

                {sections.map((section, index) => (
                  <motion.button
                    key={section.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => scrollToSection(section.href)}
                    className={`block w-full text-left px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      activeSection === section.id
                        ? 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {section.label}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
