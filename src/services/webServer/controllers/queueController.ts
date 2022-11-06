import { NextFunction, Request, Response } from 'express';

import { HttpStatusCode } from '../../../constants/httpStatusCode';
import { QUEUE_STATE } from '../../../services/queue/enums';

class QueueController {
    getCurrentQueue = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> =>  {
        const { queueManager } = res.twitchBot;

        try {
            const queue = await queueManager.getCurrentQueue();

            return res
                .status(HttpStatusCode.OK)
                .send(queue);
        } catch (err) {
            return next(err);
        }
    };

    getCurrentQueueItems = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> =>  {
        const { queueManager } = res.twitchBot;

        try {
            const queueItems = await queueManager.getCurrentQueueItems();

            return res
                .status(HttpStatusCode.OK)
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
    
            chatManager.sendAnnouncement(`${currentLevel.username}'s level (${currentLevel.levelCode}) has been selected`);
    
            return res
                .status(HttpStatusCode.OK)
                .send(currentLevel);
        } catch (err) {
            return next(err);
        }
    };

    getCurrentLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const currentLevel = await queueManager.getCurrentLevel();

            return res
                .status(HttpStatusCode.OK)
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

            return res
                .status(HttpStatusCode.OK)
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
    
            return res
                .status(HttpStatusCode.OK)
                .send(lostLevel);
        } catch (err) {
            return next(err);
        }
    };

    setNextLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setNextLevel();

            chatManager.sendAnnouncement(`[NEXT] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res
                .status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setRandomLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setRandomLevel();

            chatManager.sendAnnouncement(`[RANDOM] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res
                .status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setWeightedRandomLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            const nextLevel = await queueManager.setWeightedRandomLevel();

            chatManager.sendAnnouncement(`[W-RANDOM] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);

            return res
                .status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setSubNextLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setSubNextLevel();

            chatManager.sendAnnouncement(`[SUBNEXT] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res
                .status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };

    setSubRandomLevel = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager, chatManager } = res.twitchBot;
    
        try {
            const nextLevel = await queueManager.setSubNextLevel();

            chatManager.sendAnnouncement(`[SUBRANDOM] ${nextLevel.username}, your level ${nextLevel.levelCode} is up!`);
    
            return res
                .status(HttpStatusCode.OK)
                .send(nextLevel);
        } catch (err) {
            return next(err);
        }
    };


    getQueueRecord = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const queueRecord = await queueManager.getCurrentQueueRecord();

            return res
                .status(HttpStatusCode.OK)
                .send(queueRecord);
        } catch (err) {
            return next(err);
        }
    };

    getBotState = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { queueManager } = res.twitchBot;

        try {
            const botState = await queueManager.getBotState();

            return res
                .status(HttpStatusCode.OK)
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

            return res
                .status(HttpStatusCode.OK)
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

            return res
                .status(HttpStatusCode.OK)
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

            return res
                .status(HttpStatusCode.OK)
                .send(reQueued);
        } catch (err) {
            return next(err);
        }
    };

    closeQueue = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { chatManager, queueManager } = res.twitchBot;

        try {
            await queueManager.changeCurrentQueueState(QUEUE_STATE.closed);

            await chatManager.sendAnnouncement('The queue is now closed!');

            return res
                .status(HttpStatusCode.OK)
                .send();
        } catch (err) {
            return next(err);
        }
    };

    openQueue = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => { 
        const { chatManager, queueManager } = res.twitchBot;

        try {
            await queueManager.changeCurrentQueueState(QUEUE_STATE.open);

            await chatManager.sendAnnouncement('The queue is now open!');

            return res
                .status(HttpStatusCode.OK)
                .send();
        } catch (err) {
            return next(err);
        }
    };

    createQueue = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => { 
        const { queueManager } = res.twitchBot;

        try {
            const newQueue = await queueManager.createNewQueue();

            return res
                .status(HttpStatusCode.OK)
                .send(newQueue);
        } catch (err) {
            return next(err);
        }
    };

    loadLastQueue = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => { 
        const { queueManager } = res.twitchBot;

        try {
            const lastQueue = await queueManager.loadLastQueue();

            return res
                .status(HttpStatusCode.OK)
                .send(lastQueue);
        } catch (err) {
            return next(err);
        }
    };

    getMm2LevelInfoByCode = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => { 
        const { mm2ApiManager } = res.twitchBot;

        const code = req.params.code;

        if (!code) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send({ message: 'Code is required' });
        }

        try {
            const levelInfo = await mm2ApiManager.getLevelInfo(code);

            return res
                .status(HttpStatusCode.OK)
                .send(levelInfo);
                
        } catch (err) {
            return next(err);
        }
    };

    getMm2UserInfoByCode = async (req: Request, res: Response, next: NextFunction): Promise<void | Response> => {
        const { mm2ApiManager } = res.twitchBot;

        const code = req.params.code;

        if (!code) {
            return res
                .status(HttpStatusCode.BAD_REQUEST)
                .send({ message: 'Code is required' });
        }

        try {
            const userInfo = await mm2ApiManager.getUserInfo(code);

            return res
                .status(HttpStatusCode.OK)
                .send(userInfo);
                
        } catch (err) {
            return next(err);
        }
    };
}

const queueController = new QueueController();

export { queueController };