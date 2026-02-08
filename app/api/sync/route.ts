
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

        const { data: clientData, history: clientHistory, lastUpdated: clientLastUpdatedStr } = await req.json();
        const clientLastUpdated = new Date(clientLastUpdatedStr).getTime();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const dbLastUpdated = new Date(user.lastUpdated).getTime();

        // Logic: Last Write Wins (based on timestamp)
        // If client is sending newer data, update DB
        if (clientLastUpdated > dbLastUpdated) {
            // Use findByIdAndUpdate to avoid version conflicts from concurrent updates
            const updateData: any = {
                data: clientData,
                lastUpdated: new Date(clientLastUpdated)
            };

            if (clientHistory) {
                updateData.history = clientHistory;
            }

            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true }
            );

            return NextResponse.json({
                action: 'synced_to_server',
                data: updatedUser?.data,
                history: updatedUser?.history,
                lastUpdated: updatedUser?.lastUpdated
            });
        } else {
            // If DB is newer or equal, send DB data to client
            return NextResponse.json({
                action: 'synced_from_server',
                data: user.data,
                history: user.history,
                lastUpdated: user.lastUpdated
            });
        }

    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
