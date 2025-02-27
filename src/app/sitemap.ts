import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Base URL from environment variables with fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL! || 
                  process.env.NEXT_PUBLIC_VERCEL_URL!
  
  // Ensure baseUrl has correct format
  const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  
  // Current date for lastModified
  const currentDate = new Date()
  
  return [
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add other public pages here as needed
  ]
} 