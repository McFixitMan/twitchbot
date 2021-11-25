import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class StreamersCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }
        
        return chatMessage.message.toLowerCase() === '!streamers';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const streamersList = await apiManager?.getOtherStreamers();
        
        if (!!streamersList) {
            for (const streamer of streamersList) {
                await chatManager.sendMessage(streamer);
            }
        }
    };
}