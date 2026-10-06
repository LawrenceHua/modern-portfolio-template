import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';

import { ThemeProvider } from '../components/providers/ThemeProvider';
import { SmoothScrollProvider } from '../components/providers/SmoothScrollProvider';
import VisitorTracker from '../components/analytics/VisitorTracker';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — ${siteConfig.title}`,
  description: siteConfig.description,
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.title}`,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [siteConfig.images.og],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.images.og],
  },
  alternates: { canonical: siteConfig.url },
  icons: { icon: siteConfig.images.icon, apple: siteConfig.images.icon },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans">
        <ThemeProvider>
          <SmoothScrollProvider>
            <VisitorTracker />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
        {/* 🐱 Cat Easter Egg - Hidden konami-style feature */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            // Secret cat easter egg - type "cat" to see a surprise
            let catBuffer = '';
            const catCode = 'cat';
            
            document.addEventListener('keydown', function(e) {
              catBuffer += e.key.toLowerCase();
              catBuffer = catBuffer.slice(-3);
              
              if (catBuffer === catCode) {
                console.log('%c🐱 Meow! You found the cat!', 'font-size: 24px; color: #ff6b6b;');
                console.log('%cPurr... Thanks for visiting this portfolio!', 'font-size: 14px; color: #4ecdc4;');
                
                // Create a floating cat emoji
                const cat = document.createElement('div');
                cat.innerHTML = '🐱';
                cat.style.cssText = 'position:fixed;bottom:20px;right:20px;font-size:40px;cursor:pointer;z-index:9999;animation:bounce 2s infinite;';
                cat.onclick = function() {
                  alert('🐱 You found the secret cat!\n\nMeow! Thanks for exploring this portfolio. Have a purr-fect day!');
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
        `,
          }}
        />
      </body>
    </html>
  );
}
