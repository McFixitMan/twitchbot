import * as botCommands from './commands';
import * as chalk from 'chalk';

import { BitMessage, PubSubManager, RedemptionMessage, SubMessage, WhisperMessage, createPubSub } from './services/pubSub';
import { ChatManager, ChatMessage, createChatManager } from './services/chat';
import { Mm2ApiManager, createMm2ApiManager } from './services/mm2Api';

import { ApiManager } from './services/api';
import { AuthProvider } from '@twurple/auth/lib';
import { BotCommand } from './commands/base/botCommand';
import { QueueManager } from './services/queue';
import { SocketEvent } from './types/socketEvent';
import { Server as SocketServer } from 'socket.io';
import { WebServer } from './services/webServer';
import { createApiManager } from './services/api/apiManager';
import { createAuthProvider } from './services/auth';
import { createQueueManager } from './services/queue/queueManager';

export class TwitchBot {
    apiManager!: ApiManager;
    chatManager!: ChatManager;
    mm2ApiManager!: Mm2ApiManager;
    pubSubManager!: PubSubManager;
    queueManager!: QueueManager;
    webServer!: WebServer;

    private broadcasterAuthProvider: AuthProvider | undefined;
    private botAuthProvider: AuthProvider | undefined;

    private bitCommands: Array<BotCommand<BitMessage>> = [];
    private chatCommands: Array<BotCommand<ChatMessage>> = [];
    private redemptionCommands: Array<BotCommand<RedemptionMessage>> = [];
    private subCommands: Array<BotCommand<SubMessage>> = [];
    private whisperCommands: Array<BotCommand<WhisperMessage>> = [];

    /**
     * Be sure to call start()!
     */
    constructor() {
        // Nothing to see here
    }

    start = async (): Promise<void> => {
        this.broadcasterAuthProvider = await createAuthProvider('broadcaster');
        this.botAuthProvider = await createAuthProvider('bot');

        await this.configureWebServer();
        await this.configureQueueManager(this.webServer.io);
        await this.configureApiManager(this.broadcasterAuthProvider);
        await this.configureMm2ApiManager();
        await this.configureChatManager(this.botAuthProvider, this.webServer.io);
        await this.configurePubSub(this.broadcasterAuthProvider);

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

    private configureMm2ApiManager = async (): Promise<Mm2ApiManager> => {
        this.mm2ApiManager = await createMm2ApiManager();

        return this.mm2ApiManager;
    };

    private configureChatManager = async (authProvider: AuthProvider, io?: SocketServer): Promise<ChatManager> => {
        this.chatManager = await createChatManager(authProvider, io, {
            onMessage: async (chatMessage) => {
                const now = new Date();
                
                console.log(chalk.whiteBright(`[${now.toLocaleTimeString()}] ${chatMessage.msg.userInfo.displayName}: ${chatMessage.message}`));
                
                this.webServer.io?.emit(SocketEvent.chatMessage, { 
                    badges: {
                        isBroadcaster: chatMessage.msg.userInfo.isBroadcaster,
                        isFounder: chatMessage.msg.userInfo.isFounder,
                        isMod: chatMessage.msg.userInfo.isMod,
                        isSub: chatMessage.msg.userInfo.isSubscriber,
                        isVip: chatMessage.msg.userInfo.isVip,
                        isBot: false,
                    },
                    userColor: chatMessage.msg.userInfo.color ?? '#FFFFFF',
                    username: chatMessage.msg.userInfo.displayName,
                    message: chatMessage.message.trim(),
                    sentAt: new Date(),
                });

                // Check if message contains a link
                // https://stackoverflow.com/a/8218223
                if (!!chatMessage.message.match(/((http|ftp|https):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/)) {
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

    private configureQueueManager = async (io?: SocketServer): Promise<QueueManager> => {
        this.queueManager = await createQueueManager(this.webServer.io);

        return this.queueManager;
    };

    private configureWebServer = async (): Promise<WebServer> => {
        this.webServer = new WebServer(this);
        this.webServer.start();

        return this.webServer;
    };
}