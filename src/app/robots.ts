import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/studio', '/ai-tools'],
    },
    sitemap: 'https://www.dautubds.io.vn/sitemap.xml',
  }
}
