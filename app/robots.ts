import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/signup'],
            disallow: ['/settings', '/stats', '/subject/*'],
        },
        sitemap: 'https://cafinaltracker.vercel.app/sitemap.xml',
    };
}
