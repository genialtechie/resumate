import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  // Base URL from environment variables with fallback
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL! || 
                  process.env.NEXT_PUBLIC_VERCEL_URL!
  
  // Ensure baseUrl has correct format
  const siteUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
} 