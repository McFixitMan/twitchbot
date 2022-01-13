import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class EmoteOnlyCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!emoteonly';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager } = this.twitchBot;

        await chatManager.enableEmoteOnlyMode();
        await chatManager.sendMessage(`An anonymous cheerer thought they were clever, so now we're in emote-only mode for 2 minutes`);

        setTimeout(async () => {
            await chatManager.disableEmoteOnlyMode();
            await chatManager.sendMessage('Emote-only mode has been disabled');
        }, 1000 * 60 * 2);
    };
}