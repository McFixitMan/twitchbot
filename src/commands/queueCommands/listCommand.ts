import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class ListCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!list';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        // Actually get the list
        const queueItems = await queueManager.getCurrentQueueItems() ?? [];
        // Respond

        if (!queueItems || queueItems.length === 0) {
            chatManager.sendMessage('There are no levels in the queue!');
        } else {
            const isSingular = queueItems.length === 1;
            chatManager.sendMessage(`There ${isSingular ? 'is' : 'are'} ${queueItems.length} ${isSingular ? 'level' : 'levels'} in the queue: ${queueItems.map((x) => `${x.username}${x.isSkip ? ' (SKIP!)' : ''}`).join(', ')}`);
        }
    };
}