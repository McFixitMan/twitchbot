import * as chalk from 'chalk';

import { In, Not } from 'typeorm';
import { LEVEL_COMMAND, LEVEL_STATE, QUEUE_STATE } from './enums';

import { BotState } from '../../database/entities/botState';
import { LevelState } from '../../database/entities/levelState';
import { Queue } from '../../database/entities/queue';
import { QueueItem } from '../../database/entities/queueItem';
import { QueueRecord } from './types/queueRecord';
import { QueueState } from '../../database/entities/queueState';
import { SocketEvent } from '../../types/socketEvent';
import { Server as SocketServer } from 'socket.io';
import { getDateDifference } from '../../utility/dateHelper';
import { getWeightedRandomIndex } from '../../utility/randomHelper';

export class QueueManager {
    private _socketServer: SocketServer | undefined;
    constructor(io?: SocketServer) {
        this._socketServer = io;
    }
    
    getBotState = async(): Promise<BotState> => {
        const botState = await BotState.findOne(1);

        if (!botState) {
            throw new Error('No bot state. This kills the bot');
        }

        return botState;
    };

    getCurrentQueue = async (): Promise<Queue | undefined> => {
        const botState = await this.getBotState();

        return botState.activeQueue ?? undefined;
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
        const botState = await this.getBotState();

        return botState.activeQueueItem ?? undefined;
    };

    /**
     * Remove the current QueueItem from the Queue entirely
     * @returns The removed QueueItem
     */
    removeCurrentLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();

        const currentLevel = botState.activeQueueItem;
        if (!currentLevel) {
            throw new Error('No current level');
        }

