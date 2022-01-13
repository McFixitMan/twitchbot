import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class WeightedRandomCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }
        
        return chatMessage.message.toLowerCase() === '!wrandom' ||
            chatMessage.message.toLowerCase() === '!wrand';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const nextItem = await queueManager.setWeightedRandomLevel();

        await chatManager.sendMessage(`${nextItem.username}, your level ${nextItem.levelCode} is now up!`);
    };
}