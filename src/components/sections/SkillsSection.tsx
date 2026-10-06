'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const skillsData = siteConfig.skillsData;

const categories = [
  { key: 'all', label: 'All Skills', color: 'gray' },
  { key: 'business', label: 'Product & Business', color: 'gray' },
  { key: 'data', label: 'Data & Analytics', color: 'gray' },
  { key: 'engineering', label: 'Engineering', color: 'gray' },
  { key: 'design', label: 'Design & UX', color: 'gray' },
];

const levels = [
  { key: 'all', label: 'All Levels', color: 'gray' },
  { key: 'expert', label: 'Expert', color: 'gray' },
  { key: 'proficient', label: 'Proficient', color: 'gray' },
  { key: 'familiar', label: 'Familiar', color: 'gray' },
];

export function SkillsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
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

  const [activeCategory, setActiveCategory] = useState('all');
  const [activeLevel, setActiveLevel] = useState('all');
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const filteredSkills = React.useMemo(() => {
    let skills = Object.values(skillsData).flat();

    if (activeCategory !== 'all') {
      skills = skills.filter((skill) => skill.category === activeCategory);
    }

    if (activeLevel !== 'all') {
      skills = skills.filter((skill) => skill.level === activeLevel);
    }

    return skills;
  }, [activeCategory, activeLevel]);

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0, // Set stagger to 0 to make them appear at once
        duration: isMobile ? 0 : 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: isMobile ? 1 : 0,
      y: isMobile ? 0 : prefersReducedMotion ? 15 : 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: isMobile ? 0 : prefersReducedMotion ? 0.3 : 0.6,
        ease: 'easeOut',
      },
    },
  };

  const skillVariants = {
    hidden: {
      opacity: isMobile ? 1 : 0,
      scale: isMobile ? 1 : prefersReducedMotion ? 1 : 0.8,
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0 : prefersReducedMotion ? 0.2 : 0.4,
        ease: 'easeOut',
      },
    },
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'proficient':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'familiar':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelFilterColor = (level: string, isActive: boolean) => {
    if (isActive) {
      switch (level) {
        case 'expert':
          return 'bg-gray-600/20 border-gray-500/80 text-gray-600 dark:text-gray-400 shadow-lg shadow-gray-500/20';
        case 'proficient':
          return 'bg-gray-600/20 border-gray-500/80 text-gray-600 dark:text-gray-400 shadow-lg shadow-gray-500/20';
        case 'familiar':
          return 'bg-gray-600/20 border-gray-500/80 text-gray-600 dark:text-gray-400 shadow-lg shadow-gray-500/20';
        default:
          return 'bg-gray-600/20 border-gray-500/80 text-gray-600 dark:text-gray-400 shadow-lg shadow-gray-500/20';
      }
    }
    return 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50';
  };

  return (
    <section
      id="skills"
      ref={ref}
      className="relative py-20 bg-white dark:bg-black overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-gray-200/10 blur-3xl" />
        <div className="absolute bottom-20 right-20 h-64 w-64 rounded-full bg-gray-400/10 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-black dark:text-white sm:text-5xl">
            Skills
            <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
              Section
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            A summary of your skills and expertise.
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" />
        </motion.div>

        {/* Filters */}
        <motion.div
          variants={itemVariants}
          className="mb-12 flex flex-col items-center gap-6"
        >
          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 rounded-full bg-white/50 dark:bg-slate-800/50 p-2 shadow-inner-lg backdrop-blur-sm">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === category.key
                    ? 'bg-white dark:bg-gray-700 text-gray-600 dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
          {/* Level Filters */}
          <div className="flex flex-wrap justify-center gap-3">
            {levels.map((level) => (
              <button
                key={level.key}
                onClick={() => setActiveLevel(level.key)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${getLevelFilterColor(
                  level.key,
                  activeLevel === level.key
                )}`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Skills Cloud */}
        <motion.div
          variants={containerVariants}
          className="relative w-full max-w-none mx-auto"
        >
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-4">
            {filteredSkills.map((skill, index) => {
              // Create organic cloud positioning with varied sizes - SMALLER SIZES
              const sizes = [
                'text-xs px-2 py-1',
                'text-xs px-2 py-1.5',
                'text-sm px-3 py-1.5',
                'text-sm px-3 py-2',
              ];
              const sizeIndex =
                skill.level === 'expert'
                  ? 3
                  : skill.level === 'proficient'
                    ? 2
                    : 1;
              const skillSize = sizes[sizeIndex] || sizes[1];

              return (
                <motion.div
                  key={skill.name}
                  id={`skill-${skill.name.toLowerCase().replace(/ /g, '-').replace(/\//g, '-')}`}
                  variants={skillVariants}
                  layout
                  onHoverStart={() => !isMobile && setHoveredSkill(skill.name)}
                  onHoverEnd={() => !isMobile && setHoveredSkill(null)}
                  onMouseMove={(e) => {
                    if (!isMobile) {
                      setMousePosition({ x: e.clientX, y: e.clientY });
                    }
                  }}
                  onClick={() => {
                    if (isMobile) {
                      // On mobile, click toggles tooltip
                      setHoveredSkill(
                        hoveredSkill === skill.name ? null : skill.name
                      );
                      setMousePosition({
                        x: window.innerWidth / 2,
                        y: window.innerHeight / 2,
                      });
                    }
                  }}
                  className="group relative"
                  style={
                    !isMobile && !prefersReducedMotion
                      ? {
                          // Add slight random positioning for cloud effect - desktop only
                          transform: `rotate(${Math.sin(index * 1.3) * 3}deg)`,
                        }
                      : {}
                  }
                >
                  {/* (typeof skillsData)[string][number] Bubble */}
                  <div
                    className={`relative overflow-hidden rounded-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer border-2 ${skillSize} ${
                      skill.level === 'expert'
                        ? 'border-gray-400 hover:border-gray-500'
                        : skill.level === 'proficient'
                          ? 'border-gray-400 hover:border-gray-500'
                          : 'border-gray-400 hover:border-gray-500'
                    } ${
                      !isMobile && !prefersReducedMotion
                        ? 'hover:shadow-xl hover:-translate-y-2 hover:scale-110 hover:shadow-gray-500/20'
                        : 'hover:shadow-lg'
                    }`}
                  >
                    {/* (typeof skillsData)[string][number] Content */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-base">{skill.icon}</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
                        {skill.name}
                      </span>
                    </div>
                  </div>

                  {/* Enhanced Hover Tooltip - Smart Positioned Outside */}
                  {hoveredSkill === skill.name && (
                    <div
                      className={`fixed bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl text-sm shadow-2xl border border-gray-200 dark:border-gray-600 max-w-xs sm:max-w-sm ${
                        isMobile ? 'inset-x-4 top-20' : ''
                      }`}
                      style={
                        isMobile
                          ? {
                              pointerEvents: 'auto',
                              zIndex: 999999,
                            }
                          : {
                              left: mousePosition.x,
                              bottom: window.innerHeight - mousePosition.y,
                              transform: `translate(${
                                mousePosition.x > window.innerWidth / 2
                                  ? '-100%'
                                  : '0%'
                              }, 0%)`,
                              pointerEvents: 'none',
                              zIndex: 999999,
                            }
                      }
                    >
                      {/* Mobile close button */}
                      {isMobile && (
                        <button
                          onClick={() => setHoveredSkill(null)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          ✕
                        </button>
                      )}

                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center space-x-3 border-b border-gray-200 dark:border-gray-600 pb-2">
                          <span className="text-2xl">{skill.icon}</span>
                          <div>
                            <div className="font-bold text-lg">
                              {skill.name}
                            </div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full inline-block ${getLevelBadgeColor(
                                skill.level
                              )}`}
                            >
                              {skill.level.toUpperCase()} • {skill.experience} •{' '}
                              {skill.projects}+ projects
                            </div>
                          </div>
                        </div>

                        {/* Achievement */}
                        <div>
                          <div className="font-semibold text-sm mb-1 text-gray-600 dark:text-gray-400">
                            🏆 Key Achievement:
                          </div>
                          <div className="text-sm leading-relaxed">
                            {skill.achievement}
                          </div>
                        </div>

                        {/* Endorsements */}
                        <div>
                          <div className="font-semibold text-sm mb-2 text-gray-600 dark:text-gray-400">
                            ✨ Endorsed by:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {skill.endorsements
                              .slice(0, 3)
                              .map((endorsement, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full"
                                >
                                  {endorsement}
                                </span>
                              ))}
                            {skill.endorsements.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{skill.endorsements.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Arrow pointing to skill */}
                      <div
                        className={`absolute w-0 h-0 border-l-4 border-r-4 border-transparent ${
                          mousePosition.y > window.innerHeight - 200
                            ? '-top-2 border-b-4 border-b-white dark:border-b-slate-800'
                            : '-bottom-2 border-t-4 border-t-white dark:border-t-slate-800'
                        } ${
                          mousePosition.x > window.innerWidth / 2
                            ? 'right-4'
                            : 'left-4'
                        }`}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom anchor for tour targeting */}
      <div id="skills-bottom" className="h-1 w-full" />
    </section>
  );
}
