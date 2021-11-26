import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class ModsCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!mods';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const mods = await apiManager.getModerators();

        if (mods.length === 0) {
            await chatManager.sendMessage('Uh oh... there are no mods!');
        } else {
            await chatManager.sendMessage(`The following users are mods: ${mods.sort((a, b) => a.localeCompare(b)).join(', ')}`);
        }
    };
}