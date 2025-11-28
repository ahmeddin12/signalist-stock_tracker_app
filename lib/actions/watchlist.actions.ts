'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
    if (!email) return [];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        // Better Auth stores users in the "user" collection
        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

        if (!user) return [];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [];

        const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
        return items.map((i) => String(i.symbol));
    } catch (err) {
        console.error('getWatchlistSymbolsByEmail error:', err);
        return [];
    }
}
export async function getWatchlistItemsByEmail(email: string): Promise<StockWithData[]> {
    if (!email) return [] as StockWithData[];

    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if (!db) throw new Error('MongoDB connection not found');

        const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });
        if (!user) return [] as StockWithData[];

        const userId = (user.id as string) || String(user._id || '');
        if (!userId) return [] as StockWithData[];

        const items = await Watchlist.find({ userId }, { userId: 1, symbol: 1, company: 1, addedAt: 1 }).lean();
        // Cast to StockWithData minimal shape; pricing/metrics can be enriched later
        const mapped: StockWithData[] = (items || []).map((i: any) => ({
            userId: String(i.userId),
            symbol: String(i.symbol),
            company: String(i.company),
            addedAt: new Date(i.addedAt || Date.now()),
        }));
        return mapped;
    } catch (err) {
        console.error('getWatchlistItemsByEmail error:', err);
        return [] as StockWithData[];
    }
}
