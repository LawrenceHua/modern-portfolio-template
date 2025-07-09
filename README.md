# 🚀 Complete Portfolio Setup Guide

**Build and deploy your professional portfolio in under 1 hour using this modern template.**

This comprehensive guide walks you through every step from initial setup to live deployment, including AI-powered customization with Cursor.

Before you start, take a look at the architecture to know what you are getting into:
## 🧠 System Design

<details>
<summary>Click to view Mermaid diagram code</summary>

```mermaid
flowchart TD
  %% FRONTEND LAYER
  subgraph Frontend [Frontend – Next.js App]
    A[Home Page Sections]
    B[Chatbot UI]
    C[VisitorTracker Script]
  end

  %% API ROUTES
  subgraph API [Serverless API Routes]
    D1["/api/contact/email"]
    E1["/api/contact/meeting"]
    F1["/api/chatbot/message"]
    G1["/api/track-visitor-location"]
    H1["/api/track-button-click"]
  end

  %% BACKEND SERVICES
  subgraph Services
    I[(Firebase Firestore)]
    J[(OpenAI API)]
    K[(Google Calendar API)]
    L[(Resend Email API)]
  end

  %% FRONTEND TO API CONNECTIONS
  A --> D1
  A --> E1
  A --> F1
  A --> H1
  C --> G1
  B --> F1

  %% API TO SERVICE CONNECTIONS
  D1 --> L
  E1 --> K
  F1 --> J
  G1 --> I
  H1 --> I
```

</details>


## 📋 Table of Contents

