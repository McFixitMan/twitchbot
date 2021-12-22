import { Mm2LevelInfo, Mm2User } from '../../services/mm2Api';

import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { MAKER_CODE_REGEX } from './constants';
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

        const levelCodeMatch = chatMessage.message.match(MAKER_CODE_REGEX);
    
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
        let makerInfo: Mm2User | undefined;

        try {
            levelInfo = await mm2ApiManager.getLevelInfo(levelCode);
        } catch (err) {
            // ignored
        }

        if (!levelInfo) {
            makerInfo = await mm2ApiManager.getUserInfo(levelCode);

            if (!makerInfo) {
                await chatManager.sendMessage(`${userInfo.displayName}, the level you entered was not found! You might want to double-check that code`);

                return;
            }
        }

        await queueManager.replaceQueueItemInCurrentQueue(levelCode, userInfo.displayName, isMod, isVip, isSub);

        const position = await queueManager.getUserPosition(userInfo.displayName);

        if (!!levelInfo) {
            await chatManager.sendMessage(`${userInfo.displayName}, you updated your level to "${levelInfo.name}" (${levelCode}) :) You're still in position ${position}`);

            return;
        }

        if (!!makerInfo) {
            await chatManager.sendMessage(`${userInfo.displayName}, you updated your level to ${makerInfo.name}'s maker code (${levelCode}) :) You're still in position ${position}`);

            return;
        }
    };
}