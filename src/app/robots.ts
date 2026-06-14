import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/studio'],
    },
    sitemap: 'https://dautubds.io.vn/sitemap.xml',
  }
}
