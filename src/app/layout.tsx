import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { SmoothScrollProvider } from "../components/providers/SmoothScrollProvider";
import VisitorTracker from "../components/analytics/VisitorTracker";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 🎯 CUSTOMIZATION: Update these values with your information
// Replace all instances of YOUR_NAME, YOUR_TITLE, YOUR_DOMAIN, etc.
export const metadata: Metadata = {
  metadataBase: new URL("https://YOUR_DOMAIN.com"),
  title: "YOUR_NAME - YOUR_TITLE",
  description:
    "Portfolio website showcasing my work in YOUR_EXPERTISE and YOUR_FIELD",
  keywords: [
    "YOUR_NAME",
    "YOUR_TITLE",
    "YOUR_EXPERTISE",
    "Portfolio",
    "YOUR_SKILLS",
  ],
  authors: [{ name: "YOUR_NAME" }],
  creator: "YOUR_NAME",
  publisher: "YOUR_NAME",
  openGraph: {
    title: "YOUR_NAME - YOUR_TITLE",
    description: "Learn more about YOUR_NAME - YOUR_TITLE and YOUR_EXPERTISE",
    url: "https://YOUR_DOMAIN.com",
    siteName: "YOUR_NAME Portfolio",
    images: [
      {
        url: "https://YOUR_DOMAIN.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "YOUR_NAME - YOUR_TITLE",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "YOUR_NAME - YOUR_TITLE",
    description: "Learn more about YOUR_NAME - YOUR_TITLE and YOUR_EXPERTISE",
    images: ["https://YOUR_DOMAIN.com/og-image.png"],
    creator: "@YOUR_TWITTER_HANDLE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://YOUR_DOMAIN.com",
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SmoothScrollProvider>
            <VisitorTracker />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
        {/* 🐱 Cat Easter Egg - Hidden konami-style feature */}
        <script dangerouslySetInnerHTML={{__html: `
          (function() {
            // Secret cat easter egg - type "cat" to see a surprise
            let catBuffer = '';
            const catCode = 'cat';
            
            document.addEventListener('keydown', function(e) {
              catBuffer += e.key.toLowerCase();
              catBuffer = catBuffer.slice(-3);
              
              if (catBuffer === catCode) {
                console.log('%c🐱 Meow! You found the cat!', 'font-size: 24px; color: #ff6b6b;');
                console.log('%cPurr... Thanks for visiting Lawrence\'s portfolio!', 'font-size: 14px; color: #4ecdc4;');
                
                // Create a floating cat emoji
                const cat = document.createElement('div');
                cat.innerHTML = '🐱';
                cat.style.cssText = 'position:fixed;bottom:20px;right:20px;font-size:40px;cursor:pointer;z-index:9999;animation:bounce 2s infinite;';
                cat.onclick = function() {
                  alert('🐱 You found the secret cat!\n\nMeow! Thanks for exploring Lawrence\'s portfolio. Have a purr-fect day!');
                };
                document.body.appendChild(cat);
                
                // Add bounce animation
                const style = document.createElement('style');
                style.textContent = '@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}';
                document.head.appendChild(style);
              }
            });
            
            // Console greeting
            console.log('%c👋 Hey there, curious developer!', 'font-size: 16px; font-weight: bold; color: #667eea;');
            console.log('%cTry typing ".cat" on your keyboard for a surprise...', 'font-size: 12px; color: #764ba2;');
          })();
        `}} />
      </body>
    </html>
  );
}
