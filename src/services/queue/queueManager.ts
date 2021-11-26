import * as chalk from 'chalk';

import { LEVEL_COMMAND, LEVEL_STATE, QUEUE_STATE } from './enums';

import { BotState } from '../../database/entities/botState';
import { In } from 'typeorm';
import { LevelState } from '../../database/entities/levelState';
import { Queue } from '../../database/entities/queue';
import { QueueItem } from '../../database/entities/queueItem';
import { QueueRecord } from './types/queueRecord';
import { QueueState } from '../../database/entities/queueState';
import { getDateDifference } from '../../utility/dateHelper';

export class QueueManager {
    constructor() {
        // Ok, relax eslint
    }

    getCurrentQueue = async (): Promise<Queue | undefined> => {
        const botState = await BotState.findOne(1);

        return botState?.activeQueue ?? undefined;
    };

    getCurrentQueueItems = async(): Promise<Array<QueueItem>> => {
        const currentQueue = await this.getCurrentQueue();

        if (!currentQueue) {
            throw new Error('There is no current queue');
        }

        const queueItems = await QueueItem.find({
            where: {
                queue: currentQueue,
                levelState: LEVEL_STATE.unplayed,
            },
        });

        return queueItems.sort((a, b) => {
            if (a.isSkip === b.isSkip) {
                return a.createdAt.getTime() - b.createdAt.getTime();
            } else {
                return a.isSkip ? -1 : 1;
            }
        });
    };

    getCurrentLevel = async(): Promise<QueueItem | undefined> => {
        const botState = await BotState.findOne(1);

        return botState?.activeQueueItem ?? undefined;
    };

