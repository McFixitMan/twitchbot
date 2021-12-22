import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

const RESOLVE_REGEX = /^(?:!resolve|!resolveprediction|!resolvepred|!endprediction) (1|2)/i;

export class ResolvePredictionCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        const isMatch = RESOLVE_REGEX.test(chatMessage.message);
        return isMatch;
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const resolveMatch = chatMessage.message.match(RESOLVE_REGEX);
        if (!resolveMatch || !resolveMatch[1]) {
            await chatManager.sendMessage('Command was in an invalid format to resolve prediction');

            return;
        }
        
        const outcome = parseInt(resolveMatch[1]) as 1 | 2;
        
        await apiManager.resolvePrediction(outcome);

        if (outcome === 1) {
            await chatManager.sendMessage(`Good job believers! :)`);
        } else {
            await chatManager.sendMessage(`Doubters suck but in this case they were right :(`);
        }
    };
}