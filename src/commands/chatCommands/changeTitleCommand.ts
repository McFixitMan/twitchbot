import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class ChangeTitleCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster && !chatMessage.msg.userInfo.isMod) {
            return false;
        }

        return chatMessage.message
            .toLowerCase()
            .startsWith('!title ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const newTitle = chatMessage.message.replace('!t ', '');

        await apiManager?.updateTitle(newTitle);

        await chatManager.sendMessage(`Updated the title to ${newTitle}`);
    };
}