    removeCurrentLevel = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);

        const currentLevel = botState?.activeQueueItem;
        if (!currentLevel) {
            throw new Error('No current level');
        }

        botState.activeQueueItem = null;
        await botState.save();
        await currentLevel.remove();

        return currentLevel;
    };

    removeUserFromQueue = async(username: string): Promise<QueueItem> => {
        const currentQueue = await this.getCurrentQueue();

        if (!currentQueue) {
            throw new Error('There is no current queue!');
        }

        const existingEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });

        if (!existingEntry) {
            throw new Error(`${username}, you're not in the queue!`);
        }

        await existingEntry.remove();

        return existingEntry;
    };

    addQueueItemToCurrentQueue = async (levelCode: string, username: string, isMod: boolean, isVip: boolean, isSub: boolean): Promise<QueueItem> => {
        const currentQueue = await this.getCurrentQueue();

        if (!currentQueue) {
            throw new Error('There is no current queue');
        }

        if (currentQueue.queueState?.id === QUEUE_STATE.closed) {
            throw new Error(`Sorry ${username}, the queue is closed!`);
        }

        const existingEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });

        if (!!existingEntry) {
            throw new Error(`${username}, you're already in the queue!`);
        }

        const currentEntry = await this.getCurrentLevel();
        if(currentEntry?.username === username) {
            throw new Error(`${username}, your level is being played now! You can add a new level once this is finished`);
        }

        const levelState = await LevelState.findOne({
            where: {
                id: LEVEL_STATE.unplayed,
            },
        });

        const queueItem = new QueueItem();
        queueItem.createdAt = new Date();
        queueItem.levelCode = levelCode,
        queueItem.levelState = levelState,
        queueItem.username = username;
        queueItem.queue = currentQueue;
        queueItem.isMod = isMod;
        queueItem.isVip = isVip;
        queueItem.isSub = isSub;
        queueItem.isSkip = false;

        return await queueItem.save();
    };

    replaceQueueItemInCurrentQueue = async(levelCode: string, username: string, isMod: boolean, isVip: boolean, isSub: boolean): Promise<QueueItem> => {
        const currentQueue = await this.getCurrentQueue();

        if (!currentQueue) {
            throw new Error('There is no current queue');
        }

        const currentEntry = await this.getCurrentLevel();
        if (currentEntry?.username === username) {
            throw new Error(`${username}, your level is being played now. You can't replace it at this point`);
        }

        const existingEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });

        if (!existingEntry) {
            throw new Error(`${username}, you're not in the queue! Add your level with !add`);
        }

        existingEntry.levelCode = levelCode;
        existingEntry.isMod = isMod;
        existingEntry.isVip = isVip;
        existingEntry.isSub = isSub;

        return await existingEntry.save();
    };

    getUserPosition = async(username: string): Promise<number> => {
        const list = await this.getCurrentQueueItems();

        if (!list) {
            throw new Error(`There is no current queue!`);
        }

        const index = list.findIndex(x => x.username === username);
        if (index > -1) {
            return index + 1;
        } else {
            throw new Error(`${username}, you're not in the queue!`);
        }
    };

    setNextLevel = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);

        if (!botState) {
            throw new Error('Unable to retrieve bot state...uh oh.');
        }
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Don't be a dummy, you have to deal with the current level first!`);
        }
    
        const progressLevelState = await LevelState.findOne({
            where: {
                code: 'inprogress',
            },
        });
    
        if (!progressLevelState) {
            throw new Error('Couldnt find the right level state... bad bot is bad');
        }
    
        botState.lastCommand = LEVEL_COMMAND.next;

        await botState.save();
    
        const list = await this.getCurrentQueueItems();
        
        if (!list || list.length === 0) {
            throw new Error('There are no levels in the queue!');
        }
    
        const nextItem = list[0];
        
        botState.activeQueueItem = nextItem;
        botState.startedAt = new Date();
    
        nextItem.levelState = progressLevelState;
    
        await botState.save();
        return await nextItem.save();
    };

    setSubNextLevel = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);
        if (!botState) {
            throw new Error('Unable to retrieve bot state...uh oh.');
        }
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Don't be a dummy, McFixit, you have to deal with the current level first!`);
        }
    
        const progressLevelState = await LevelState.findOne({
            where: {
                code: 'inprogress',
            },
        });
    
        if (!progressLevelState) {
            throw new Error('Couldnt find the right level state... blame McFixit for this travesty');
        }
    
        botState.lastCommand = LEVEL_COMMAND.subnext;
        await botState.save();
    
        const list = await this.getCurrentQueueItems();
        const subList = list.filter((x) => x.isSub);
        if (!subList || subList.length === 0) {
            throw new Error('There are no sub levels in the queue!');
        }
    
        const nextItem = subList[0];
        
        botState.activeQueueItem = nextItem;
        botState.startedAt = new Date();
    
        nextItem.levelState = progressLevelState;
    
        await botState.save();
        return await nextItem.save();
    };

    setRandomLevel = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);
        if (!botState) {
            throw new Error('Unable to retrieve bot state...uh oh.');
        }
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Don't be a dummy, McFixit, you have to deal with the current level first!`);
        }
    
        const progressLevelState = await LevelState.findOne({
            where: {
                code: 'inprogress',
            },
        });
    
        if (!progressLevelState) {
            throw new Error('Couldnt find the right level state... blame McFixit for this travesty');
        }
    
        botState.lastCommand = LEVEL_COMMAND.random;
        await botState.save();
    
        const list = await this.getCurrentQueueItems();
    
        if (!list || list.length === 0) {
            throw new Error('There are no levels in the queue!');
        }
    
        // https://stackoverflow.com/a/5915122
        const nextItem = list[Math.floor(Math.random() * list.length)];
        
        botState.activeQueueItem = nextItem;
        botState.startedAt = new Date();
    
        nextItem.levelState = progressLevelState;
    
        await botState.save();
        return await nextItem.save();
    };

    setSubRandomLevel = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);
        if (!botState) {
            throw new Error('Unable to retrieve bot state...uh oh.');
        }
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Don't be a dummy, McFixit, you have to deal with the current level first!`);
        }
    
        const progressLevelState = await LevelState.findOne({
            where: {
                code: 'inprogress',
            },
        });
    
        if (!progressLevelState) {
            throw new Error('Couldnt find the right level state... blame McFixit for this travesty');
        }
    
        botState.lastCommand = LEVEL_COMMAND.subrandom;
        await botState.save();
    
        const list = await this.getCurrentQueueItems();
        const subList = list.filter((x) => x.isSub);
        if (!subList || subList.length === 0) {
            throw new Error('There are no sub levels in the queue!');
        }
    
        const nextItem = subList[Math.floor(Math.random() * subList.length)];
        
        botState.activeQueueItem = nextItem;
        botState.startedAt = new Date();
    
        nextItem.levelState = progressLevelState;
    
        await botState.save();
        return await nextItem.save();
    };

    setCurrentLevelAsLoss = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);
    
        if (!botState) {
            throw new Error('Unable to retrieve bot state... not good...');
        }
    
        if (!botState.activeQueueItem) {
            throw new Error('There is no current level!');
        }
    
        const lossState = await LevelState.findOne({
            where: {
                code: 'loss',
            },
        });
    
        if (!lossState) {
            throw new Error('Unable to find the loss state... you can blame McFixit for this monstrosity');
        }
    
        const currentItem = botState.activeQueueItem;
    
        currentItem.levelState = lossState;
    
        botState.activeQueueItem = null;
        botState.startedAt = null;
    
        await currentItem.save();
        await botState.save();
    
        return currentItem;
    };

    setCurrentLevelAsWin = async(): Promise<QueueItem> => {
        const botState = await BotState.findOne(1);
        
        if (!botState) {
            throw new Error('Unable to retrieve bot state...uh oh.');
        }
    
        if (!botState.activeQueueItem) {
            throw new Error('There is no current level!');
        }
    
        const winState = await LevelState.findOne({
            where: {
                code: 'win',
            },
        });
    
        if (!winState) {
            throw new Error('Unable to find the win state... you can blame McFixit for this monstrosity');
        }
    
        const currentItem = botState.activeQueueItem;
    
        currentItem.levelState = winState;
    
        botState.activeQueueItem = null;
        botState.startedAt = null;
    
        await currentItem.save();
        await botState.save();
    
        return currentItem;
    };

    updateSub = async(username: string): Promise<QueueItem> => {
        const currentQueue = await this.getCurrentQueue();
    
        if (!currentQueue) {
            throw new Error('There is no current queue');
        }
    
        const existingEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });
    
        if (!existingEntry) {
            throw new Error(`${username} has no unplayed levels in the queue!`);
        }
    
        existingEntry.isSub = true;
    
        return await existingEntry.save();
    };

    selectUserLevel = async(username: string): Promise<QueueItem> => {
        const currentQueue = await this.getCurrentQueue();
    
        if (!currentQueue) {
            throw new Error('There is no current queue');
        }
    
        const nextEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });
    
        if (!nextEntry) {
            throw new Error(`${username} has no unplayed levels in the queue!`);
        }
    
        const botState = await BotState.findOne();
        if (!botState) {
            throw new Error('Unable to retrieve bot state...that\'s not good...');
        }
    
        const levelStates = await LevelState.find();
    
        if (!!botState.activeQueueItem) {
            botState.activeQueueItem.levelState = levelStates.find(x => x.code === 'unplayed');
            await botState.activeQueueItem.save();
        }
    
        botState.activeQueueItem = nextEntry;
        botState.startedAt = new Date();
    
        nextEntry.levelState = levelStates.find(x => x.code === 'inprogress');
    
        await botState.save();
        return await nextEntry.save();
    };

    getPlayTime = async(): Promise<string> => {
        const botState = await BotState.findOne();
        if (!botState) {
            throw new Error('Unable to get the bot state... this is likely bad...');
        }
    
        if (!botState.activeQueueItem) {
            throw new Error('There is no active item in the queue!');
        }
    
        if (!botState.startedAt) {
            throw new Error('There\'s no timestamp for this level... that\'s not good.');
        }
    
        const diff = getDateDifference(new Date(), botState.startedAt);
    
        return diff;
    };

    getUserQueueItem = async(username: string): Promise<QueueItem | undefined> => {
        const currentQueue = await this.getCurrentQueue();
    
        if (!currentQueue) {
            throw new Error('There is no current queue');
        }
    
        const userEntry = await QueueItem.findOne({
            where: {
                username: username,
                levelState: LEVEL_STATE.unplayed,
                queue: currentQueue,
            },
        });
    
        if (!userEntry) {
            return undefined;
        }
    
        return userEntry;
    };

    setUserQueueItemAsSkip = async(username: string): Promise<QueueItem> => {
        const queueItem = await this.getUserQueueItem(username);

        if(!queueItem) {
            throw new Error(`${username} is not in the queue`);
        }

        queueItem.isSkip = true;

        return await queueItem.save();
    };

    createNewQueue = async(title?: string, description?: string): Promise<Queue> => {
        const dt = new Date();
    
        const queueState = await QueueState.findOne({
            where: {
                code: 'closed',
            },
        });
    
        const newQueue = new Queue();
        newQueue.title = title ?? dt.toLocaleDateString();
        newQueue.queueState = queueState;
        newQueue.description = description;
        newQueue.createdAt = new Date();
    
        // Create the queue
        const createdQueue = await newQueue.save();
    
        // Get our bot state and set our active queue to the one we just created
        const botState = await BotState.findOne(1);
        if (!!botState) {
            botState.activeQueue = createdQueue;
            botState.activeQueueItem = null;
            botState.lastCommand = null;
            await botState.save();
        }
        
        return createdQueue;
    };

    changeCurrentQueueState = async(newQueueStateId: QUEUE_STATE): Promise<QueueState> => {
        const queueState = await QueueState.findOne(newQueueStateId);
    
        if (!queueState) {
            throw new Error('Unable to find the supplied queue state!');
        }
    
        const currentQueue = await this.getCurrentQueue();
    
        if (!currentQueue) {
            throw new Error('There is no current queue!');
        }
    
        currentQueue.queueState = queueState;
        await currentQueue.save();
    
        return queueState;
    };

    endCurrentQueue = async(): Promise<void> => {
        const botState = await BotState.findOne(1);
    
        if (!botState) {
            throw new Error('No bot state found!');
        }
    
        botState.activeQueue = null;
        botState.activeQueueItem = null;
        
        await botState.save();
    };

    loadLastQueue = async(): Promise<Queue | undefined> => {
        const botState = await BotState.findOne(1);
    
        if (!botState) {
            throw new Error('No bot state found!');
        }
    
        const lastQueue = await Queue.createQueryBuilder('queue')
            .select('queue')
            .orderBy('queue.createdAt', 'DESC')
            .getOne();
    
        botState.activeQueue = lastQueue ?? null;
        await botState.save();
    
        return lastQueue;
    };

    getCurrentQueueRecord = async(): Promise<QueueRecord> => {
        const botState = await BotState.findOne(1);
    
        if (!botState) {
            throw new Error('No bot state. Thats not good. Yell at McFixit');
        }
    
        if (!botState.activeQueue) {
            throw new Error('There is no active queue!');
        }
    
        const winState = await LevelState.findOne({
            where: {
                code: 'win',
            },
        });
    
        const lossState = await LevelState.findOne({
            where: {
                code: 'loss',
            },
        });
    
        if (!winState || !lossState) {
            throw new Error('Unable to find the states to determine record. McFixit sucks at programming');
        }
    
        const queueItems = await QueueItem.find({
            where: {
                queue: botState.activeQueue,
                levelState: In([LEVEL_STATE.win, LEVEL_STATE.loss]),
            },
        });
    
        if (!queueItems || queueItems.length === 0) {
            throw new Error('There are no completed levels in the queue!');
        }
    
        const wins = queueItems.filter((x) => x.levelState?.id === winState.id).length;
        const losses = queueItems.filter((x) => x.levelState?.id === lossState.id).length;
    
        return {
            queue: botState.activeQueue,
            wins: wins,
            losses: losses,
        };
    };

    getLastCommand = async(): Promise<string | undefined> => {
        const botState = await BotState.findOne();
        if (!botState) {
            throw new Error('Theres no bot state... that means McFixit sucks at programming.');
        }
    
        return botState.lastCommand ?? undefined;
    };
}

export const createQueueManager = async (): Promise<QueueManager> => {
    const qm = new QueueManager();

    console.info(chalk.blue(`📖 QueueManager initialized! Now accepting queue commands...`));

    return qm;
};