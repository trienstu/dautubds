import { MetadataRoute } from 'next'
import { client } from '../../sanity/lib/client'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://dautubds.io.vn'

  // Lấy danh sách slug từ Sanity
  const projects = await client.fetch(`*[_type == "project" && defined(slug.current)] { "slug": slug.current, _updatedAt }`)
  const news = await client.fetch(`*[_type == "post" && defined(slug.current)] { "slug": slug.current, _updatedAt }`)
  const pages = await client.fetch(`*[_type == "page" && defined(slug.current)] { "slug": slug.current, _updatedAt }`)
  const developers = await client.fetch(`*[_type == "developer" && defined(slug.current)] { "slug": slug.current, _updatedAt }`)

  const projectUrls = projects.map((project: any) => ({
    url: `${baseUrl}/du-an/${project.slug}`,
    lastModified: new Date(project._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const newsUrls = news.map((post: any) => ({
    url: `${baseUrl}/tin-tuc/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const pageUrls = pages.map((page: any) => ({
    url: `${baseUrl}/trang/${page.slug}`,
    lastModified: new Date(page._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const developerUrls = developers.map((dev: any) => ({
    url: `${baseUrl}/chu-dau-tu/${dev.slug}`,
    lastModified: new Date(dev._updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/du-an`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tin-tuc`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...projectUrls,
    ...newsUrls,
    ...pageUrls,
    ...developerUrls,
  ]
}
