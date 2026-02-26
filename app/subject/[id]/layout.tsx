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

    return {
        title: `${subject.code} - ${subject.shortName} | CA Final Tracker`,
        description: `Track your preparation progress for ${subject.name} encompassing all chapters.`,
        robots: {
            index: false,
            follow: false,
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