- [🎯 Prerequisites](#-prerequisites)
- [💻 Cursor AI Workflow (Recommended)](#-cursor-ai-workflow-recommended)
- [⚡ Quick Start (5 minutes)](#-quick-start-5-minutes)
- [🔐 API Keys Setup](#-api-keys-setup)
- [🎨 Complete Customization](#-complete-customization)
- [🚀 Deployment](#-deployment)
- [📊 Advanced Features](#-advanced-features)
- [🛠️ Troubleshooting](#️-troubleshooting)
- [📚 Resources & Support](#-resources--support)

---

## 🎯 Prerequisites

**Required Software:**

- **Node.js 18+** ([Download here](https://nodejs.org))
- **Git** ([Download here](https://git-scm.com))
- **Cursor AI Editor** ([Download here](https://cursor.com/downloads)) - AI-powered code editor for faster development

**Required Accounts & API Keys:**

- **GitHub account** ([Sign up here](https://github.com/signup)) - for repository hosting and deployment
- **Vercel account** ([Sign up here](https://vercel.com/signup)) - for free hosting and deployment
- **Firebase account** ([Sign up here](https://console.firebase.google.com)) - for analytics and tracking
- **Resend account** ([Sign up here](https://resend.com/signup)) - for email service
- **OpenAI account** ([Sign up here](https://platform.openai.com/signup)) - for AI chatbot (optional but recommended)
- **Google Cloud account** ([Sign up here](https://console.cloud.google.com)) - for Google Calendar integration

**Student Benefits:**

- **Cursor Pro (Free for students)** - [Verify student status here](https://cursor.com/students) for 1 year of free Pro access

---

## 💻 Cursor AI Workflow (Recommended)

**The fastest way to build your portfolio using AI assistance.**

### **Step 1: Open Cursor and Start Fresh**

1. **Download and install Cursor** from [cursor.com/downloads](https://cursor.com/downloads)
2. **Verify student status** at [cursor.com/students](https://cursor.com/students) for free Pro access
3. **Open Cursor** and start a new chat session

### **Step 2: First Cursor Command - Fork and Setup**

Copy and paste this command into Cursor:

```
I want to build my personal portfolio. Please help me:

1. Fork the repository: https://github.com/LawrenceHua/modern-portfolio-template
2. Clone my forked repository to my local machine
3. Install dependencies
4. Start the development server
5. Analyze the codebase structure
6. Explain what each section does and how to customize it

Please provide the exact commands I need to run and guide me through the process.
```

### **Step 3: Cursor Analysis and Customization**

After the initial setup, use this comprehensive prompt:

```
/analyze

I'm building my personal portfolio using this Next.js template. Please analyze the codebase and help me customize it with my personal information.

**My Career Information:**
- **Name**: [Your Full Name]
- **Current Role**: [Your Job Title]
- **Years of Experience**: [X years]
- **Industry**: [Your Industry - e.g., Software Development, Product Management, Design, etc.]
- **Key Skills**: [List your top 5-8 technical and soft skills]
- **Education**: [Your degree(s) and university/college]
- **Location**: [Your city, state/country]
- **Professional Summary**: [2-3 sentences about your background and expertise]

**My Projects** (list 3-5 key projects):
1. **Project Name**: [Brief description, technologies used, outcomes/impact]
2. **Project Name**: [Brief description, technologies used, outcomes/impact]
3. **Project Name**: [Brief description, technologies used, outcomes/impact]

**Work Experience** (list your recent roles):
1. **Company Name** - [Role] (Year-Year): [Key achievements and responsibilities]
2. **Company Name** - [Role] (Year-Year): [Key achievements and responsibilities]

**Contact Information**:
- **Email**: [your.email@example.com]
- **LinkedIn**: [linkedin.com/in/yourprofile]
- **GitHub**: [github.com/yourusername]
- **Portfolio/Website**: [if you have one]

**Design Preferences**:
- **Color Scheme**: [e.g., Blue/Gray, Green/Earth tones, Purple/White, etc.]
- **Style**: [e.g., Minimalist, Modern, Creative, Professional, etc.]
- **Special Features**: [Any specific sections or features you want to highlight]

Please help me:
1. Update all placeholder content with my information
2. Customize the color scheme and styling to match my preferences
3. Optimize the content for my specific role and industry
4. Ensure the portfolio reflects my professional brand
5. Add any missing sections that would be relevant for my background
6. Set up environment variables for advanced features
7. Test the portfolio locally
8. Deploy to Vercel
9. Provide me with the final live URL

Please execute these changes step by step and explain what you're doing at each stage.
```

### **Step 4: Cursor Deployment Command**

Once customization is complete, use this command:

```
Now help me deploy my portfolio to Vercel:

1. Push all changes to my GitHub repository
2. Connect my repository to Vercel
3. Configure environment variables in Vercel
4. Deploy the portfolio
5. Provide me with the live URL
6. Test all functionality on the live site

Please guide me through each step and provide the exact commands and actions needed.
```

---

## ⚡ Quick Start (5 minutes)

### Step 1: Fork and Clone the Template

1. **Fork the repository**:
   - Go to [https://github.com/LawrenceHua/modern-portfolio-template](https://github.com/LawrenceHua/modern-portfolio-template)
   - Click the **"Fork"** button in the top-right corner
   - This creates your own copy under your GitHub account

2. **Clone your fork**:

   ```bash
   # Clone your forked repository (replace YOUR_USERNAME with your GitHub username)
   git clone https://github.com/YOUR_USERNAME/modern-portfolio-template.git
   cd modern-portfolio-template

   # Install dependencies
   npm install
   ```

3. **Set up upstream** (optional, to get updates from the original template):
   ```bash
   git remote add upstream https://github.com/LawrenceHua/modern-portfolio-template.git
   ```

**💡 Pro Tip**: Forking gives you your own repository that you can customize freely. You can always get updates from the original template later if needed.

**🔄 Getting Updates** (if you set up upstream):

```bash
# Fetch updates from the original template
git fetch upstream

# Merge updates into your main branch
git checkout main
git merge upstream/main

# Push updates to your fork
git push origin main
```

### Step 2: Basic Configuration

1. **Update your information** in `src/config/site.ts`:

   ```typescript
   export const siteConfig = {
     name: "Your Full Name",
     title: "Your Job Title",
     description: "Your portfolio description",
     contact: {
       email: "your.email@example.com",
       phone: "+1 (555) 123-4567",
       location: "Your City, State",
       linkedin: "https://linkedin.com/in/yourprofile",
       github: "https://github.com/yourusername",
     },
   };
   ```

2. **Add your profile image**:
   - Place your photo in `public/images/placeholders/`
   - Update the path in `src/config/site.ts`

### Step 3: Start Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your portfolio!

---

## 🔐 API Keys Setup

Create a `.env.local` file using `.env.example` as a template. These services are **optional** but recommended for full functionality.

### **Firebase (Analytics & Tracking)** 🔥

Used for visitor analytics and hit counters.

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project → Register a web app
3. Copy the config values to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### **Resend (Email Service)** 📧

Used to send emails from the contact form.

1. Sign up at [Resend.com](https://resend.com)
2. Verify your sending domain
3. Copy your API key to `.env.local`:

```env
RESEND_API_KEY=your_resend_api_key_here
YOUR_EMAIL=your_verified_email@domain.com
```

### **OpenAI (AI Chatbot)** 🤖

Optional but recommended for the AI-powered contact assistant.

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Generate a new API key
3. Add to `.env.local`:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### **Google Calendar (Meeting Scheduler)** 📅

Used for scheduling meetings via Google Calendar.

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create/select a project and enable **Google Calendar API**
3. Go to "APIs & Services" → "Credentials"
4. Create an OAuth 2.0 Client ID (Web application)
5. Set authorized redirect URI to `https://yourdomain.com/api/auth/callback`
6. Copy credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_CALENDAR_ID=your_email@gmail.com
```

### **Vercel (Deployment)** ☁️

No API keys needed here. You'll add the above environment variables in Vercel's dashboard during deployment.

---

## 🎨 Complete Customization

### **Team Roles for 1-Hour Completion**

Assign these roles to your team for parallel work:

- **🎨 Frontend Lead**: Update layout, styling, and components
- **📝 Content Manager**: Replace all placeholder text and content
- **🎯 Styling Lead**: Customize colors, fonts, and visual design
- **🧪 QA Tester**: Test functionality, responsiveness, and links

### **Key Files to Edit**

| Section        | File Path                                     | What to Update                              |
| -------------- | --------------------------------------------- | ------------------------------------------- |
| **Hero**       | `src/components/sections/HeroSection.tsx`     | Name, title, profile image, CTA buttons     |
| **About**      | `src/components/sections/AboutSection.tsx`    | Your story, background, achievements        |
| **Skills**     | `src/components/sections/SkillsSection.tsx`   | Your expertise, tools, experience levels    |
| **Projects**   | `src/components/sections/ProjectsSection.tsx` | Your work, descriptions, links, screenshots |
| **Experience** | `src/components/sections/TimelineSection.tsx` | Work history, education, company logos      |
| **Contact**    | `src/components/sections/ContactSection.tsx`  | Contact methods, form fields                |

### **Site Configuration**

Update `src/config/site.ts` with your information:

```typescript
export const siteConfig = {
  name: "Your Full Name",
  title: "Your Professional Title",
  description: "Your portfolio description for SEO",
  contact: {
    email: "your.email@example.com",
    phone: "+1 (555) 123-4567",
    location: "Your City, State",
    linkedin: "https://linkedin.com/in/yourprofile",
    github: "https://github.com/yourusername",
    twitter: "https://twitter.com/yourhandle",
  },
  images: {
    profile: "/images/placeholders/your-photo.jpg",
    og: "/og-image.png",
  },
};
```

### **Content Sections Customization**

#### **Hero Section**

```typescript
hero: {
  headline: "Hi, I'm Your Name",
  subtitle: "I help companies build better products",
  description: "Your professional summary and value proposition",
  ctaText: "View My Work",
  ctaLink: "#projects",
},
```

#### **About Section**

```typescript
about: {
  title: "About Me",
  content: `Your professional story and background...`,
  highlights: [
    "5+ years in your field",
    "Led teams of 10+ people",
    "Increased efficiency by 40%",
    "Launched 3 successful projects",
  ],
},
```

#### **Skills Section**

```typescript
skills: [
  {
    category: "Technical Skills",
    items: [
      "Your Technical Skill 1",
      "Your Technical Skill 2",
      "Your Technical Skill 3",
    ],
  },
  {
    category: "Soft Skills",
    items: [
      "Leadership",
      "Communication",
      "Problem Solving",
      "Strategic Thinking",
    ],
  },
  {
    category: "Tools & Platforms",
    items: [
      "Tool 1",
      "Tool 2",
      "Tool 3",
      "Platform 1",
    ],
  },
],
```

#### **Projects Section**

```typescript
projects: [
  {
    title: "Your Project Name",
    description: "Detailed description of your project, its impact, and your role",
    technologies: ["Technology 1", "Technology 2", "Technology 3"],
    link: "https://your-project.com",
    image: "/images/placeholders/project-screenshot.jpg",
  },
  // Add more projects...
],
```

#### **Experience Timeline**

```typescript
experience: [
  {
    title: "Your Job Title",
    company: "Company Name",
    period: "2023 - Present",
    description: "Your role and responsibilities",
    achievements: [
      "Specific achievement with metrics",
      "Another achievement with impact",
      "Third achievement with results",
    ],
  },
  // Add more experience...
],
```

### **Styling Customization**

#### **Change Colors**

Edit `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#your-primary-color",
        secondary: "#your-secondary-color",
        accent: "#your-accent-color",
      },
    },
  },
};
```

#### **Add Custom Fonts**

Edit `src/app/globals.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=Your+Font:wght@400;700&display=swap");

body {
  font-family: "Your Font", sans-serif;
}
```

### **AI-Powered Customization Prompts**

Use these prompts with your AI assistant for rapid customization:

#### **Content Updates**

```
"Update the portfolio content in [SECTION_FILE] to reflect my background as a [YOUR_ROLE] with experience in [YOUR_SKILLS]. Include my projects [PROJECT_NAMES] and education at [SCHOOL_NAMES]."
```

#### **Styling Changes**

```
"Modify the color scheme in [COMPONENT_FILE] to use [COLOR_PALETTE] instead of the current black/white theme."
```

#### **Adding Features**

```
"Add a new section to showcase [FEATURE_TYPE] in the portfolio. Create the component and integrate it into the main page."
```

---

## 🚀 Deployment

### **Deploy to Vercel (Recommended)**

1. **Push to your fork**:

   ```bash
   git add .
   git commit -m "Initial portfolio setup"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your **forked** GitHub repository
   - Vercel will auto-detect Next.js and deploy

3. **Add Environment Variables**:
   - In Vercel dashboard → Project Settings → Environment Variables
   - Add all your `.env.local` variables (Firebase, Resend, OpenAI, Google)

4. **Deploy**:
   - Vercel will automatically deploy your site
   - Your portfolio will be live at `https://your-portfolio.vercel.app`

### **Alternative Deployments**

#### **Netlify**

```bash
npm run build
# Connect GitHub repo to Netlify
# Set build command: npm run build
# Set publish directory: .next
```

#### **GitHub Pages**

```bash
# Add to package.json
"export": "next build && next export",
"deploy": "npm run export && touch out/.nojekyll"

npm run deploy
```

---

## 📊 Advanced Features

### **Analytics Dashboard**

Access at `/analytics` after setting up Firebase:

- Visitor tracking
- Page views
- Geographic data
- Device analytics

### **AI Chatbot**

Configure in `src/app/api/chatbot/route.ts`:

- Custom responses
- Personality settings
- Integration with contact form

### **Meeting Scheduler**

Set up Google Calendar integration:

- Automatic meeting scheduling
- Calendar availability
- Email confirmations

### **SEO Optimization**

Update in `src/app/layout.tsx`:

```typescript
export const metadata = {
  title: "Your Name - Your Title",
  description: "Your portfolio description",
  keywords: ["your", "keywords", "here"],
  openGraph: {
    title: "Your Name - Portfolio",
    description: "Your description",
    images: ["/og-image.png"],
  },
};
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **Portfolio Not Loading**

```bash
# Check dependencies
npm install

# Verify Node.js version
node --version  # Should be 18+

# Clear cache
rm -rf .next && npm run dev
```

#### **Styling Issues**

```bash
# Check Tailwind
npm run build

# Verify CSS imports in globals.css
# Check browser console for errors
```

#### **API Errors**

- Verify all environment variables are set in `.env.local`
- Check API key permissions and quotas
- Ensure services are properly configured

#### **Deployment Problems**

- Check build logs in Vercel dashboard
- Verify all environment variables are set in Vercel
- Ensure domain and SSL settings are correct

### **Development Commands**

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run test         # Run tests

# Utilities
npm run typecheck    # Check TypeScript types
npm run clean        # Clean build files
```

### **Pre-Launch Checklist**

- [ ] **Personal Information**: All placeholders replaced
- [ ] **Profile Image**: Professional photo uploaded
- [ ] **Content**: All sections updated with your info
- [ ] **Links**: All social and project links working
- [ ] **Contact**: Contact form tested and working
- [ ] **Mobile**: Portfolio looks good on mobile
- [ ] **Performance**: Page loads quickly (Lighthouse)
- [ ] **SEO**: Meta tags and descriptions updated
- [ ] **Analytics**: Tracking configured (if using)
- [ ] **Domain**: Custom domain configured (optional)
- [ ] **SSL**: HTTPS enabled
- [ ] **Testing**: All features tested thoroughly

---

## 📚 Resources & Support

### **Documentation**

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs)

### **Getting Help**

- **GitHub Issues**: Create detailed issue descriptions
- **GitHub Discussions**: Ask questions and share solutions
- **Community**: Join developer communities for support

### **Best Practices**

#### **Content Strategy**

- Keep sections scannable in 30 seconds
- Show results, metrics, and impact
- Use visuals (screenshots, diagrams, videos)
- Tell stories behind your work
- Update content regularly

#### **Technical Optimization**

- Optimize images (WebP format, compression)
- Monitor Core Web Vitals
- Ensure mobile-first design
- Follow accessibility guidelines (WCAG)
- Add proper meta descriptions and alt text

---

## 🎯 Success Metrics

After deployment, track these metrics:

- **Page Load Speed**: < 3 seconds (Lighthouse)
- **Mobile Performance**: 90+ score
- **SEO Score**: 90+ score
- **Accessibility**: 90+ score
- **Contact Form**: 100% working
- **All Links**: 0 broken links

---

**Happy building! 🚀**

---

**Created by Lawrence Hua** - A modern portfolio template for developers, designers, and professionals.
