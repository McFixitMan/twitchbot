import * as botCommands from './commands';
import * as chalk from 'chalk';

import { BitMessage, PubSubManager, RedemptionMessage, SubMessage, WhisperMessage, createPubSub } from './services/pubSub';
import { ChatManager, ChatMessage, createChatManager } from './services/chat';

import { ApiManager } from './services/api';
import { AuthProvider } from '@twurple/auth/lib';
import { BotCommand } from './commands/base/botCommand';
import { QueueManager } from './services/queue';
import { createApiManager } from './services/api/apiManager';
import { createAuthProvider } from './services/auth';
import { createQueueManager } from './services/queue/queueManager';

export class TwitchBot {
    apiManager!: ApiManager;
    chatManager!: ChatManager;
    pubSubManager!: PubSubManager;
    queueManager!: QueueManager;

    private broadcasterAuthProvider: AuthProvider | undefined;
    private botAuthProvider: AuthProvider | undefined;

    private bitCommands: Array<BotCommand<BitMessage>> = [];
    private chatCommands: Array<BotCommand<ChatMessage>> = [];
    private redemptionCommands: Array<BotCommand<RedemptionMessage>> = [];
    private subCommands: Array<BotCommand<SubMessage>> = [];
    private whisperCommands: Array<BotCommand<WhisperMessage>> = [];

    /**
     * Be sure to call initialize()!
     */
    constructor() {
        // Nothing to see here
    }

    initialize = async (): Promise<void> => {
        this.broadcasterAuthProvider = await createAuthProvider('broadcaster');
        this.botAuthProvider = await createAuthProvider('bot');

        await this.configureApiManager(this.broadcasterAuthProvider);
        await this.configureChatManager(this.botAuthProvider);
        await this.configurePubSub(this.broadcasterAuthProvider);
        await this.configureQueueManager();

        console.log(' ');
        console.info(chalk.greenBright(`✅ TwitchBot is live!`));

        this.bitCommands = botCommands.bitCommands.commandList.map((cmd) => {
            return new cmd(this);
        });

        const allChatCommands = [
            ...botCommands.chatCommands.commandList,
            ...botCommands.queueCommands.commandList,
        ];

        this.chatCommands = allChatCommands.map((cmd) => {
            return new cmd(this);
        }); 
        
        this.redemptionCommands = botCommands.redemptionCommands.commandList.map((cmd) => {
            return new cmd(this);
        }); 

        this.subCommands = botCommands.subCommands.commandList.map((cmd) => {
            return new cmd(this);
        });

        this.whisperCommands = botCommands.whisperCommands.commandList.map((cmd) => {
            return new cmd(this);
        });
    };

    private configureApiManager = async (authProvider: AuthProvider): Promise<ApiManager> => {
        this.apiManager = await createApiManager(authProvider);

        await this.apiManager.initialize();

        return this.apiManager;
    };

    private configureChatManager = async (authProvider: AuthProvider): Promise<ChatManager> => {
        this.chatManager = await createChatManager(authProvider, {
            onMessage: async (chatMessage) => {
                const now = new Date();
                console.log(`[${now.toLocaleTimeString()}] ${chatMessage.msg.userInfo.displayName}: ${chatMessage.message}`);

                // Check if message contains a link
                if (!!chatMessage.message.match(/^((?:https?:\/\/)?[^./]+(?:\.[^./]+)+(?:\/.*)?)$/)) {
                    const { userInfo } = chatMessage.msg;

                    // Never block broadcaster
                    if (!userInfo.isBroadcaster) {
                        if (!await this.chatManager.isUserPermitted(userInfo.userName)) {
                            await this.chatManager.deleteMessage(chatMessage.msg.id);
                            await this.chatManager.sendMessage(`What is this, Reddit? No links ${userInfo.displayName}!`);

                            return;
                        } else {
                            // User was permitted, remove permit now that they've sent a link
                            await this.chatManager.removePermit(userInfo.userName);
                        }
                    }
                }

                for (const cmd of this.chatCommands) {
                    try {
                        if (cmd.isCompatible(chatMessage)) {
                            await cmd.execute(chatMessage);
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(chalk.redBright(`Error running ${cmd.name}: ${err.stack}`));

                            await this.chatManager.sendMessage(err.message);
                        }
                    }
                }
            },
        });

        return this.chatManager;
    };

    private configurePubSub = async (authProvider: AuthProvider): Promise<PubSubManager> => {
        this.pubSubManager = await createPubSub(authProvider, {
            onSubscription: (message) => {
                for (const cmd of this.subCommands) {
                    try {
                        if (cmd.isCompatible(message)) {
                            cmd.execute(message);
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(chalk.redBright(`Error running ${cmd.name}: ${err.stack}`));

                            this.chatManager.sendMessage(err.message);
                        }
                    }
                }
            },
            onBits: async (message) => {
                for (const cmd of this.bitCommands) {
                    try {
                        if (cmd.isCompatible(message)) {
                            cmd.execute(message);
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(chalk.redBright(`Error running ${cmd.name}: ${err.stack}`));

                            this.chatManager.sendMessage(err.message);
                        }
                    }
                }
            },
            onRedemption: (message) => {
                for (const cmd of this.redemptionCommands) {
                    try {
                        if (cmd.isCompatible(message)) {
                            cmd.execute(message);
                        }
                    } catch (err){ 
                        if (err instanceof Error) {
                            console.log(chalk.redBright(`Error running ${cmd.name}: ${err.stack}`));

                            this.chatManager.sendMessage(err.message);
                        }
                    }
                }
            },
            onWhisper: (message) => {
                for (const cmd of this.whisperCommands) {
                    try {
                        if (cmd.isCompatible(message)) {
                            cmd.execute(message);
                        }
                    } catch (err) {
                        if (err instanceof Error) {
                            console.log(chalk.redBright(`Error running ${cmd.name}: ${err.stack}`));
                            
                            this.chatManager.sendMessage(err.message);
                        }
                    }
                }
            },
        });

        return this.pubSubManager;
    };

    private configureQueueManager = async (): Promise<QueueManager> => {
        this.queueManager = await createQueueManager();

        return this.queueManager;
    };
}