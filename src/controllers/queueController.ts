import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../constants/httpStatusCode';

class QueueController {
    getCurrentQueueItems = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> =>  {
        const { queueManager } = res.twitchBot;

        try {
            const queueItems = await queueManager.getCurrentQueueItems();

            return res.status(HttpStatusCode.OK)
                .send(queueItems);
        } catch (err) {
            return next(err);
        }
    };

    setCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            const username = req.body.username;

            const currentLevel = await queueManager.selectUserLevel(username);
    
            chatManager.sendMessage(`${currentLevel.username}'s level (${currentLevel.levelCode}) has been selected`);
    
            return res.status(HttpStatusCode.OK)
                .send(currentLevel);
        } catch (err) {
            return next(err);
        }
    };

    getCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const currentLevel = await queueManager.getCurrentLevel();

            return res.status(HttpStatusCode.OK)
                .send(currentLevel);
        } catch (err) {
            return next(err);
        }
    };

    winCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;

        try {
            const wonLevel = await queueManager.setCurrentLevelAsWin();

            chatManager.sendMessage(`${wonLevel.username}, your level has been beaten!!`);

            return res.status(HttpStatusCode.OK)
                .send(wonLevel);
        } catch (err) {
            return next(err);
        }
    };

    loseCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;

        try {
            const lostLevel = await queueManager.setCurrentLevelAsLoss();

            chatManager.sendMessage(`${lostLevel.username}, your level was just too hard. Sorry :(`);
    
            return res.status(HttpStatusCode.OK)
                .send(lostLevel);
        } catch (err) {
            return next(err);
        }
    };

    setNextLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setNextLevel();

            chatManager.sendMessage(`[NEXT] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res.status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setRandomLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setRandomLevel();

            chatManager.sendMessage(`[RANDOM] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res.status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    getQueueRecord = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const queueRecord = await queueManager.getCurrentQueueRecord();

            return res.status(HttpStatusCode.OK)
                .send(queueRecord);
        } catch (err) {
            return next(err);
        }
    };
}

const queueController = new QueueController();

export { queueController };