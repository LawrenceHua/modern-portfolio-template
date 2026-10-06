import { siteConfig } from '@/config/site';
// Message formatting function with all button types and love mode support
export function formatMessage(
  content: string,
  isLoveMode: boolean = false,
  onButtonClick?: (type: string) => void
) {
  let formatted = content;

  // First handle markdown formatting
  formatted = formatted
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Handle bullet points properly by converting to HTML lists
  // Split content into sections and process each section
  const sections = formatted.split(/\n\n/);

  formatted = sections
    .map((section) => {
      // Check if this section contains bullet points or numbered lists
      if (
        section.includes('• ') ||
        section.includes('- ') ||
        /\d+\.\s/.test(section)
      ) {
        const lines = section.split('\n');
        let processedSection = '';
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();

          if (
            line.startsWith('• ') ||
            line.startsWith('- ') ||
            /^\d+\.\s/.test(line)
          ) {
            // This is a bullet point or numbered list item
            if (!inList) {
              processedSection +=
                '<ul style="margin: 4px 0; padding-left: 0; list-style: none;">';
              inList = true;
            }
            // Handle both bullet points and numbered lists
            let bulletContent = '';
            let bulletSymbol = '•';

            if (line.startsWith('• ')) {
              bulletContent = line.replace(/^•\s*/, '');
              bulletSymbol = '•';
            } else if (line.startsWith('- ')) {
              bulletContent = line.replace(/^-\s*/, '');
              bulletSymbol = '•';
            } else if (/^\d+\.\s/.test(line)) {
              const match = line.match(/^(\d+)\.\s*(.*)/);
              if (match) {
                bulletContent = match[2];
                bulletSymbol = match[1] + '.';

                // Handle cases where content starts with a colon (like "1. Deep Listening: content")
                // Clean up any leading colons and extra spaces
                bulletContent = bulletContent.replace(/^:\s*/, '');
              }
            }

            processedSection += `<li style="margin: 2px 0; padding-left: 20px; position: relative; line-height: 1.5;"><span style="color: #667eea; font-weight: bold; position: absolute; left: 0; top: 0;">${bulletSymbol}</span>${bulletContent}</li>`;
          } else {
            // This is not a bullet point
            if (inList) {
              processedSection += '</ul>';
              inList = false;
            }
            if (line.trim() !== '') {
              // Handle section headers properly
              if (line.includes('**') && line.includes(':')) {
                // This is a section header with a colon - remove extra spaces after colon
                const cleanedLine = line.replace(/:\s+/g, ':');
                processedSection += `<div style="margin: 4px 0; line-height: 1.4;">${cleanedLine}</div>`;
              } else {
                processedSection += `<div style="margin: 4px 0; line-height: 1.4;">${line}</div>`;
              }
            }
          }
        }

        if (inList) {
          processedSection += '</ul>';
        }

        return processedSection;
      } else {
        // No bullet points, just add line breaks and handle headers
        let cleanedSection = section.replace(/:\s+/g, ':');
        // Remove newlines immediately after section headers (headers with ** and :)
        cleanedSection = cleanedSection.replace(/(\*\*[^*]+\*\*:)\n/g, '$1');
        return cleanedSection.replace(/\n/g, '<br>');
      }
    })
    .join('<div style="height: 8px;"></div>');

  // Replace custom button tags with consistent, mobile-responsive buttons
  const baseButtonClass =
    'inline-flex items-center px-3 py-1.5 sm:px-2 sm:py-1 bg-gradient-to-r text-white rounded-md font-medium text-sm sm:text-xs shadow-md hover:shadow-lg transition-all duration-200 mx-1 my-1 cursor-pointer min-h-[36px] sm:min-h-[32px] touch-manipulation';

  formatted = formatted
    .replace(
      /<button-experience>(.*?)<\/button-experience>/g,
      `<button onclick="window.chatbotButtonClick('experience')" class="${baseButtonClass} from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">$1</button>`
    )
    .replace(
      /<button-skills>(.*?)<\/button-skills>/g,
      `<button onclick="window.chatbotButtonClick('skills')" class="${baseButtonClass} from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">$1</button>`
    )
    .replace(
      /<button-projects>(.*?)<\/button-projects>/g,
      `<button onclick="window.chatbotButtonClick('projects')" class="${baseButtonClass} from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">$1</button>`
    )
    .replace(
      /<button-funfact>(.*?)<\/button-funfact>/g,
      `<button onclick="window.chatbotButtonClick('funfact')" class="${baseButtonClass} from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700">$1</button>`
    )
    .replace(
      /<button-message>(.*?)<\/button-message>/g,
      `<button onclick="window.chatbotButtonClick('message')" class="${baseButtonClass} from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">$1</button>`
    )
    .replace(
      /<button-meeting>(.*?)<\/button-meeting>/g,
      `<button onclick="window.chatbotButtonClick('meeting')" class="${baseButtonClass} from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">$1</button>`
    )
    .replace(
      /<button-upload>(.*?)<\/button-upload>/g,
      `<button onclick="window.chatbotButtonClick('upload')" class="${baseButtonClass} from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700">$1</button>`
    )
    .replace(
      /<button-generate-question>(.*?)<\/button-generate-question>/g,
      `<button onclick="window.chatbotButtonClick('generate-question')" class="${baseButtonClass} from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">$1</button>`
    )
    .replace(
      /<button-linkedin>(.*?)<\/button-linkedin>/g,
      `<button onclick="window.open('${siteConfig.links.linkedin}', '_blank')" class="${baseButtonClass} from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">$1</button>`
    )
    .replace(
      /<button-resume>(.*?)<\/button-resume>/g,
      `<button onclick="window.open('${siteConfig.links.resume}', '_blank')" class="${baseButtonClass} from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800">$1</button>`
    )
    .replace(
      /<button-testimonials>(.*?)<\/button-testimonials>/g,
      `<button onclick="(() => { const testimonialsSection = document.getElementById('testimonials'); if (testimonialsSection) { testimonialsSection.scrollIntoView({ behavior: 'smooth' }); } })()" class="${baseButtonClass} from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">$1</button>`
    )
    .replace(
      /<button-about>(.*?)<\/button-about>/g,
      `<button onclick="(() => { const aboutSection = document.getElementById('about'); if (aboutSection) { aboutSection.scrollIntoView({ behavior: 'smooth' }); } })()" class="${baseButtonClass} from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">$1</button>`
    );

  // Handle special scroll-to-projects button that closes chatbot
  formatted = formatted.replace(
    /<button-projects-scroll>(.*?)<\/button-projects-scroll>/g,
    `<button onclick="window.scrollToProjectsAndClose && window.scrollToProjectsAndClose()" class="${baseButtonClass} from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl">$1</button>`
  );

  // Wrap button groups for better display with tighter spacing
  formatted = formatted.replace(
    /(<button[^>]*>.*?<\/button>(?:\s*<button[^>]*>.*?<\/button>)+)/g,
    '<div style="display: flex; flex-wrap: wrap; gap: 4px; margin: 8px 0; align-items: center;">$1</div>'
  );

  // Special styling for typed commands - make them more visible and attractive
  formatted = formatted
    .replace(
      /`\/message`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/message</span>'
    )
    .replace(
      /`\/meeting`/g,
      '<span class="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 mx-1">/meeting</span>'
    );

  // Handle other code blocks (not commands)
  formatted = formatted.replace(
    /`([^\/][^`]*)`/g,
    '<code class="bg-blue-50 text-blue-700 px-2 py-1 rounded font-mono text-sm border border-blue-200">$1</code>'
  );

  // Add love-themed styling if in love mode
  if (isLoveMode) {
    formatted = formatted
      .replace(
        /friend/g,
        '<span class="text-pink-600 font-semibold">friend</span>'
      )
      .replace(/love/g, '<span class="text-red-500 font-medium">love</span>')
      .replace(
        /beautiful/g,
        '<span class="text-purple-500 font-medium">beautiful</span>'
      )
      .replace(/sweet/g, '<span class="text-pink-500 font-medium">sweet</span>')
      .replace(/heart/g, '<span class="text-red-500">❤️</span>')
      .replace(/💕/g, '<span class="text-pink-500">💕</span>');
  }

  return formatted;
}
