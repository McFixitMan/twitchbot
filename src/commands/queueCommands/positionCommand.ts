import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class PositionCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!position';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const { userInfo } = chatMessage.msg;

        const position = await queueManager.getUserPosition(userInfo.displayName);

        if (!position) {
            await chatManager.sendMessage(`You're not in the queue!`, chatMessage.msg);
        } else {
            await chatManager.sendMessage(`You're in position ${position}`, chatMessage.msg);
        }
    };
}