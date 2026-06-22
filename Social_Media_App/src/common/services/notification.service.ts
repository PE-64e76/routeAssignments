import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp, cert, App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_PROJECT_ID, FIREBASE_SERVICE_ACCOUNT_PATH } from '../../config/config.service';

export class NotificationService {

    private client: App;

    constructor() {
        if (FIREBASE_PROJECT_ID && FIREBASE_CLIENT_EMAIL && FIREBASE_PRIVATE_KEY) {
            this.client = initializeApp({
                credential: cert({
                    projectId: FIREBASE_PROJECT_ID,
                    clientEmail: FIREBASE_CLIENT_EMAIL,
                    privateKey: FIREBASE_PRIVATE_KEY,
                })
            });
        } else {
            const serviceAccountPath = FIREBASE_SERVICE_ACCOUNT_PATH || './src/config/my-projects-94bb7-firebase-adminsdk-fbsvc-6a1668f5ab.json';
            const serviceAccount = JSON.parse(readFileSync(resolve(serviceAccountPath), 'utf8')) as Record<string, unknown>;
            this.client = initializeApp({ credential: cert(serviceAccount) });
        }
    }

    async sendNotification({
        token,
        data
    }: {
        token: string,
        data: { title: string, body: string; };
    }) {
        const message = {
            token,
            data
        };

        return await getMessaging(this.client).send(message);
    }

    async sendNotifications({
        tokens,
        data
    }: {
        tokens: string[],
        data: { title: string, body: string; };
    }) {
        await Promise.allSettled(
            tokens.map(token => {
                return this.sendNotification({ token, data });
            })
        );
    }
}

export const notificationService = new NotificationService();