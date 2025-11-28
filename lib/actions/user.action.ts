'use server'

import {connectToDatabase} from "@/database/mongoose";
import {email} from "zod";
import {util} from "protobufjs";
import toArray = util.toArray;

export const getAllUsersForNewsEmail = async (): Promise<{ id: string; email: string; name: string }[]> => {
    try {
        const mongoose = await connectToDatabase();
        const db = mongoose.connection.db;
        if(!db) throw new Error('MongoDB connection not found');

        const users = await db.collection('user').find(
            {email: { $exists: true, $ne: null}},
            { projection: { _id: 1, id: 1, email: 1, name: 1, country: 1}}).toArray();

        return users.filter((user) => user.email && user.name).map((user) => ({
            id: user.id || user._id?.toString() || '',
            email: user.email,
            name: user.name,
        }))

    }
    catch (err) {
        console.error('Error fetching users for news Email:', err);
        return [];
    }
}
