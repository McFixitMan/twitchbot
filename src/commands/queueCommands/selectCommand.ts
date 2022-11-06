import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class SelectCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!select ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        let query = chatMessage.message.toLowerCase().replace('!select', '').trim();

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        const selectedItem = await queueManager.selectUserLevel(query);

        await chatManager.sendAnnouncement(`${selectedItem.username}'s level (${selectedItem.levelCode}) is now up because ${this.broadcasterName} said so!`);
    };
}