import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class NewQueueCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!newqueue');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const titleMatch = chatMessage.message.match(/(?<=\s).*/);

        const title = titleMatch?.[0] ?? new Date().toLocaleDateString();
        const queue = await queueManager.createNewQueue(title);

        await chatManager.sendMessage(`Created a new queue called ${queue.title} and set it to be the current queue!`);
    };
}