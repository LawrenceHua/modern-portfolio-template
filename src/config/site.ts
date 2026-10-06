// Customize portfolio identity and sample content here. All entries are fictional.
interface Skill {
  name: string;
  level: 'expert' | 'proficient' | 'familiar';
  category: 'business' | 'data' | 'engineering' | 'design';
  icon: string;
  experience: string;
  projects: number;
  achievement: string;
  endorsements: string[];
}
const skillsData: Record<string, Skill[]> = {
  business: [
    {
      name: 'Product Strategy',
      level: 'expert',
      category: 'business',
      icon: '🎯',
      experience: '3+ years',
      projects: 8,
      achievement:
        'Led product strategy initiatives that improved user engagement by 25%',
      endorsements: [
        'Senior Product Manager',
        'Company Leadership',
        'University Faculty',
      ],
    },
    {
      name: 'Roadmap Planning',
      level: 'expert',
      category: 'business',
      icon: '📋',
      experience: '3+ years',
      projects: 6,
      achievement: 'Planned roadmaps for multiple products and features',
      endorsements: [
        'Product Team',
        'Company Advisors',
        'Industry Consultants',
      ],
    },
    {
      name: 'A/B Testing',
      level: 'proficient',
      category: 'business',
      icon: '⚡',
      experience: '2+ years',
      projects: 5,
      achievement: 'Improved UI usability by 40% through systematic testing',
      endorsements: ['Design Team', 'University Researchers'],
    },
    {
      name: 'User Research',
      level: 'proficient',
      category: 'business',
      icon: '🔍',
      experience: '2+ years',
      projects: 4,
      achievement: 'Conducted 250+ user surveys validating product-market fit',
      endorsements: ['Company Executives', 'Competition Judges'],
    },
    {
      name: 'Agile/Scrum',
      level: 'expert',
      category: 'business',
      icon: '🔄',
      experience: '3+ years',
      projects: 7,
      achievement: 'Led agile teams reducing development delays by 25%',
      endorsements: ['Engineering Teams', 'Project Leads'],
    },
    {
      name: 'Stakeholder Management',
      level: 'expert',
      category: 'business',
      icon: '🤝',
      experience: '3+ years',
      projects: 8,
      achievement: 'Pitched to 15+ executives securing partnerships',
      endorsements: [
        'Company C-Suite',
        'Industry Partners',
        'University Leadership',
      ],
    },
  ],
  data: [
    {
      name: 'Data Analysis',
      level: 'expert',
      category: 'data',
      icon: '📊',
      experience: '3+ years',
      projects: 8,
      achievement:
        'Analyzed user behavior patterns improving conversion rates by 15%',
      endorsements: ['Company Operations', 'University Statistics Faculty'],
    },
    {
      name: 'SQL',
      level: 'expert',
      category: 'data',
      icon: '🗄️',
      experience: '4+ years',
      projects: 10,
      achievement: 'Optimized database queries for large-scale deployments',
      endorsements: ['Data Team', 'Company Analytics'],
    },
    {
      name: 'Python',
      level: 'proficient',
      category: 'data',
      icon: '🐍',
      experience: '3+ years',
      projects: 8,
      achievement: 'Built data processing scripts improving efficiency by 30%',
      endorsements: ['Development Team', 'University IT', 'Students'],
    },
    {
      name: 'Excel',
      level: 'expert',
      category: 'data',
      icon: '📈',
      experience: '4+ years',
      projects: 12,
      achievement: 'Created complex models for business forecasting',
      endorsements: ['Business Team', 'Finance Department'],
    },
    {
      name: 'Google Analytics',
      level: 'proficient',
      category: 'data',
      icon: '📱',
      experience: '2+ years',
      projects: 5,
      achievement: 'Set up tracking systems improving marketing ROI by 20%',
      endorsements: ['Marketing Team', 'Digital Partners'],
    },
    {
      name: 'Tableau',
      level: 'proficient',
      category: 'data',
      icon: '📊',
      experience: '2+ years',
      projects: 4,
      achievement:
        'Created dashboards for executive reporting and decision making',
      endorsements: ['Business Intelligence Team', 'Executive Leadership'],
    },
    {
      name: 'A/B Testing',
      level: 'proficient',
      category: 'data',
      icon: '🧪',
      experience: '2+ years',
      projects: 6,
      achievement: 'Ran experiments improving user engagement by 25%',
      endorsements: ['Product Team', 'Data Scientists'],
    },
    {
      name: 'Market Research',
      level: 'proficient',
      category: 'data',
      icon: '🔍',
      experience: '2+ years',
      projects: 5,
      achievement: 'Conducted competitive analysis informing product strategy',
      endorsements: ['Strategy Team', 'Industry Analysts'],
    },
  ],
  engineering: [
    {
      name: 'JavaScript',
      level: 'proficient',
      category: 'engineering',
      icon: '⚡',
      experience: '3+ years',
      projects: 8,
      achievement: 'Built web applications and interactive features',
      endorsements: ['Web Development Teams', 'Frontend Engineers'],
    },
    {
      name: 'React/Next.js',
      level: 'proficient',
      category: 'engineering',
      icon: '⚛️',
      experience: '2+ years',
      projects: 5,
      achievement: 'Developed modern web applications and prototypes',
      endorsements: ['Development Team', 'Tech Advisors'],
    },
    {
      name: 'TypeScript',
      level: 'familiar',
      category: 'engineering',
      icon: '📘',
      experience: '1+ years',
      projects: 3,
      achievement: 'Enhanced code quality and reduced runtime errors',
      endorsements: ['Web Development Teams'],
    },
    {
      name: 'Node.js',
      level: 'familiar',
      category: 'engineering',
      icon: '💚',
      experience: '2+ years',
      projects: 4,
      achievement: 'Built backend APIs and server-side applications',
      endorsements: ['Full-Stack Development Teams'],
    },
    {
      name: 'Cloud Services',
      level: 'familiar',
      category: 'engineering',
      icon: '☁️',
      experience: '2+ years',
      projects: 3,
      achievement: 'Deployed applications using cloud infrastructure',
      endorsements: ['Cloud Partners', 'Architecture Teams'],
    },
    {
      name: 'Git/GitHub',
      level: 'proficient',
      category: 'engineering',
      icon: '🔀',
      experience: '3+ years',
      projects: 12,
      achievement: 'Managed version control for collaborative projects',
      endorsements: ['Engineering Teams', 'Open Source Community'],
    },
    {
      name: 'REST APIs',
      level: 'proficient',
      category: 'engineering',
      icon: '🔌',
      experience: '2+ years',
      projects: 6,
      achievement: 'Designed and integrated APIs for web applications',
      endorsements: ['API Development', 'Backend Engineering Teams'],
    },
    {
      name: 'HTML/CSS',
      level: 'proficient',
      category: 'engineering',
      icon: '🌐',
      experience: '3+ years',
      projects: 10,
      achievement: 'Created responsive and accessible web interfaces',
      endorsements: ['Frontend Teams', 'Web Developers'],
    },
  ],
  design: [
    {
      name: 'Figma',
      level: 'proficient',
      category: 'design',
      icon: '🎨',
      experience: '2+ years',
      projects: 6,
      achievement:
        'Created wireframes and prototypes improving design consistency',
      endorsements: ['Design Team', 'UX Research Groups'],
    },
    {
      name: 'UI/UX Design',
      level: 'proficient',
      category: 'design',
      icon: '✨',
      experience: '2+ years',
      projects: 5,
      achievement:
        'Created user-centered designs for web and mobile applications',
      endorsements: ['Design Teams', 'User Experience Researchers'],
    },
    {
      name: 'Prototyping',
      level: 'proficient',
      category: 'design',
      icon: '🔧',
      experience: '2+ years',
      projects: 4,
      achievement: 'Built interactive prototypes for product validation',
      endorsements: ['Innovation Team', 'Product Design Leaders'],
    },
    {
      name: 'Design Systems',
      level: 'familiar',
      category: 'design',
      icon: '📐',
      experience: '1+ years',
      projects: 2,
      achievement: 'Established consistent design patterns across platforms',
      endorsements: ['Design System Teams'],
    },
    {
      name: 'User Testing',
      level: 'proficient',
      category: 'design',
      icon: '👥',
      experience: '2+ years',
      projects: 3,
      achievement: 'Conducted usability testing improving user satisfaction',
      endorsements: ['UX Research Teams', 'Product Validation Groups'],
    },
  ],
};
interface TimelineEvent {
  type: 'education' | 'experience';
  year: string;
  title: string;
  org: string;
  date: string;
  logo: string;
  category?: string;
  bullets?: string[];
  details?: string[];
}
const timelineData: TimelineEvent[] = [
  // Education
  {
    type: 'education',
    year: '2024',
    title: "Master's degree, Business Administration",
    org: 'University Name',
    date: 'Aug 2023 - Dec 2024',
    logo: '/images/placeholders/project.svg',
    details: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Relevant Coursework: Product Management, Business Strategy, Data Analytics',
      "Awards: Dean's List, Academic Excellence",
    ],
  },
  {
    type: 'education',
    year: '2021',
    title: "Bachelor's degree, Business Administration",
    org: 'University Name',
    date: 'Aug 2017 - May 2021',
    logo: '/images/placeholders/project.svg',
    details: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Relevant Coursework: Marketing, Finance, Operations Management, Business Analytics',
      "Awards: Dean's List, Academic Excellence",
    ],
  },
  {
    type: 'education',
    year: '2017',
    title: 'High School Diploma',
    org: 'High School Name',
    date: 'Aug 2013 - May 2017',
    logo: '/images/placeholders/project.svg',
    details: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Leadership activities and community service',
      'Academic excellence and extracurricular involvement',
    ],
  },
  // Experience (Most Recent First)
  {
    type: 'experience',
    year: '2025',
    title: 'Senior Product Manager',
    org: 'Company Name · Full-time',
    date: 'Jan 2025 - Present',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2024',
    title: 'Product Manager',
    org: 'Company Name · Full-time',
    date: 'Mar 2024 - Dec 2024',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2024',
    title: 'Product Manager Intern',
    org: 'Company Name · Internship',
    date: 'Jun 2024 - Aug 2024',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2023',
    title: 'Associate Product Manager',
    org: 'Company Name · Full-time',
    date: 'Jan 2023 - Dec 2023',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2022',
    title: 'Product Analyst',
    org: 'Company Name · Full-time',
    date: 'Jan 2022 - Dec 2022',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2021',
    title: 'Business Analyst',
    org: 'Company Name · Full-time',
    date: 'Jan 2021 - Dec 2021',
    logo: '/images/placeholders/project.svg',
    category: 'product',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
  {
    type: 'experience',
    year: '2020',
    title: 'Marketing Intern',
    org: 'Company Name · Internship',
    date: 'Jun 2020 - Aug 2020',
    logo: '/images/placeholders/project.svg',
    category: 'marketing',
    bullets: [
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
      'Describe your role, the challenge, and a measurable outcome.',
    ],
  },
];
const projectsData = {
  all: [
    {
      title: 'Product Launch Strategy',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Product Management', 'Strategy', 'Launch', 'Market Research'],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
      featured: true,
      achievements: [
        'Improved user engagement',
        'Data-driven decisions',
        'Cross-functional leadership',
        'Market success',
      ],
    },
    {
      title: 'User Experience Redesign',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['UX Design', 'Product Management', 'User Research', 'Design'],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
    },
    {
      title: 'Business Process Optimization',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: [
        'Process Improvement',
        'Automation',
        'Business Analysis',
        'Efficiency',
      ],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
    },
    {
      title: 'Analytics Dashboard',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: [
        'Analytics',
        'Dashboard',
        'Data Visualization',
        'Business Intelligence',
      ],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
      featured: true,
      achievements: [
        'Improved decision making',
        'Real-time insights',
        'User-friendly interface',
        'Cross-department adoption',
      ],
    },
    {
      title: 'Mobile App Development',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Mobile', 'App Development', 'Product Management', 'Launch'],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
    },
    {
      title: 'Market Analysis Report',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Market Research', 'Analysis', 'Strategy', 'Data Science'],
      link: '#',
      linkText: 'View Report',
      linkIcon: 'external' as const,
    },
    {
      title: 'Team Leadership Project',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Leadership', 'Team Management', 'Project Management', 'Strategy'],
      link: '#',
      linkText: 'View Project',
      linkIcon: 'external' as const,
    },
    {
      title: 'Customer Research Study',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Research', 'Customer Insights', 'User Research', 'Analysis'],
      link: '#',
      linkText: 'View Study',
      linkIcon: 'external' as const,
    },
    {
      title: 'Product Strategy Framework',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Strategy', 'Framework', 'Product Management', 'Planning'],
      link: '#',
      linkText: 'View Framework',
      linkIcon: 'external' as const,
    },
    {
      title: 'Data Analysis Project',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Data Analysis', 'Analytics', 'Insights', 'Reporting'],
      link: '#',
      linkText: 'View Analysis',
      linkIcon: 'external' as const,
    },
    {
      title: 'Feature Development',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: [
        'Feature Development',
        'Product Management',
        'Development',
        'Launch',
      ],
      link: '#',
      linkText: 'View Feature',
      linkIcon: 'external' as const,
    },
    {
      title: 'Competitive Analysis',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Competitive Analysis', 'Market Research', 'Strategy', 'Research'],
      link: '#',
      linkText: 'View Analysis',
      linkIcon: 'external' as const,
    },
    {
      title: 'User Journey Mapping',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['User Journey', 'UX Design', 'Mapping', 'User Research'],
      link: '#',
      linkText: 'View Journey',
      linkIcon: 'external' as const,
    },
    {
      title: 'Product Roadmap',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Roadmap', 'Product Planning', 'Strategy', 'Timeline'],
      link: '#',
      linkText: 'View Roadmap',
      linkIcon: 'external' as const,
    },
    {
      title: 'Portfolio Website',
      description:
        'Describe your role, the challenge, and a measurable outcome.',
      image: '/images/placeholders/project.svg',
      tags: ['Next.js', 'React', 'TailwindCSS', 'TypeScript'],
      link: 'https://example.com',
      linkText: 'View Source',
      linkIcon: 'github' as const,
    },
    {
      title: 'Market Research Analysis',
      description:
        'Conducted comprehensive market research for a new product launch, analyzing competitor landscape and identifying market opportunities that informed strategic decisions.',
      image: '/images/placeholders/project.svg',
      tags: ['Market Research', 'Competitive Analysis', 'Strategy', 'Business'],
      link: 'https://example.com',
      linkText: 'View Analysis',
      linkIcon: 'external' as const,
    },
    {
      title: 'User Experience Optimization',
      description:
        'Led user experience improvements for a web application, resulting in 40% increase in user satisfaction scores and reduced support tickets by 30%.',
      image: '/images/placeholders/project.svg',
      tags: ['UX Design', 'User Research', 'Web Application', 'Optimization'],
      link: 'https://example.com',
      linkText: 'View Project',
      linkIcon: 'external' as const,
    },
    {
      title: 'Product Strategy Development',
      description:
        'Developed comprehensive product strategy for a new market segment, including roadmap planning, feature prioritization, and go-to-market strategy.',
      image: '/images/placeholders/project.svg',
      tags: ['Product Strategy', 'Roadmap', 'Go-to-Market', 'Planning'],
      link: 'https://example.com',
      linkText: 'View Strategy',
      linkIcon: 'external' as const,
    },
  ],
};
interface Episode {
  id: string;
  title: string;
  description: string;
  duration: string;
  date: string;
  audioUrl?: string;
  tags: string[];
}
const episodes: Episode[] = [
  {
    id: 'ep-001',
    title: 'Building AI Products That Actually Ship',
    description:
      'A deep dive into the process of taking AI prototypes from concept to production. Learn about the common pitfalls and how to avoid them.',
    duration: '45:23',
    date: '2025-01-15',
    tags: ['AI', 'Product Management', 'Startups'],
  },
  {
    id: 'ep-002',
    title: 'From Engineer to AI Product Manager',
    description:
      'My journey from writing code to shipping AI products. How technical background helps in product decisions.',
    duration: '38:15',
    date: '2025-01-08',
    tags: ['Career', 'AI', 'Leadership'],
  },
  {
    id: 'ep-003',
    title: 'Reducing Food Waste with Computer Vision',
    description:
      "How we're using AI to tackle the food waste problem. Behind the scenes of building Sample Project.",
    duration: '52:40',
    date: '2024-12-20',
    tags: ['Computer Vision', 'Sustainability', 'Startup'],
  },
  {
    id: 'ep-004',
    title: 'LLMs in Production: Lessons from the Trenches',
    description:
      'What nobody tells you about deploying LLMs at scale. Cost optimization, latency, and hallucinations.',
    duration: '41:30',
    date: '2024-12-13',
    tags: ['LLM', 'Engineering', 'Best Practices'],
  },
  {
    id: 'ep-005',
    title: '30 Days of Product: Building in Public',
    description:
      'Why I built 30 products in 30 days and what I learned. The power of constraints and shipping fast.',
    duration: '35:18',
    date: '2024-12-06',
    tags: ['Building in Public', 'Product', 'Learning'],
  },
];

