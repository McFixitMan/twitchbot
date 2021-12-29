import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class LeaveCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!leave';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const { userInfo } = chatMessage.msg;

        const removed = await queueManager.removeUserFromQueue(userInfo.userName);

        await chatManager.sendMessage(`Your level ${removed?.levelCode} has been removed from the queue!`, chatMessage.msg);
    };
}