'use client';
import { trackButtonClick } from '@/lib/analytics';
import { siteConfig } from '@/config/site';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import DatePicker from 'react-datepicker';
import {
  Mail,
  MessageCircle,
  Calendar,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { FaLinkedin, FaGithub, FaFacebookF } from 'react-icons/fa6';
import 'react-datepicker/dist/react-datepicker.css';
import { format as formatDate, parse as parseDate } from 'date-fns';
import { FiGithub, FiMail } from 'react-icons/fi';

/**
 * Contact form data interface
 */
interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

/**
 * Meeting scheduling data interface
 */
interface MeetingFormData {
  name: string;
  email: string;
  company: string;
  selectedDate: Date | null;
  selectedTime: string;
  message: string;
  meetingType: string;
}

/**
 * Contact section props interface
 */
interface ContactSectionProps {
  /** External form type control */
  externalFormType?: 'none' | 'message' | 'calendar';
  /** Callback for form type changes */
  onFormTypeChange?: (formType: 'none' | 'message' | 'calendar') => void;
  /** Whether tour is active */
  tourActive?: boolean;
}

/**
 * Contact Section Component
 *
 * A comprehensive contact section that provides multiple ways for visitors to get in touch:
 * - Simple message form
 * - Meeting scheduling with calendar integration
 * - Social media links
 * - Contact information display
 *
 * Features:
 * - Form validation and submission handling
 * - Meeting scheduling with date/time picker
 * - Responsive design with animations
 * - Tour integration for guided experience
 * - Version tracking and status updates
 *
 * @param props - ContactSectionProps
 * @returns JSX.Element
 *
 * @example
 * ```tsx
 * <ContactSection
 *   externalFormType="message"
 *   onFormTypeChange={(type) => console.log(type)}
 *   tourActive={true}
 * />
 * ```
 */
export function ContactSection({
  externalFormType,
  onFormTypeChange,
  tourActive = false,
}: ContactSectionProps = {}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: '',
  });
  const [meetingData, setMeetingData] = useState({
    name: '',
    email: '',
    company: '',
    selectedDate: null as Date | null,
    selectedTime: '',
    message: '',
    meetingType: '30min',
  });
  const [submitStatus, setSubmitStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [internalActiveForm, setInternalActiveForm] = useState<
    'none' | 'message' | 'calendar'
  >('message');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Use external form type if provided, otherwise use internal state
  const activeForm = externalFormType ?? internalActiveForm;
  const setActiveForm = onFormTypeChange ?? setInternalActiveForm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, subject: 'Portfolio enquiry' }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', company: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    }

    setTimeout(() => setSubmitStatus('idle'), 5000);
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!siteConfig.features.scheduling) {
      setErrorMessage(
        'Scheduling is not configured. Please use the email link.'
      );
      setSubmitStatus('error');
      return;
    }
    setSubmitStatus('loading');
    setErrorMessage(null);

    // Require both date and time
    if (!meetingData.selectedDate || !meetingData.selectedTime) {
      setErrorMessage('Please select both a date and a time for your meeting.');
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage(null);
      }, 5000);
      return;
    }

    // Clean up time string: remove any trailing timezone abbreviation
    const cleanTime = meetingData.selectedTime
      // Remove timezone abbreviations (EST, EDT, ET) but keep AM/PM
      .replace(/\b(EST|EDT|ET)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Debug: log selected date and cleaned time
    console.log('[DEBUG] selectedDate:', meetingData.selectedDate);
    console.log('[DEBUG] selectedTime:', meetingData.selectedTime);
    console.log('[DEBUG] cleanTime:', cleanTime);

    // Try to parse time in both 24-hour and 12-hour formats
    let meetingDateTime = '';
    let meetingDateISO = '';
    try {
      let dateWithTime: Date | null = null;
      // Try 24-hour format first
      if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
        const [hours, minutes] = cleanTime.split(':');
        dateWithTime = new Date(meetingData.selectedDate);
        dateWithTime.setHours(Number(hours));
        dateWithTime.setMinutes(Number(minutes));
      } else {
        // Try 12-hour format (e.g., "10:00 AM")
        const parsed = parseDate(
          `${formatDate(meetingData.selectedDate, 'MMMM d, yyyy')} ${cleanTime}`,
          'MMMM d, yyyy h:mm a',
          new Date()
        );
        if (!isNaN(parsed.getTime())) {
          dateWithTime = parsed;
        }
      }
      if (!dateWithTime || isNaN(dateWithTime.getTime())) {
        throw new Error('Could not parse date/time');
      }
      meetingDateTime = formatDate(dateWithTime, 'MMMM d, yyyy h:mm a');
      meetingDateISO = dateWithTime.toISOString();
    } catch (err) {
      setErrorMessage('Invalid date or time format. Please try again.');
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus('idle');
        setErrorMessage(null);
      }, 5000);
      return;
    }

    const meetingFormData = {
      requesterName: meetingData.name,
      requesterEmail: meetingData.email,
      company: meetingData.company,
      message: meetingData.message,
      meetingDateTime,
      meetingDateISO,
    };

    // Debug: log the full payload
    console.log('[DEBUG] meetingFormData:', meetingFormData);

    try {
      const response = await fetch('/api/meeting-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(meetingFormData),
      });
      if (response.ok) {
        setSubmitStatus('success');
        setMeetingData({
          name: '',
          email: '',
          company: '',
          selectedDate: null,
          selectedTime: '',
          message: '',
          meetingType: '30min',
        });
      } else {
        const data = await response.json();
        setErrorMessage(data.error || 'An error occurred. Please try again.');
        setSubmitStatus('error');
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      setSubmitStatus('error');
    }
    setTimeout(() => {
      setSubmitStatus('idle');
      setErrorMessage(null);
    }, 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMeetingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setMeetingData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const containerVariants = tourActive
    ? undefined
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
            duration: 0.6,
          },
        },
      };

  const itemVariants = tourActive
    ? undefined
    : {
        hidden: { opacity: 0, y: 30 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.6,
            ease: 'easeOut',
          },
        },
      };

  const socialLinks = {
    github: {
      url: siteConfig.links.github,
      icon: <FiGithub className="h-5 w-5" />,
      label: 'GitHub',
      color: '#333',
      description: 'View my GitHub repositories',
      title: `GitHub: ${siteConfig.links.github}`,
    },
    email: {
      url: `mailto:${siteConfig.email}`,
      icon: <FiMail className="h-5 w-5" />,
      label: 'Email',
      title: `Email: ${siteConfig.email}`,
      color: '#2563eb',
      description: 'Send me an email',
    },
    // Add more social links as needed, each with a color, description, and title property
  };

  const contactMethods = [
    {
      title: 'Send Message',
      description: 'For general inquiries and collaboration opportunities',
      icon: Mail,
      action: 'message',
      buttonText: 'Send Message',
      color: 'from-gray-500 to-gray-600',
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden"
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
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-black dark:text-white sm:text-5xl">
            Let's <span className="text-black dark:text-white">Connect</span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Ready to work together on your next project?
            <br />
            Whether you're looking for a product manager, technical consultant,
            or just want to chat,
            <br />
            <strong className="text-black dark:text-white text-xl font-bold">
              I'd love to hear from you.
            </strong>
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-black dark:bg-white rounded-full" />
        </motion.div>

        {/* Mobile-Optimized Layout */}
        <div className="space-y-12">
          {/* Contact Methods Section */}
          <motion.div variants={itemVariants} className="space-y-8">
            <h3 className="text-2xl font-bold text-black dark:text-white">
              Get In Touch
            </h3>

            {/* Quick Contact Methods - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactMethods.map((method) => {
                const isActive = activeForm === method.action;
                return (
                  <motion.div
                    key={method.title}
                    whileHover={{ scale: 1.02 }}
                    className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
                      isActive
                        ? 'bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
                        : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      if (
                        method.action === 'message' ||
                        method.action === 'calendar'
                      ) {
                        setActiveForm(method.action as 'message' | 'calendar');
                      }
                    }}
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          rotate: isActive ? 5 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl bg-gradient-to-r ${method.color} p-4 text-white shadow-lg`}
                      >
                        <method.icon className="h-8 w-8" />
                      </motion.div>
                      <div className="flex-1">
                        <h4
                          className={`text-lg font-semibold mb-2 transition-colors duration-200 ${
                            isActive
                              ? 'text-black dark:text-white'
                              : 'text-black dark:text-white'
                          }`}
                        >
                          {method.title}
                        </h4>
                        <p
                          className={`text-sm mb-4 transition-colors duration-200 ${
                            isActive
                              ? 'text-gray-600 dark:text-gray-300'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {method.description}
                        </p>
                        {method.action === 'message' ||
                        method.action === 'calendar' ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async (e) => {
                              e.stopPropagation();
                              setActiveForm(
                                method.action as 'message' | 'calendar'
                              );

                              await trackButtonClick(
                                method.action,
                                method.buttonText
                              );
                            }}
                            className={`inline-flex items-center space-x-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-all duration-200 ${
                              isActive
                                ? `bg-gradient-to-r ${method.color} shadow-lg ring-2 ring-white ring-offset-2`
                                : `bg-gradient-to-r ${method.color} hover:shadow-lg`
                            }`}
                          >
                            <span>
                              {isActive ? '✓ Active' : method.buttonText}
                            </span>
                            <motion.div
                              animate={{ rotate: isActive ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </motion.div>
                          </motion.button>
                        ) : (
                          <Link
                            href={method.action}
                            target={
                              method.action.startsWith('http')
                                ? '_blank'
                                : undefined
                            }
                            rel={
                              method.action.startsWith('http')
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            className={`inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r ${method.color} px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg`}
                          >
                            <span>{method.buttonText}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div variants={itemVariants}>
            {/* Form Header with Instructions */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  👆 Click "Send Email" or "Schedule Meeting" above to activate
                  forms
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Currently showing:{' '}
                <span className="font-semibold capitalize">{activeForm}</span>{' '}
                form
              </p>
            </motion.div>

            {activeForm === 'none' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center p-8"
              >
                {tourActive ? (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <span className="text-3xl">🎯</span>
                    </motion.div>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                      Finish the Tour to Contact {siteConfig.name}!
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                      Complete the PM experience to unlock full contact options
                      and connect with {siteConfig.name} directly.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Tour in progress...</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                      Choose Contact Method
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Select a contact method from the left to get started
                    </p>
                  </>
                )}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeForm === 'message' && (
                <motion.div
                  key="message-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Send a Message
                    </h3>
                    <button
                      onClick={() => setActiveForm('none')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors"
                        placeholder="your.email@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-3 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-black dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-colors resize-none"
                        placeholder="Tell me about your project, opportunity, or just say hello..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      whileHover={{
                        scale: submitStatus === 'loading' ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: submitStatus === 'loading' ? 1 : 0.98,
                      }}
                      className={`w-full rounded-lg px-6 py-4 font-semibold text-white dark:text-black transition-all duration-300 ${
                        submitStatus === 'loading'
                          ? 'bg-gray-400 cursor-not-allowed'
                          : submitStatus === 'success'
                            ? 'bg-gray-600 hover:bg-gray-700'
                            : submitStatus === 'error'
                              ? 'bg-gray-600 hover:bg-gray-700'
                              : 'bg-black dark:bg-white hover:shadow-lg'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {submitStatus === 'loading' && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {submitStatus === 'success' && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {submitStatus === 'error' && (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        {submitStatus === 'idle' && (
                          <Send className="h-5 w-5" />
                        )}
                        <span>
                          {submitStatus === 'loading'
                            ? 'Sending...'
                            : submitStatus === 'success'
                              ? 'Message Sent!'
                              : submitStatus === 'error'
                                ? 'Try Again'
                                : 'Send Message'}
                        </span>
                      </div>
                    </motion.button>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            Thanks! I'll get back to you within 24 hours.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>
                            {errorMessage ||
                              'Something went wrong. Please try again or email me directly.'}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeForm === 'calendar' && (
                <motion.div
                  key="calendar-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Schedule a Meeting
                    </h3>
                    <button
                      onClick={() => setActiveForm('none')}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      ×
                    </button>
                  </div>
                  {!siteConfig.features.scheduling && (
                    <p role="status" className="mb-4 text-sm text-gray-500">
                      Scheduling is not configured. Please use the email link to
                      arrange a time.
                    </p>
                  )}
                  <form onSubmit={handleMeetingSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="meeting-name"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="meeting-name"
                          name="name"
                          required
                          value={meetingData.name}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="meeting-company"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          id="meeting-company"
                          name="company"
                          value={meetingData.company}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="meeting-email"
                        name="email"
                        required
                        value={meetingData.email}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="your.email@company.com"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Preferred Date *
                        </label>
                        <DatePicker
                          selected={meetingData.selectedDate}
                          onChange={(date: Date | null) =>
                            setMeetingData((prev) => ({
                              ...prev,
                              selectedDate: date,
                            }))
                          }
                          minDate={new Date()}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholderText="Select a date"
                          dateFormat="MMMM d, yyyy"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="meeting-time"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Preferred Time *
                        </label>
                        <select
                          id="meeting-time"
                          name="selectedTime"
                          required
                          value={meetingData.selectedTime}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM EST">9:00 AM EST</option>
                          <option value="10:00 AM EST">10:00 AM EST</option>
                          <option value="11:00 AM EST">11:00 AM EST</option>
                          <option value="12:00 PM EST">12:00 PM EST</option>
                          <option value="1:00 PM EST">1:00 PM EST</option>
                          <option value="2:00 PM EST">2:00 PM EST</option>
                          <option value="3:00 PM EST">3:00 PM EST</option>
                          <option value="4:00 PM EST">4:00 PM EST</option>
                          <option value="5:00 PM EST">5:00 PM EST</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-type"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Meeting Type
                      </label>
                      <select
                        id="meeting-type"
                        name="meetingType"
                        value={meetingData.meetingType}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value="15min">15 minute call</option>
                        <option value="30min">30 minute call</option>
                        <option value="45min">45 minute call</option>
                        <option value="60min">1 hour call</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-message"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="meeting-message"
                        name="message"
                        required
                        rows={4}
                        value={meetingData.message}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="Tell me what you'd like to discuss in our meeting..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={submitStatus === 'loading'}
                      whileHover={{
                        scale: submitStatus === 'loading' ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: submitStatus === 'loading' ? 1 : 0.98,
                      }}
                      className={`w-full rounded-lg px-6 py-4 font-semibold text-white transition-all duration-300 ${
                        submitStatus === 'loading'
                          ? 'bg-slate-400 cursor-not-allowed'
                          : submitStatus === 'success'
                            ? 'bg-green-600 hover:bg-green-700'
                            : submitStatus === 'error'
                              ? 'bg-red-600 hover:bg-red-700'
                              : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg hover:shadow-green-500/25'
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {submitStatus === 'loading' && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {submitStatus === 'success' && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {submitStatus === 'error' && (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        {submitStatus === 'idle' && (
                          <Calendar className="h-5 w-5" />
                        )}
                        <span>
                          {submitStatus === 'loading'
                            ? 'Scheduling...'
                            : submitStatus === 'success'
                              ? 'Meeting Requested!'
                              : submitStatus === 'error'
                                ? 'Try Again'
                                : 'Request Meeting'}
                        </span>
                      </div>
                    </motion.button>

                    {/* Status Messages */}
                    {submitStatus === 'success' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            Meeting request sent! I'll confirm the time via
                            email within 24 hours.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {submitStatus === 'error' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>
                            {errorMessage ||
                              'Something went wrong. Please try again or email me directly.'}
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Social Links Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
              Follow My Journey
            </h4>
            <div className="space-y-4">
              {Object.entries(socialLinks).map(([key, social]) => (
                <Link
                  key={key}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="group flex items-center space-x-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer"
                  >
                    <div
                      className="rounded-full p-3 text-white shadow-lg"
                      style={{ backgroundColor: social.color }}
                    >
                      {social.icon}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {social.label}
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                        {social.description}
                      </p>
                    </div>
                    <div className="text-slate-400 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      <ExternalLink className="h-5 w-5" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-blue-900/30 py-8 mt-16 w-full rounded-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center space-y-6">
              {/* Social Media Links */}
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 flex-wrap gap-y-2 sm:gap-y-0">
                {Object.entries(socialLinks).map(([key, social]) => (
                  <Link
                    key={key}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                    title={social.title}
                  >
                    {social.icon}
                  </Link>
                ))}

                <button
                  onClick={() => {
                    setActiveForm('message');
                    // Scroll to the contact form
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
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                  title="Send a Message"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>

              {/* Professional Footer */}
              <div className="text-center text-gray-400 text-sm px-4 space-y-3">
                {/* Copyright and Description */}
                <div>
                  <p className="font-medium text-gray-300">
                    &copy; {new Date().getFullYear()} {siteConfig.name}. All
                    rights reserved.
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-300">
                    {siteConfig.description}
                  </p>
                </div>

                {/* Tech Stack */}
                <div className="pt-2 border-t border-gray-600/30">
                  <p className="text-xs">
                    <span className="font-medium text-gray-300">
                      Built with:
                    </span>{' '}
                    <span className="font-medium text-blue-400">
                      Next.js 14
                    </span>{' '}
                    •{' '}
                    <span className="font-medium text-blue-400">React 18</span>{' '}
                    •{' '}
                    <span className="font-medium text-blue-400">
                      TypeScript
                    </span>{' '}
                    •{' '}
                    <span className="font-medium text-blue-400">
                      TailwindCSS
                    </span>{' '}
                    •{' '}
                    <span className="font-medium text-blue-400">
                      Framer Motion
                    </span>
                  </p>
                  <p className="mt-1 text-xs opacity-80">
                    <span className="font-medium text-gray-300">
                      Powered by:
                    </span>{' '}
                    OpenAI API • Firebase • Resend • Recharts • Lenis Smooth
                    Scroll • React DatePicker
                  </p>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </section>
  );
}
