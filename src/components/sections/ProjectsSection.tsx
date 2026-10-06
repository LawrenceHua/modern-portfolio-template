'use client';
import { siteConfig } from '@/config/site';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github, Star, Award } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  image: string;
  tags: string[];
  link: string;
  linkText: string;
  linkIcon: 'external' | 'github';
  featured?: boolean;
  achievements?: string[];
}

const projectsData = siteConfig.projectsData;

const getDynamicCategories = () => {
  const featuredProjects = projectsData.all.filter((p) => p.featured);
  const regularProjects = projectsData.all.filter((p) => !p.featured);

  const aiCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        [
          'AI',
          'AI/ML',
          'Machine Learning',
          'ML Pipeline',
          'LLM',
          'Computer Vision',
        ].includes(tag)
      )
    ).length;

  const productCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        ['Product Management', 'A/B Testing', 'Strategy', 'UI/UX'].includes(tag)
      )
    ).length;

  const engineeringCount =
    featuredProjects.length +
    regularProjects.filter((p) =>
      p.tags.some((tag) =>
        [
          'Android',
          'Next.js',
          'React',
          'Database',
          'REST API',
          'Python',
          'TypeScript',
        ].includes(tag)
      )
    ).length;

  return [
    { key: 'all', label: 'All Projects', count: projectsData.all.length },
    { key: 'product', label: 'Product', count: productCount },
    { key: 'ai', label: 'AI/ML', count: aiCount },
    { key: 'engineering', label: 'Engineering', count: engineeringCount },
  ];
};

