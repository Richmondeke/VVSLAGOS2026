import * as dotenv from 'dotenv';
dotenv.config();

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildApp } from '../src/app.js';

let appInstance: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!appInstance) {
        appInstance = await buildApp();
        await appInstance.ready();
    }
    
    appInstance.server.emit('request', req, res);
}
