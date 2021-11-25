import * as chalk from 'chalk';

import { TwitchBot } from './twitchBot';
import { databaseInitializer } from './database/database';

const startServer = async(): Promise<void> => {
    await databaseInitializer();

    const twitchBot = new TwitchBot();

    await twitchBot.initialize();
};

startServer();

process.on('uncaughtException', (error, origin) => {
    console.log(chalk.redBright(`UNCAUGHT: ${error.message}`));
});