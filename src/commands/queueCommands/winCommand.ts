import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class WinCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!win' ||
            chatMessage.message.toLowerCase() === '!won' ||
            chatMessage.message.toLowerCase() === '!victory';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const completedLevel = await queueManager.setCurrentLevelAsWin();

        await chatManager.sendMessage(`BOOM! ${completedLevel.username}, ${this.broadcasterName} crushed your level!`);
    };
}