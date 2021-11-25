import * as chalk from 'chalk';

import { AuthProvider } from '@twurple/auth/lib';
import { ChatClient } from '@twurple/chat';
import { Listener } from '@d-fischer/typed-event-emitter/lib';
import { TwitchPrivateMessage } from '@twurple/chat/lib/commands/TwitchPrivateMessage';
import { botConfig } from '../../config';

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

    private _channelName: string = botConfig.broadcaster.username;
    private _props: ChatManagerProps = {};

    constructor(authProvider: AuthProvider) {
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

    sendMessage = async (message: string): Promise<void> => {
        await this.chatClient.say(this._channelName, message);
    };

    timeoutUser = async (username: string, timeoutSeconds?: number, reason?: string): Promise<void> => {
        await this.chatClient.timeout(this._channelName, username, timeoutSeconds, reason);
    };

    runCommercial = async (commercialLength: 30 | 60 | 90 | 120 | 150 | 180): Promise<void> => {
        await this.chatClient.runCommercial(this._channelName, commercialLength);
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

export const createChatManager = async (authProvider: AuthProvider, props?: ChatManagerProps): Promise<ChatManager> => {
    if (!authProvider) {
        throw new Error('Auth provider must be initialized before creating chatManager');
    }

    const chatManager = new ChatManager(authProvider);
    await chatManager.initialize(props);

    console.info(chalk.blue(`💬 ChatManager initialized! Now listening to chat messages...`));
        
    return chatManager;
};