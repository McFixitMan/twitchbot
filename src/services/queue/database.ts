import { Connection, createConnection } from 'typeorm';

import { botConfig } from '../../config';

export const databaseInitializer = async (): Promise<Connection> => {

    const connection = await createConnection({
        type: 'mssql',
        host: botConfig.database.host,
        port: botConfig.database.port,
        username: botConfig.database.username,
        password: botConfig.database.password,
        database: botConfig.database.name,
        schema: 'dbo',
        entities: [
            __dirname + '/entities/*.ts',
        ],
        options: {
            enableArithAbort: true,
            encrypt: false,
        },
        logging: ['error'],
        synchronize: false, // allows for code-first if set to true
    });

    return connection;
};