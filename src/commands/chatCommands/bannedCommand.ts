import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class BannedCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!banned';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const bannedUsers = await apiManager.getBannedUsers();

        if (bannedUsers.length === 0) {
            await chatManager.sendMessage('No users are banned!');
        } else {
            await chatManager.sendMessage(`The following users are banned: ${bannedUsers.sort((a, b) => a.localeCompare(b)).join(', ')}`);
        }
    };
}