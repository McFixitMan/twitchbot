import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class CodeCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        // !code may or may not  include a query
        return chatMessage.message.toLowerCase().startsWith('!code');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const { userInfo } = chatMessage.msg;

        let query = chatMessage.message.toLowerCase().replace('!code', '').trim();

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        if (!!query) {
            // If we have a query it means someone included a username in the command
            const queueItem = await queueManager.getUserQueueItem(query);

            if (!queueItem) {
                await chatManager.sendMessage(`${query} is not in the queue!`);
            } else {
                await chatManager.sendMessage(`The level ${query} has in the queue is ${queueItem.levelCode}`);
            }
            
        } else {
            // No query: get the code for the user that asked
            const queueItem = await queueManager.getUserQueueItem(userInfo.userName);

            if (!queueItem) {
                await chatManager.sendMessage(`${userInfo.displayName} is not in the queue!`);
            } else {
                await chatManager.sendMessage(`${userInfo.displayName}, the level you have in the queue is ${queueItem.levelCode}`);
            }

            
        }
    };
}