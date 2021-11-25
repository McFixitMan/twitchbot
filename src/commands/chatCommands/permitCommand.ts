import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class PermitCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster && !chatMessage.msg.userInfo.isMod) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!permit ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager } = this.twitchBot;

        let query = chatMessage.message.toLowerCase().replace('!permit ', '').trim();

        if (query.startsWith('@')) {
            query = query.replace('@', '');
        }

        await chatManager.permitLink(query);
        
        await chatManager.sendMessage(`${query}, you have been permitted to send a link within 60 seconds!`);
    };
}