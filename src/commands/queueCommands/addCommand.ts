import { LEVEL_CODE_REGEX, MAKER_CODE_REGEX } from './constants';
import { Mm2LevelInfo, Mm2User } from '../../services/mm2Api';

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
        const { chatManager, mm2ApiManager, queueManager } = this.twitchBot;

        const levelCodeMatch = chatMessage.message.match(MAKER_CODE_REGEX);
    
        if (!levelCodeMatch || !levelCodeMatch[0]) {
            await chatManager.sendMessage(`The level you entered is invalid! Please use the format !add XXX-XXX-XXX`, chatMessage.msg);
        
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
                await chatManager.sendMessage(`The level you entered was not found! You might want to double-check that code`, chatMessage.msg);

                return;
            }
        }

        await queueManager.addQueueItemToCurrentQueue(levelCode, userInfo.displayName, isMod, isVip, isSub, !!makerInfo);

        const position = await queueManager.getUserPosition(userInfo.displayName);

        if (!!levelInfo) {
            await chatManager.sendMessage(`Your level "${levelInfo.name}" (${levelCode}) has been added to the queue! You're in position ${position}`, chatMessage.msg);

            return;
        }

        if (!!makerInfo) {
            await chatManager.sendMessage(`${makerInfo.name}'s maker code (${levelCode}) has been added to the queue! You're in position ${position}`, chatMessage.msg);

            return;
        }
        
    };
}