export const siteConfig = {
  aboutCopy: {
    copy0: 'About',
    copy1: 'Product Strategy',
    copy2: 'User Research',
    copy3: 'Data Analysis',
    copy4: 'Technical Foundation',
    copy5: 'your expertise',
    copy6: 'your expertise',
    copy7: 'Product Strategy',
    copy8: 'roadmap planning',
    copy9: 'A/B testing',
    copy10: 'Cross-functional Leadership',
    copy11: 'engineering teams',
    copy12: 'stakeholders',
    copy13: 'consensus',
    copy14: 'User-Centric',
    copy15: 'Innovation',
    copy16: 'Data-Driven',
    copy17: 'Collaborative',
    copy18: 'Beyond the Resume',
    copy19: 'exploring the latest technology research',
    copy20: 'mentoring fellow product managers',
    copy21: 'side projects that bridge technology and social impact',
    copy22: 'curiosity',
    copy23: 'relentless focus on making things better',
    copy24: 'Ready to build the next solution together?',
    copy25: 'Explore My Skills',
  },
  features: { scheduling: false },
  name: 'Your Name',
  title: 'Your Title',
  description:
    'A portfolio of thoughtful work, useful ideas, and projects with purpose.',
  url: 'https://example.com',
  email: 'you@example.com',
  location: 'Your City',
  links: {
    github: 'https://github.com/your-username',
    linkedin: 'https://www.linkedin.com/in/your-username',
    resume: 'https://example.com/resume.pdf',
    meeting: 'https://example.com/contact',
  },
  images: {
    profile: '/images/placeholders/avatar.svg',
    project: '/images/placeholders/project.svg',
    og: '/og',
    icon: '/icon.svg',
  },
  hero: {
    description: 'I turn curious questions into thoughtful work.',
    specialties: ['Your Specialty', 'Your Craft', 'Your Focus'],
    highlights: ['Your background', 'Your experience'],
  },
  about: {
    title: 'A little about me',
    paragraphs: [
      'Introduce yourself and the work you care about. Share what brought you here and what you hope to build next.',
      'Describe your approach, the people you work with, and the problems you enjoy solving.',
      'Add an example that shows how you think. Focus on your contribution and what you learned.',
      'Outside work, share a hobby or interest that helps visitors get to know you.',
    ],
    strengths: ['Your foundation', 'Your approach', 'Your perspective'],
    values: ['Curiosity', 'Collaboration', 'Care'],
  },
  tour: {
    intro: 'Explore my work, skills, and experience in a short guided tour.',
    skills:
      'Here are the skills I bring to a project. Select a card to learn more.',
    education: 'Explore the learning experiences that shaped my work.',
    experience:
      'Follow my professional journey and see the contributions I have made.',
    project:
      'Explore this sample project, then replace it with a case study from your own work.',
    invitation: 'A quick look at my work',
    closing:
      'Thanks for exploring my portfolio. Get in touch to start a conversation.',
  },
  podcast: {
    title: 'Your Podcast',
    description:
      'Conversations about your field, your craft, and what you are learning.',
  },
  challenge: {
    title: '30 Days of Building',
    description:
      'An example project journal. Replace the sample entries with your own experiments.',
  },
  challengeProjects: Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    title: 'Sample Project ' + (i + 1),
    description: 'Describe the idea, your contribution, and what you learned.',
    tags: ['Sample'],
    status: 'planned' as const,
    demoUrl: 'https://example.com',
    repoUrl: 'https://github.com/your-username/your-project',
  })),
  skillsData,
  timelineData,
  projectsData,
  episodes,
};
