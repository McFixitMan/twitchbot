import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class ResolvePredictionCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!resolve ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const winningOutcomeString = chatMessage.message.toLowerCase().replace('!resolve ', '').trim();

        const winningPredictionNumber = Number(winningOutcomeString);
        if (!winningPredictionNumber || isNaN(winningPredictionNumber) || (winningPredictionNumber !== 1 && winningPredictionNumber !== 2)) {
            await chatManager.sendMessage('!resolve must be follwed by either 1 or 2 to select the outcome');

            return;
        }

        await apiManager.resolvePrediction(winningPredictionNumber);

        if (winningPredictionNumber === 1) {
            await chatManager.sendMessage(`Good job believers! :)`);
        } else {
            await chatManager.sendMessage(`Doubters suck but in this case they were right :(`);
        }
    };
}