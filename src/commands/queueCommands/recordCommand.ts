import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class RecordCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!leave';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const queueRecord = await queueManager.getCurrentQueueRecord();

        if (!queueRecord) {
            throw new Error('I had some trouble getting the queue record. Well this is embarrassing..');
        }
        
        const total = queueRecord.wins + queueRecord.losses;

        if (total <= 0) {
            await chatManager.sendMessage(`It looks like ${this.broadcasterName} hasn't played any levels yet!`);

            return;
        }

        const winRate = `${((queueRecord.wins / total) * 100).toFixed(2)}%`;

        await chatManager.sendMessage(`${this.broadcasterName}'s record for this queue is ${queueRecord.wins} wins and ${queueRecord.losses} losses (${winRate})`);
    };
}