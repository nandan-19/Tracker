import { SYLLABUS } from '@/lib/syllabus';
import { Metadata } from 'next';

type Props = {
    params: { id: string };
};

function formatChapterSnippet(chapters: string[]): string {
    const topChapters = chapters.slice(0, 3);

    if (topChapters.length === 0) {
        return 'all key chapters';
    }

    if (topChapters.length === 1) {
        return `a chapter like ${topChapters[0]}`;
    }

    if (topChapters.length === 2) {
        return `chapters like ${topChapters[0]} and ${topChapters[1]}`;
    }

    return `chapters like ${topChapters.slice(0, 2).join(', ')}, and ${topChapters[2]}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const id = params.id;
    const subject = SYLLABUS.find((sub) => sub.id === id);

    if (!subject) {
        return {
            title: 'Subject Not Found',
            robots: {
                index: false,
                follow: false,
            }
        };
    }

    const chapterSnippet = formatChapterSnippet(subject.chapters);

    return {
        title: `${subject.code} - ${subject.shortName} | CA Final Tracker`,
        description: `Track your preparation progress for ${subject.name} encompassing ${chapterSnippet}.`,
        robots: {
            index: true,
            follow: true,
        }
    };
}

export default function SubjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
