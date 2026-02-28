import { MetadataRoute } from 'next';
import { SYLLABUS } from '@/lib/syllabus';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://cafinaltracker.vercel.app';

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/signup`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/settings`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/stats`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    const dynamicRoutes: MetadataRoute.Sitemap = SYLLABUS.map((subject) => ({
        url: `${baseUrl}/subject/${subject.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
    }));

    return [...staticRoutes, ...dynamicRoutes];
}
