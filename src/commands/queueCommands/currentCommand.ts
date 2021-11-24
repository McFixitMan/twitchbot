import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class CurrentCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!current';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const currentLevel = await queueManager.getCurrentLevel();

        if (!currentLevel) {
            await chatManager.sendMessage('There is no current level!');
        } else {
            await chatManager.sendMessage(`The current level is ${currentLevel.levelCode}, submitted by ${currentLevel.username}`);
        }
    };
}