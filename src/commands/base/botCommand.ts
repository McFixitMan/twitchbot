import { TwitchBot } from '../../twitchBot';
import { botConfig } from '../../config';

export interface BotCommand<MessageType> {
    name: string;
    isCompatible: (message: MessageType) => boolean;
    execute: (message: MessageType) => Promise<void>;
}

export abstract class CommandBase<MessageType> implements BotCommand<MessageType> {
    name: string;
    twitchBot: TwitchBot;
    broadcasterName: string;

    constructor(twitchBot: TwitchBot) {
        this.twitchBot = twitchBot;
        this.name = this.constructor.name;
        this.broadcasterName = botConfig.broadcaster.username;
    }

    /**
     * Whether or not the command is able to execute based on the given message
     * @param message Message passed to the command
     */
    abstract isCompatible(message: MessageType): boolean;
    /**
     * Execute the command
     * @param message Message passed to the command
     */
    abstract execute(message: MessageType): Promise<void>
}

export interface CommandList<MessageType> extends Array<new(twitchBot: TwitchBot) => BotCommand<MessageType>> {}