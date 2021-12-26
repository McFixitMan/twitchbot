import { Response } from 'express-serve-static-core';
import { TwitchBot } from '../../twitchBot';
declare module 'express-serve-static-core' {
    interface Response {
        twitchBot: TwitchBot;
    }
}