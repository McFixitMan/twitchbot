import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

const CREATE_PRED_REGEX = /^(?:!prediction|!pred|!startprediction|!startpred) ([\s\S]*)/i;

export class CreatePredictionCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        const isMatch = CREATE_PRED_REGEX.test(chatMessage.message);

        return isMatch;
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const createPredictionMatch = chatMessage.message.match(CREATE_PRED_REGEX);
        if (!createPredictionMatch || !createPredictionMatch[1]) {
            await chatManager.sendMessage('Command was in an invalid format to create a prediction');

            return;
        }

        const predictionTitle = createPredictionMatch[1];

        const voteDuration = 120;

        await apiManager.createPrediction(predictionTitle, voteDuration, async() => {
            await chatManager.sendMessage(`The prediction is all set... Go for it ${this.broadcasterName}!`);
        });

        await chatManager.sendMessage(`${this.broadcasterName}, you have ${voteDuration} seconds to go grab a drink... Everyone else get your votes in!`);
    };
}