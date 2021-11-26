import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class CreatePredictionCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!prediction ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const title = chatMessage.message.toLowerCase().replace('!prediction ', '');

        const voteDuration = 120;

        await apiManager.createPrediction(title, voteDuration, async() => {
            await chatManager.sendMessage(`The prediction is all set... Go for it ${this.broadcasterName}!`);
        });

        await chatManager.sendMessage(`${this.broadcasterName}, you have ${voteDuration} seconds to go grab a drink... Everyone else get your votes in!`);
    };
}