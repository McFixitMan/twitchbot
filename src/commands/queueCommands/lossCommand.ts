import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class LossCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!loss' ||
            chatMessage.message.toLowerCase() === '!lose' ||
            chatMessage.message.toLowerCase() === '!defeat';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const completedLevel = await queueManager.setCurrentLevelAsLoss();

        await chatManager.sendMessage(`${completedLevel.username}, ${this.broadcasterName} couldn't beat your level and they're really sorry about that.`);
    };
}