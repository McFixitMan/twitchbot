import * as chalk from 'chalk';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { TwitchBot } from './twitchBot';
import { WebServer } from './webServer';
import { databaseInitializer } from './database/database';

dotenv.config({ path: path.resolve(__dirname, './.env') });

const startServer = async(): Promise<void> => {
    await databaseInitializer();

    const twitchBot = new TwitchBot();

    await twitchBot.start();
};

startServer();

process.on('uncaughtException', (error, origin) => {
    console.log(chalk.redBright(`UNCAUGHT: ${error.message}`));
});