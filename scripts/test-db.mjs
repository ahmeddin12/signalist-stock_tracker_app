import mongoose from 'mongoose';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

// Minimal .env loader (so we don’t add dependencies)
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
        const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
        if (m) {
            const key = m[1];
            let val = m[2];
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith('\'') && val.endsWith('\''))) {
                val = val.slice(1, -1);
            }
            if (!(key in process.env)) process.env[key] = val;
        }
    }
}
const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('ERROR: MONGODB_URI is not set in .env');
    process.exit(1);
}

// Prevent long hangs
mongoose.set('bufferCommands', false);

const start = Date.now();
mongoose.connect(uri, { serverSelectionTimeoutMS: 7000 })
    .then((conn) => {
        const ms = Date.now() - start;
        console.log(`[OK] Connected to MongoDB in ${ms}ms. Mongoose version: ${conn.version}`);
        return mongoose.connection.close();
    })
    .then(() => process.exit(0))
    .catch((err) => {
        console.error('[FAIL] MongoDB connection failed:');
        console.error(err?.message || err);
        if (err?.reason?.code === 'ENOTFOUND') console.error('Hint: Check your network/DNS.');
        process.exit(2);
    });