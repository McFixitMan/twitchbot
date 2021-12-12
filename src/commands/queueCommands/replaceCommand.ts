import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { Mm2LevelInfo } from '../../services/mm2Api';
import { TwitchBot } from '../../twitchBot';

export class ReplaceCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase().startsWith('!replace ') ;
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, mm2ApiManager, queueManager } = this.twitchBot;

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

        let levelInfo: Mm2LevelInfo | undefined;

        try {
            levelInfo = await mm2ApiManager.getLevelInfo(levelCode);
        } catch (err) {
            // ignored
        }

        if (!levelInfo) {
            await chatManager.sendMessage(`${userInfo.displayName}, the level you entered was not found! You might want to double-check that code`);

            return;
        }

        await queueManager.replaceQueueItemInCurrentQueue(levelCode, userInfo.userName, isMod, isVip, isSub);

        const position = await queueManager.getUserPosition(userInfo.userName);

        chatManager.sendMessage(`${userInfo.displayName}, you updated your level to "${levelInfo.name}" (${levelCode}) :) You're still in position ${position}`);
    };
}