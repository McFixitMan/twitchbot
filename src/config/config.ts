
export const botConfig = {
    auth: {
        clientId: process.env.CLIENT_ID ?? '',
        clientSecret: process.env.CLIENT_SECRET ?? '',
    },
    broadcaster: {
        username: process.env.BROADCASTER ?? '',
    },
    database: {
        host: process.env.DATABASE_HOST ?? '',
        port: parseInt(process.env.DATABASE_PORT ?? '3306'),
        username: process.env.DATABASE_USERNAME ?? '',
        password: process.env.DATABASE_PASSWORD ?? '',
        name: process.env.DATABASE_NAME ?? '',
    },
};