        botState.activeQueueItem = null;
        await botState.save();
        await currentLevel.remove();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return currentLevel;
    };

    /**
     * Remove the current QueueItem from bot state and return the QueueItem to its original position
     * @returns The unselected QueueItem
     */
    unselectCurrentLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();

        const levelStates = await LevelState.find();

        if (!botState.activeQueueItem) {
            // No current level, nothing to requeue
            throw new Error('There is no current level');
        }

        botState.activeQueueItem.levelState = levelStates.find(x => x.code === 'unplayed');
        await botState.activeQueueItem.save();

        const removedLevel = {
            ...botState.activeQueueItem,
        } as QueueItem;

        botState.activeQueueItem = null;
        botState.startedAt = null;

        await botState.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return removedLevel;
    };

    /**
     * Remove the current QueueItem from bot state and move the QueueItem to the end of the Queue
     * @returns The re-queued QueueItem
     */
    reQueueCurrentLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();

        const levelStates = await LevelState.find();

        if (!botState.activeQueueItem) {
            // No current level, nothing to requeue
            throw new Error('There is no current level');
        }

        botState.activeQueueItem.levelState = levelStates.find(x => x.code === 'unplayed');
        botState.activeQueueItem.createdAt = new Date();
        await botState.activeQueueItem.save();

        const removedLevel = {
            ...botState.activeQueueItem,
        } as QueueItem;

        botState.activeQueueItem = null;
        botState.startedAt = null;

        await botState.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return removedLevel;
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
            throw new Error(`${username}, is not in the queue!`);
        }

        await existingEntry.remove();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return existingEntry;
    };

    addQueueItemToCurrentQueue = async (levelCode: string, username: string, isMod: boolean, isVip: boolean, isSub: boolean, isMakerCode: boolean): Promise<QueueItem> => {
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
            throw new Error(`${username}, you're already in the queue! You can use the !replace command to change your entry`);
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
        queueItem.isMakerCode = isMakerCode;

        await queueItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return queueItem;
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

        await existingEntry.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return existingEntry;
    };

    getUserPosition = async(username: string): Promise<number | undefined> => {
        const list = await this.getCurrentQueueItems();

        if (!list) {
            throw new Error(`There is no current queue!`);
        }

        const index = list.findIndex(x => x.username === username);
        if (index > -1) {
            return index + 1;
        } else {
            return undefined;
        }
    };

    setNextLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Resolve the current level before selecting a new one!`);
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
        await nextItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextItem;
    };

    setSubNextLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Resolve the current level before selecting a new one!`);
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
        await nextItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextItem;
    };

    setRandomLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();

        if (!!botState.activeQueueItem) {
            throw new Error(`Resolve the current level before selecting a new one!`);
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
        await nextItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextItem;
    };

    setWeightedRandomLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();

        if (!!botState.activeQueueItem) {
            throw new Error(`Resolve the current level before selecting a new one!`);
        }
    
        const progressLevelState = await LevelState.findOne({
            where: {
                code: 'inprogress',
            },
        });
    
        if (!progressLevelState) {
            throw new Error('Couldnt find the right level state... blame the dev for this travesty');
        }
    
        botState.lastCommand = LEVEL_COMMAND.random;
        await botState.save();
    
        const list = await this.getCurrentQueueItems();
    
        if (!list || list.length === 0) {
            throw new Error('There are no levels in the queue!');
        }

        const now = new Date();

        const dateDiffs: Array<number> = [];

        // Our 'weights' will just be the total time between when each level was added and now
        for (let i = 0; i < list.length; i++) {
            dateDiffs.push(now.getTime() - list[i].createdAt.getTime());
        }
    
        // Get the index for the result of our weighted random
        const nextItemIndex = getWeightedRandomIndex(dateDiffs);

        const nextItem = list[nextItemIndex];
        
        botState.activeQueueItem = nextItem;
        botState.startedAt = new Date();
    
        nextItem.levelState = progressLevelState;
    
        await botState.save();
        await nextItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextItem;
    };

    setSubRandomLevel = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();
    
        if (!!botState.activeQueueItem) {
            throw new Error(`Resolve the current level before selecting a new one!`);
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
        await nextItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextItem;
    };

    setCurrentLevelAsLoss = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();
    
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

        this._socketServer?.emit(SocketEvent.queueChanged);
    
        return currentItem;
    };

    setCurrentLevelAsWin = async(): Promise<QueueItem> => {
        const botState = await this.getBotState();
    
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

        this._socketServer?.emit(SocketEvent.queueChanged);
    
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
    
        await existingEntry.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return existingEntry;
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
    
        const botState = await this.getBotState();

        const levelStates = await LevelState.find();
    
        if (!!botState.activeQueueItem) {
            // If there's a current level, set it back to 'unplayed'
            botState.activeQueueItem.levelState = levelStates.find(x => x.code === 'unplayed');
            await botState.activeQueueItem.save();
        }
    
        botState.activeQueueItem = nextEntry;
        botState.startedAt = new Date();
    
        nextEntry.levelState = levelStates.find(x => x.code === 'inprogress');
    
        await botState.save();
        await nextEntry.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return nextEntry;
    };

    getPlayTime = async(): Promise<string> => {
        const botState = await this.getBotState();
    
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

        await queueItem.save();

        this._socketServer?.emit(SocketEvent.queueChanged);

        return queueItem;
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
        const botState = await this.getBotState();

        botState.activeQueue = createdQueue;
        botState.activeQueueItem = null;
        botState.lastCommand = null;

        await botState.save();

        this._socketServer?.emit(SocketEvent.queueChanged);
        
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
    
        this._socketServer?.emit(SocketEvent.queueChanged);

        return queueState;
    };

    endCurrentQueue = async(): Promise<void> => {
        const botState = await this.getBotState();
    
        botState.activeQueue = null;
        botState.activeQueueItem = null;
        
        await botState.save();

        this._socketServer?.emit(SocketEvent.queueChanged);
    };

    loadLastQueue = async(): Promise<Queue | undefined> => {
        const botState = await this.getBotState();

        const lastQueue = await Queue.findOne({
            where: {
                id: Not(botState.activeQueue?.id),
            },
            order: {
                createdAt: 'DESC',
            },
        });
    
        botState.activeQueue = lastQueue ?? null;

        await botState.save();

        this._socketServer?.emit(SocketEvent.queueChanged);
    
        return lastQueue;
    };

    getCurrentQueueRecord = async(): Promise<QueueRecord> => {
        const botState = await this.getBotState();
    
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
        const botState = await this.getBotState();

        return botState.lastCommand ?? undefined;
    };
}

export const createQueueManager = async (io?: SocketServer): Promise<QueueManager> => {
    const qm = new QueueManager(io);

    console.info(chalk.blue(`📖 QueueManager initialized! Now accepting queue commands...`));

    return qm;
};