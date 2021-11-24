import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class GameInfoCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!game' || chatMessage.message.toLowerCase() === '!gameinfo';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const gameInfo = await apiManager?.getGameInfo();

        if (!!gameInfo) {
            chatManager.sendMessage(`There are currently ${gameInfo.numberOfStreams} different streams of ${gameInfo.gameName}, with a total of ${gameInfo.totalViewers} viewers... what are you doing HERE?`);
        } else {
            chatManager.sendMessage('I had some trouble getting game info :(');
        }
    };
}