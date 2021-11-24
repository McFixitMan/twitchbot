import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class SubRandomCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!subrandom';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const nextItem = await queueManager.setSubRandomLevel();

        await chatManager.sendMessage(`${nextItem.username}, your level ${nextItem.levelCode} is now up!`);
    };
}