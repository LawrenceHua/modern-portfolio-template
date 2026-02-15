"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiExternalLink, FiGithub, FiArrowLeft, FiLayers, FiCode } from "react-icons/fi";
import Link from "next/link";

interface Product {
  day: number;
  title: string;
  description: string;
  tags: string[];
  demoUrl?: string;
  repoUrl?: string;
  icon: React.ReactNode;
  color: string;
  status: "complete" | "in-progress" | "planned";
}

const products: Product[] = [
  { day: 1, title: "One-Click Cleanup", description: "A lightweight bash script to safely clean macOS system caches.", tags: ["Bash", "macOS"], demoUrl: "https://github.com/LawrenceHua/one-click-cleanup", repoUrl: "https://github.com/LawrenceHua/one-click-cleanup", icon: <FiCode className="w-6 h-6" />, color: "from-green-500 to-emerald-600", status: "complete" },
  { day: 2, title: "Blink Delete", description: "Chrome extension for deleting data with blink gesture detection.", tags: ["Chrome Extension", "CV"], demoUrl: "https://github.com/LawrenceHua/blink-delete-day-2-30dop", repoUrl: "https://github.com/LawrenceHua/blink-delete-day-2-30dop", icon: <FiLayers className="w-6 h-6" />, color: "from-blue-500 to-cyan-600", status: "complete" },
  { day: 3, title: "ReadEase", description: "Reading assistance tool that simplifies complex text.", tags: ["React", "NLP"], demoUrl: "https://github.com/LawrenceHua/readease-day-3-30dop", repoUrl: "https://github.com/LawrenceHua/readease-day-3-30dop", icon: <FiLayers className="w-6 h-6" />, color: "from-purple-500 to-violet-600", status: "complete" },
  { day: 4, title: "FireResume AI", description: "AI-powered resume optimizer for job descriptions.", tags: ["AI", "OpenAI"], demoUrl: "https://github.com/LawrenceHua/fireresume-ai-day-4-30dop", repoUrl: "https://github.com/LawrenceHua/fireresume-ai-day-4-30dop", icon: <FiCode className="w-6 h-6" />, color: "from-orange-500 to-red-600", status: "complete" },
  { day: 5, title: "CatLife Chat Sim", description: "Chat simulator with different cat personalities.", tags: ["AI", "Fun"], demoUrl: "https://github.com/LawrenceHua/catlife-chat-sim-day-5-30dop", repoUrl: "https://github.com/LawrenceHua/catlife-chat-sim-day-5-30dop", icon: <FiLayers className="w-6 h-6" />, color: "from-pink-500 to-rose-600", status: "complete" },
  { day: 6, title: "PromptPilot", description: "AI prompt engineering assistant.", tags: ["AI", "Productivity"], demoUrl: "https://github.com/LawrenceHua/prompt-pilot-day-6-30dop", repoUrl: "https://github.com/LawrenceHua/prompt-pilot-day-6-30dop", icon: <FiCode className="w-6 h-6" />, color: "from-indigo-500 to-purple-600", status: "complete" },
  { day: 7, title: "SceneScribe", description: "AI-powered scene description tool for writers.", tags: ["AI", "Writing"], demoUrl: "https://github.com/LawrenceHua/scenescribe-day-7-30dop", repoUrl: "https://github.com/LawrenceHua/scenescribe-day-7-30dop", icon: <FiLayers className="w-6 h-6" />, color: "from-teal-500 to-cyan-600", status: "complete" },
  ...Array.from({ length: 23 }, (_, i) => ({
    day: i + 8,
    title: `Day ${i + 8} Project`,
    description: "Coming soon! Building something amazing every day.",
    tags: ["Coming Soon"],
    demoUrl: "#",
    repoUrl: "#",
    icon: <FiCode className="w-6 h-6" />,
    color: "from-slate-400 to-slate-500",
    status: "planned" as const,
  })),
];

export default function ThirtyDaysPage() {
  const [filter, setFilter] = useState<"all" | "complete">("all");
  const filteredProducts = products.filter((p) => filter === "all" || p.status === filter);
  const completedCount = products.filter((p) => p.status === "complete").length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
            <FiArrowLeft className="w-5 h-5 mr-2" />Back to Portfolio
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">30 Days of Product</h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-8">Building and shipping 30 AI-powered products in 30 days</p>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center"><div className="text-4xl font-bold text-indigo-400">{completedCount}</div><div className="text-slate-400">Completed</div></div>
              <div className="text-center"><div className="text-4xl font-bold text-slate-400">30</div><div className="text-slate-400">Total Days</div></div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => (
              <motion.article key={product.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className={`h-32 bg-gradient-to-br ${product.color} flex items-center justify-center relative`}>
                  <div className="absolute top-4 left-4 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-white font-bold">Day {product.day}</div>
                  <div className="text-white">{product.icon}</div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{product.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.tags.slice(0, 3).map((tag) => (<span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">{tag}</span>))}
                  </div>
                  {product.status === "complete" ? (
                    <div className="flex items-center space-x-3">
                      <a href={product.demoUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <FiExternalLink className="w-4 h-4 mr-2" />Try Demo
                      </a>
                      <a href={product.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <FiGithub className="w-5 h-5" />
                      </a>
                    </div>
                  ) : (
                    <button disabled className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed">Coming Soon</button>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
