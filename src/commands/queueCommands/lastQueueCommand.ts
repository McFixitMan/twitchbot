import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class LastQueueCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!lastqueue';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const queue = await queueManager.loadLastQueue();

        if (!!queue) {
            await chatManager.sendMessage(`Loaded te queue ${queue.title}`);
        } else {
            await chatManager.sendMessage('There was no previous queue to load');
        }
    };
}