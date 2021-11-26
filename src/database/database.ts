import * as chalk from 'chalk';

import { Connection, createConnection } from 'typeorm';

import { getBotConfig } from '../config';

export const databaseInitializer = async (): Promise<Connection> => {

    const botConfig = getBotConfig();

    const connection = await createConnection({
        type: 'mysql',
        host: botConfig.database.host,
        port: botConfig.database.port,
        username: botConfig.database.username,
        password: botConfig.database.password,
        database: botConfig.database.name,
        entities: [
            __dirname + '/entities/*.ts',
        ],
        logging: ['error'],
        synchronize: false, // allows for code-first if set to true
    });

    console.log(chalk.blue(`❤️ Database initialized!`));

    return connection;
};