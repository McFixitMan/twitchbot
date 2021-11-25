import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class FollowageCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!followage';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const { userInfo } = chatMessage.msg;
        
        const followage = await apiManager.getFollowAge(userInfo.userId);

        if (!!followage) {
            await chatManager.sendMessage(`${userInfo.displayName}, you've been following ${this.broadcasterName} for ${followage}!`);
        } else {
            await chatManager.sendMessage(`${userInfo.displayName}, you're not following ${this.broadcasterName}... shame on you!`);
        }
    };
}