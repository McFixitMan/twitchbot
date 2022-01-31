import * as chalk from 'chalk';

import { AuthProvider } from '@twurple/auth/lib';
import { ChatClient } from '@twurple/chat';
import { Chatter } from './types/chatter';
import { ChatterResponse } from './types/chatterResponse';
import { Listener } from '@d-fischer/typed-event-emitter/lib';
import { SocketEvent } from '../../types/socketEvent';
import { Server as SocketServer } from 'socket.io';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import axios from 'axios';
import { getBotConfig } from '../../config';

export type ChatListenerType = 'message';

export interface ChatMessage {
    channel: string, 
    user: string, 
    message: string, 
    msg: TwitchPrivateMessage
}

interface ChatManagerProps {
    onMessage?: (message: ChatMessage) => void;
}

export class ChatManager {
    public chatClient: ChatClient;
    public listeners: Partial<Record<ChatListenerType, Listener>> = {};

    private _channelName: string = getBotConfig().broadcaster.username;
    private _props: ChatManagerProps = {};
    private _permits: Array<string> = [];
    private _socketServer: SocketServer | undefined;

    constructor(authProvider: AuthProvider, io?: SocketServer) {
        this._socketServer = io;

        this.chatClient = new ChatClient({ 
            authProvider: authProvider,
            channels: [
                this._channelName,
            ],
            isAlwaysMod: true,
        });
    }

    initialize = async (props?: ChatManagerProps): Promise<void> => {
        this._props = props ?? {};

        await this.chatClient.connect();
        await this.configureListeners();
    };

    disconnect = async (): Promise<void> => {
        await this.chatClient.quit();
        await this.cleanup();
    };

    sendMessage = async (message: string, replyTo?: string | TwitchPrivateMessage): Promise<void> => {
        const now = new Date();
        
        this._socketServer?.emit(SocketEvent.chatMessage, { 
            badges: {
                isBroadcaster: false,
                isFounder: false,
                isMod: true,
                isSub: false,
                isVip: false,
                isBot: true,
            },
            userColor: '#eb4034',
            username: '[BOT]',
            message: message,
            sentAt: new Date(),
        });

        await this.chatClient.say(this._channelName, message, {
            replyTo: replyTo,
        });
        // await this.chatClient.say(this._channelName, message);
        
        
        console.log(chalk.yellowBright(`[${now.toLocaleTimeString()}] [BOT]: ${message}`));
    };

    timeoutUser = async (username: string, timeoutSeconds?: number, reason?: string): Promise<void> => {
        await this.chatClient.timeout(this._channelName, username, timeoutSeconds, reason);
    };

    deleteMessage = async (messageId: string): Promise<void> => {
        this.chatClient.deleteMessage(this._channelName, messageId);
    };


    runCommercial = async (commercialLength: 30 | 60 | 90 | 120 | 150 | 180): Promise<void> => {
        await this.chatClient.runCommercial(this._channelName, commercialLength);
    };

    permitLink = async (username: string): Promise<void> => {
        if (await this.isUserPermitted(username)) {
            throw new Error(`${username} already has a permit in progress`);
        }
        
        this._permits.push(username);

        setTimeout(() => {
            const index = this._permits.findIndex(user => user === username);

            if (index > -1) {
                this._permits.splice(index, 1);
            }

        }, 60 * 1000);
    };

    removePermit = async (username: string): Promise<void> => {
        const index = this._permits.findIndex(user => user === username);

        if (index > -1) {
            this._permits.splice(index, 1);
        }
    };

    isUserPermitted = async (username: string): Promise<boolean> => {
        const found = this._permits.find(user => user === username);

        return !!found;
    };

    enableEmoteOnlyMode = async (): Promise<void> => {
        await this.chatClient.enableEmoteOnly(this._channelName);
    };

    disableEmoteOnlyMode = async (): Promise<void> => {
        await this.chatClient.disableEmoteOnly(this._channelName);
    };

    getChatters = async (): Promise<Array<Chatter>> => {
        // Unlisted api endpoint to get the list of chatters
        // See: https://discuss.dev.twitch.tv/t/how-can-i-get-chat-list-in-a-channel-by-api/12225


        // Lowercase appears to be required
        const { data }  = await axios.get<ChatterResponse>(`https://tmi.twitch.tv/group/user/${this._channelName.toLowerCase()}/chatters`);

        const { chatters } = data;

        const all = chatters.admins.map(x => { 
            const c: Chatter = {
                username: x,
                isAdmin: true,
            };
            
            return c;
        }).concat(chatters.global_mods.map(x => {
            const c: Chatter = {
                username: x,
                isGlobalMod: true,
            };

            return c;
        })).concat(chatters.moderators.map(x => {
            const c: Chatter = {
                username: x,
                isMod: true,
            };

            return c;
        })).concat(chatters.staff.map(x => {
            const c: Chatter = {
                username: x,
                isStaff: true,
            };

            return c;
        })).concat(chatters.viewers.map(x => {
            const c: Chatter = {
                username: x,
            };

            return c;
        })).concat(chatters.vips.map(x => {
            const c: Chatter = {
                username: x,
                isVip: true,
            };

            return c;
        }));
            
        return all;
    };

    private configureListeners = async (): Promise<void> => {
        this.listeners.message = this.chatClient.onMessage(async (channel, user, message, msg) => {
            this._props.onMessage?.({
                channel: channel,
                user: user,
                message: message.trim(),
                msg: msg,
            });
        });
    };

    private cleanup = async (): Promise<void> => {
        Object.entries(this.listeners).forEach(
            ([key, value]) => {
                console.log(`Cleaning up ${key} listener...`);

                if (!!value) {
                    value.unbind();
                    console.log(`${key} listener removed.`);
                } else {
                    console.log(`No listener for '${key}' exists, skipping.`);
                }

                console.log();
            }
        );
    };
}

export const createChatManager = async (authProvider: AuthProvider, io?: SocketServer, props?: ChatManagerProps): Promise<ChatManager> => {
    if (!authProvider) {
        throw new Error('Auth provider must be initialized before creating chatManager');
    }

    const chatManager = new ChatManager(authProvider, io);
    await chatManager.initialize(props);

    console.info(chalk.blue(`💬 ChatManager initialized! Now listening to chat messages...`));
        
    return chatManager;
};