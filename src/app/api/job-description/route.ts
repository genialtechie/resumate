export const runtime = 'edge'; // Use Edge Runtime

import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Try direct fetch with appropriate headers
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    // Try selectors to find the job description
    let descriptionText = '';
    const selectors = [
      // LinkedIn selectors
      '.description',
      '.show-more-less-html__markup',
      '[data-job-description]',
      '.jobs-description__content',
      '[data-decorated="jobs-description-container"]',

      // Indeed selectors
      '#jobDescriptionText',
      '.jobsearch-jobDescriptionText',

      // General selectors
      '.job-description',
      '[data-automation="jobDescription"]',
      '[itemprop="description"]',
      '.job-detail-description',
      '.job-info',
      '.details-info',
      'section.description',
      '.vacancy-section',
      '.vacancy-description',

      // Fall back to body content if needed
      'article',
      '[role="main"]',
      'main',
    ];

    // Extract and clean text
    for (const selector of selectors) {
      const elements = $(selector);
      if (elements.length) {
        // Get the text and clean it
        descriptionText = cleanJobDescription(elements.text());
        break;
      }
    }

    if (!descriptionText) {
      return NextResponse.json(
        { error: 'Could not find job description on the page' },
        { status: 404 }
      );
    }

    return NextResponse.json({ description: descriptionText });
  } catch (error) {
    console.error('Error scraping job description:', error);
    return NextResponse.json(
      { error: 'Failed to scrape job description' },
      { status: 500 }
    );
  }
}

// Clean up job description text
function cleanJobDescription(text: string): string {
  return (
    text
      // Replace multiple newlines with single newline
      .replace(/(\r\n|\n|\r){2,}/g, '\n')
      // Replace multiple spaces with single space
      .replace(/\s{2,}/g, ' ')
      // Trim whitespace
      .trim()
      // Split into paragraphs and re-join with double newlines for readability
      .split(/\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n\n')
  );
}
