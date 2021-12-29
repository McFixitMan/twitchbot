import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { LEVEL_COMMAND } from '../../services/queue/enums';
import { TwitchBot } from '../../twitchBot';

export class RemoveCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!remove';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const removedLevel = await queueManager.removeCurrentLevel();

        await chatManager.sendMessage(`${removedLevel.username}, your level ${removedLevel.levelCode} has been removed from the queue... ᴵ ˢᵘˢᵖᵉᶜᵗ ᵃᵇˢᵉⁿᵗᵉᵉᶦˢᵐ`);
    };
}