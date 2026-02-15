import { NextResponse } from "next/server";

export async function GET() {
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>The AI Product Podcast</title>
    <link>https://www.lawrencehua.com/podcast</link>
    <language>en-us</language>
    <itunes:author>Lawrence Hua</itunes:author>
    <itunes:summary>Conversations about building AI products, shipping fast, and creating real impact</itunes:summary>
    <description>Conversations about building AI products, shipping fast, and creating real impact</description>
    <itunes:image href="https://www.lawrencehua.com/og-image.png"/>
    <itunes:category text="Technology"/>
  </channel>
</rss>`;

  return new NextResponse(rss, { headers: { "Content-Type": "application/xml" } });
}
