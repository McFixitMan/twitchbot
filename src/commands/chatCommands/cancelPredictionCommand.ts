import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class CancelPredictionCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }
        
        return chatMessage.message.toLowerCase() === '!cancel' ||
            chatMessage.message.toLowerCase() === '!cancelprediction' ||
            chatMessage.message.toLowerCase() === '!cancelpred';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        await apiManager.cancelPrediction();

        await chatManager.sendMessage('Prediction cancelled');
    };
}