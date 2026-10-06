import { NextResponse } from 'next/server';
import { siteConfig } from '@/config/site';
const xml = (value: string) =>
  value.replace(
    /[<>&"']/g,
    (char) =>
      ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&apos;',
      })[char]!
  );
export async function GET() {
  const rss = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${xml(siteConfig.podcast.title)}</title><link>${xml(siteConfig.url)}/podcast</link><description>${xml(siteConfig.podcast.description)}</description><author>${xml(siteConfig.name)}</author></channel></rss>`;
  return new NextResponse(rss, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
