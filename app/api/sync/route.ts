
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-me';

async function getUserFromRequest(req: Request) {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function POST(req: Request) {
    try {
        await connectToDatabase();

        const userId = await getUserFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: clientData, lastUpdated: clientLastUpdatedStr } = await req.json();
        const clientLastUpdated = new Date(clientLastUpdatedStr).getTime();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dbLastUpdated = new Date(user.lastUpdated).getTime();

        // Logic: Last Write Wins (based on timestamp)
        // If client is sending newer data, update DB
        if (clientLastUpdated > dbLastUpdated) {
            user.data = clientData;
            user.lastUpdated = new Date(clientLastUpdated);
            await user.save();

            return NextResponse.json({
                action: 'synced_to_server',
                data: user.data,
                lastUpdated: user.lastUpdated
            });
        } else {
            // If DB is newer or equal, send DB data to client
            return NextResponse.json({
                action: 'synced_from_server',
                data: user.data,
                lastUpdated: user.lastUpdated
            });
        }

    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