export function ProjectsSection() {
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

  const [activeCategory, setActiveCategory] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(
    new Set()
  );

  const categories = getDynamicCategories();

  const getFilteredProjects = () => {
    const featuredProjects = projectsData.all.filter((p) => p.featured);
    const regularProjects = projectsData.all.filter((p) => !p.featured);

    let filteredRegular = regularProjects;

    if (activeCategory === 'ai') {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          [
            'AI',
            'AI/ML',
            'Machine Learning',
            'ML Pipeline',
            'LLM',
            'Computer Vision',
          ].includes(tag)
        )
      );
    } else if (activeCategory === 'product') {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          ['Product Management', 'A/B Testing', 'Strategy', 'UI/UX'].includes(
            tag
          )
        )
      );
    } else if (activeCategory === 'engineering') {
      filteredRegular = regularProjects.filter((p) =>
        p.tags.some((tag) =>
          [
            'Android',
            'Next.js',
            'React',
            'Database',
            'REST API',
            'Python',
            'TypeScript',
          ].includes(tag)
        )
      );
    }

    // Always include featured projects at the beginning, unfiltered
    return [...featuredProjects, ...filteredRegular];
  };

  const allProjectsForDisplay = getFilteredProjects();
  const featuredProjects = projectsData.all.filter((p) => p.featured);

  const projectsToShow = showAll
    ? allProjectsForDisplay
    : allProjectsForDisplay.slice(0, 4);

  const remainingCount = allProjectsForDisplay.length - projectsToShow.length;

  const containerVariants = {
    hidden: { opacity: isMobile ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0 : 0.1,
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

  const cardVariants = {
    hidden: { opacity: isMobile ? 1 : 0, scale: isMobile ? 1 : 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: isMobile ? 0 : 0.4,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section
      id="projects"
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
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-gray-400 fill-current" />
            <h2 className="text-4xl font-bold text-black dark:text-white sm:text-5xl">
              Featured{' '}
              <span className="bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
                Projects
              </span>
            </h2>
            <Star className="h-8 w-8 text-gray-400 fill-current" />
          </div>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Spotlight on my two favorite projects that showcase{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              innovation
            </span>
            ,
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {' '}
              product leadership
            </span>
            , and{' '}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              real-world impact
            </span>
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full" />
        </motion.div>

        {/* Featured Projects Grid */}
        {featuredProjects.length > 0 && (
          <motion.div variants={containerVariants} className="mb-20">
            <div className="grid gap-8 lg:grid-cols-2">
              {featuredProjects.map((project, index) => {
                const projectId = `project-${project.title
                  .toLowerCase()
                  .split(' ')[0]
                  .replace(/[^a-z0-9-]/g, '')}`;
                return (
                  <motion.div
                    key={project.title}
                    id={`project-featured-${index}`}
                    variants={cardVariants}
                    className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-black shadow-2xl transition-all duration-500 hover:shadow-3xl hover:shadow-gray-500/10 hover:-translate-y-3"
                  >
                    {/* Featured Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className="flex items-center space-x-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                        <Award className="h-3 w-3" />
                        <span>FEATURED</span>
                      </div>
                    </div>

                    {/* Project Image */}
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {/* Overlay Link */}
                      <Link
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <div className="flex items-center space-x-2 rounded-full bg-white/90 dark:bg-black/90 px-6 py-3 text-sm font-bold text-black dark:text-white backdrop-blur-sm shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {project.linkIcon === 'github' ? (
                            <Github className="h-5 w-5" />
                          ) : (
                            <ExternalLink className="h-5 w-5" />
                          )}
                          <span>{project.linkText}</span>
                        </div>
                      </Link>
                    </div>

                    {/* Project Content */}
                    <div className="p-8">
                      <h3 className="mb-4 text-2xl font-bold text-black dark:text-white group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                        {project.title}
                      </h3>

                      <p
                        className={`mb-6 text-gray-600 dark:text-gray-300 leading-relaxed ${expandedDescriptions.has(project.title) ? 'whitespace-normal' : 'line-clamp-3'}`}
                        onClick={() => {
                          setExpandedDescriptions((prev) => {
                            const next = new Set(prev);
                            if (next.has(project.title)) {
                              next.delete(project.title);
                            } else {
                              next.add(project.title);
                            }
                            return next;
                          });
                        }}
                      >
                        {project.description}
                      </p>

                      {/* Key Achievements */}
                      {project.achievements && (
                        <div className="mb-6">
                          <h4 className="mb-3 text-sm font-semibold text-black dark:text-white uppercase tracking-wide">
                            Key Achievements
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {project.achievements.map((achievement, idx) => (
                              <div
                                key={idx}
                                className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                                <span>{achievement}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      <div className="mb-6 flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-gray-100 dark:bg-gray-900/20 px-3 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Project Link */}
                      <Link
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 px-6 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/25 hover:scale-105"
                      >
                        <span>{project.linkText}</span>
                        {project.linkIcon === 'github' ? (
                          <Github className="h-4 w-4" />
                        ) : (
                          <ExternalLink className="h-4 w-4" />
                        )}
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* All Projects Grid */}
        {allProjectsForDisplay.length > featuredProjects.length && (
          <motion.div variants={itemVariants} className="mb-16">
            <h3
              id="all-projects-title"
              className="text-2xl font-bold text-black dark:text-white mb-8 text-center"
            >
              All Projects
            </h3>
            <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300 text-center mb-8">
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                Solutions
              </span>{' '}
              and{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                product innovations
              </span>{' '}
              spanning{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                machine learning
              </span>
              ,{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                enterprise tools
              </span>
              , and{' '}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                scalable platforms
              </span>
            </p>

            {/* Filter Controls */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <motion.button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border backdrop-blur-sm ${
                    activeCategory === category.key
                      ? 'bg-gray-600/20 border-gray-500/80 text-gray-600 dark:text-gray-400 shadow-lg shadow-gray-500/20'
                      : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {category.label} ({category.count})
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects Grid */}
        <motion.div
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {projectsToShow.map((project, index) => (
            <motion.div
              key={project.title}
              variants={cardVariants}
              layout
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/10 hover:-translate-y-2"
            >
              {/* Project Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Project Link Overlay */}
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="flex items-center space-x-2 rounded-full bg-white/90 dark:bg-gray-900/90 px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 backdrop-blur-sm">
                    {project.linkIcon === 'github' ? (
                      <Github className="h-4 w-4" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    <span>{project.linkText}</span>
                  </div>
                </Link>
              </div>

              {/* Project Content */}
              <div className="p-6">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-gray-100 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {project.title}
                </h3>
                <p
                  className={`mb-4 text-sm text-gray-600 dark:text-gray-300 transition-all cursor-pointer ${expandedDescriptions.has(project.title) ? 'whitespace-normal' : 'line-clamp-3'}`}
                  onClick={() => {
                    setExpandedDescriptions((prev) => {
                      const next = new Set(prev);
                      if (next.has(project.title)) {
                        next.delete(project.title);
                      } else {
                        next.add(project.title);
                      }
                      return next;
                    });
                  }}
                >
                  {project.description}
                </p>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-1">
                  {project.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 dark:bg-gray-900/20 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {project.tags.length > 3 && (
                    <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                      +{project.tags.length - 3}
                    </span>
                  )}
                </div>

                {/* Project Link */}
                <Link
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <span>{project.linkText}</span>
                  {project.linkIcon === 'github' ? (
                    <Github className="h-4 w-4" />
                  ) : (
                    <ExternalLink className="h-4 w-4" />
                  )}
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Show More Button */}
        {!showAll && remainingCount > 0 && (
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/25"
            >
              Show {remainingCount} More Project
              {remainingCount !== 1 ? 's' : ''}
            </motion.button>
          </motion.div>
        )}

        {/* Show Less Button */}
        {showAll && allProjectsForDisplay.length > 4 && (
          <motion.div variants={itemVariants} className="mt-12 text-center">
            <motion.button
              onClick={() => setShowAll(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-4 text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-gray-500/25"
            >
              Show {allProjectsForDisplay.length - 4} Less Project
              {allProjectsForDisplay.length - 4 !== 1 ? 's' : ''}
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
