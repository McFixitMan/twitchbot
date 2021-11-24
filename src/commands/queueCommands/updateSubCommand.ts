import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class UpdateSubCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!updatesub ';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        let query = chatMessage.message.toLowerCase().replace('!updatesub', '').trim();

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        const updatedItem = await queueManager.updateSub(query);

        await chatManager.sendMessage(`Marked ${updatedItem.username}'s level as a sub!'`);
    };
}