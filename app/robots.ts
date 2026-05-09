import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/login', '/signup', '/subject/*'],
            disallow: ['/settings', '/stats'],
        },
        sitemap: 'https://cafinaltracker.vercel.app/sitemap.xml',
    };
}
