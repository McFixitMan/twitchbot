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

    setSubNextLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setSubNextLevel();

            chatManager.sendMessage(`[SUBNEXT] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res.status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setSubRandomLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setSubNextLevel();

            chatManager.sendMessage(`[SUBRANDOM] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
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

    getBotState = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const botState = await queueManager.getBotState();

            return res.status(HttpStatusCode.OK)
                .send(botState);
        } catch (err) {
            return next(err);
        }
    };

    removeCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            const removed = await queueManager.removeCurrentLevel();

            await chatManager.sendMessage(`${removed.username}, your level was removed from the queue!`);

            return res.status(HttpStatusCode.OK)
                .send(removed);
        } catch (err) {
            return next(err);
        }
    };

    unselectCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            const removed = await queueManager.unselectCurrentLevel();

            await chatManager.sendMessage(`${removed.username}, your level was returned to the queue!`);

            return res.status(HttpStatusCode.OK)
                .send(removed);
        } catch (err) {
            return next(err);
        }
    };

    reQueueCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            const reQueued = await queueManager.reQueueCurrentLevel();

            const newPosition = await queueManager.getUserPosition(reQueued.username);

            await chatManager.sendMessage(`${reQueued.username}, your level was put into the back of the queue. You are in position ${newPosition}`);

            return res.status(HttpStatusCode.OK)
                .send(reQueued);
        } catch (err) {
            return next(err);
        }
    };
}

const queueController = new QueueController();

export { queueController };