import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class RunAdCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!ad';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager } = this.twitchBot;

        await chatManager.runCommercial(30);

        await chatManager.sendMessage('Ran ad');
    };
}