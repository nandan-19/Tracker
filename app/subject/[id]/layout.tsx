import { SYLLABUS } from '@/lib/syllabus';
import { Metadata } from 'next';

type Props = {
    params: { id: string };
};

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

    const topChapters = subject.chapters.slice(0, 3);
    let chapterSnippet = 'all key chapters';
    if (topChapters.length === 1) {
        chapterSnippet = `a chapter like ${topChapters[0]}`;
    } else if (topChapters.length === 2) {
        chapterSnippet = `chapters like ${topChapters[0]} and ${topChapters[1]}`;
    } else if (topChapters.length === 3) {
        chapterSnippet = `chapters like ${topChapters[0]}, ${topChapters[1]}, and ${topChapters[2]}`;
    }

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
