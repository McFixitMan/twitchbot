import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class DelayCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!delay';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const delay = await apiManager.getDelaySeconds();

        await chatManager.sendMessage(!!delay ? `The stream currently has a ${delay} second delay` : 'The stream is actually in the future');
    };
}