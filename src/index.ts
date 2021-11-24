import * as chalk from 'chalk';

import { TwitchBot } from './twitchBot';

const startServer = async(): Promise<void> => {
    const twitchBot = new TwitchBot();

    await twitchBot.initialize();
};

startServer();

process.on('uncaughtException', (error, origin) => {
    console.log(chalk.redBright(`UNCAUGHT: ${error.message}`));
});