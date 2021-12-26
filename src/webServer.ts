import * as chalk from 'chalk';
import * as compression from 'compression';
import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import * as morgan from 'morgan';

import { HttpError } from './types/errors';
import { HttpStatusCode } from './constants/httpStatusCode';
import { Server as SocketServer } from 'socket.io';
import { TwitchBot } from './twitchBot';
import { getServerConfig } from './config/config';
import { queueRoute } from './routes/queueRoute';

export class WebServer {
    express: express.Application;
    io: SocketServer | undefined;
    twitchBot: TwitchBot;

    private _server: http.Server | undefined;

    private _serverConfig;

    constructor(twitchBot: TwitchBot) {
        this.twitchBot = twitchBot;

        this.express = express();
        this._serverConfig = getServerConfig();

        this.configureMiddleware();
        this.routes();
        this.routeNotFound();
        this.errorHandling();
        this.createHttpServer();
        this.createSocketServer();
        this.handleUncaughtExceptions();
    }

    private configureMiddleware = (): void => {
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            // Attach our twitchbot instance to the response so we can use it in our controllers
            res.twitchBot = this.twitchBot;

            return next();
        });

        this.express.use(compression());
        this.express.use(cors());
        this.express.use(morgan('dev'));
        
        this.express.use(express.json({ limit: '50mb' }));
        this.express.use(express.urlencoded({ extended: true }));
    };

    private routes = (): void => {
        this.express.use(`${this._serverConfig.api.baseRoutePath}/queue`, queueRoute);
    };

    private routeNotFound = (): void => {
        this.express.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err = new HttpError(HttpStatusCode.NOT_FOUND, `No route found at ${req.path}`);

            return next(err);
        });
    };

    private errorHandling = (): void => {
        // this.express.use(logErrors);

        // Return error 
        this.express.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
            if (process.env.NODE_ENV === 'development') {
                console.log(err.stack);
            }

            return res.status(err.status || HttpStatusCode.INTERNAL_SERVER_ERROR)
                .json({
                    message: err.message,
                    success: false,
                });
        });
    };

    private createHttpServer = (): http.Server => {
        this._server = http.createServer(this.express);

        return this._server;
    };

    private createSocketServer = (): SocketServer => {
        this.io = new SocketServer(this._server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        this.io.use(async (socket, next) => {
            // Socket middleware
            next();
        });

        this.io.on('connection', (socket) => {
            socket.on('disconnect', () => {
                // Disconnected
            });

            if (socket.connected) {
                // Connected
            }
        });

        return this.io;
    };    

    private handleUncaughtExceptions = (): void => {
        (process as NodeJS.EventEmitter).on('uncaughtException', (err: { code: string; message: string }) => {
            if (err.code === 'ECONNRESET') {
                console.log(err.message);
            } else {
                console.log(err);
            }
        });

        process.on('unhandledRejection', (reason, p) => {
            console.log(`Unhandled Rejection at Promise: ${p}, Reason: ${reason}`);
        });
    };

    start = (): void => {
        let server = this._server;

        if (!server) {
            server = this.createHttpServer();
        }

        server.listen(this._serverConfig.api.port, () => {
            console.log(chalk.greenBright(`🖥️ Running WebServer on port ${this._serverConfig.api.port}`));
        });
    };
}