import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';

export class AddCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase().startsWith('!add ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const levelCodeMatch = chatMessage.message.match(/(([a-hj-np-yA-Z0-9]{3}-){2}[a-hj-np-yA-Z0-9]{2}[gGfFhH])/);
    
        if (!levelCodeMatch || !levelCodeMatch[0]) {
            await chatManager.sendMessage(`${chatMessage.msg.userInfo.displayName}, it looks like the level you entered is invalid!`);
        
            return;
        }

        const { userInfo } = chatMessage.msg;

        const levelCode = levelCodeMatch[0].toUpperCase();
        const isMod = userInfo.isMod;
        const isVip = userInfo.isVip;
        const isSub = userInfo.isSubscriber;

        await queueManager.addQueueItemToCurrentQueue(levelCode, userInfo.userName, isMod, isVip, isSub);

        const position = await queueManager.getUserPosition(userInfo.userName);

        await chatManager.sendMessage(`${userInfo.displayName}, your level ${levelCode} has been added to the queue! You're in position ${position}`);
    };
}