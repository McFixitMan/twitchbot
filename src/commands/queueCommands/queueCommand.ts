import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class QueueCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!queue';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const currentQueue = await queueManager.getCurrentQueue();

        const queueState = currentQueue?.queueState?.label ?? 'Unknown... uh oh.';

        chatManager.sendMessage(!!currentQueue ? `The queue is ${queueState}` : 'There is no current queue!');
    };
}