import type { MetadataRoute } from "next"
import { mockCourses, mockLabs, mockNewsArticles } from "@/lib/data/mock-data"
import { APP_URL } from "@/lib/config"

/**
 * Auto-generated sitemap for SEO.
 * Includes public pages, courses, and labs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: APP_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${APP_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/pricing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
  ]

  const coursePages: MetadataRoute.Sitemap = mockCourses.map((course) => ({
    url: `${APP_URL}/course/${course.slug}`,
    lastModified: course.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  const labPages: MetadataRoute.Sitemap = mockLabs.map((lab) => ({
    url: `${APP_URL}/labs/${lab.slug}`,
    lastModified: lab.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }))

  const newsPages: MetadataRoute.Sitemap = [
    {
      url: `${APP_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.8,
    },
    ...mockNewsArticles
      .filter((a) => a.status === "published")
      .map((article) => ({
        url: `${APP_URL}/news/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  ]

  return [...staticPages, ...coursePages, ...labPages, ...newsPages]
}
