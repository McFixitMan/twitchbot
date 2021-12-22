import * as chalk from 'chalk';

import { Mm2LevelInfo, Mm2User } from '../../services/mm2Api';

import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { TwitchBot } from '../../twitchBot';
import { getDateDifference } from '../../utility/dateHelper';

export class CurrentCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!current';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, mm2ApiManager, queueManager } = this.twitchBot;

        const currentLevel = await queueManager.getCurrentLevel();

        if (!currentLevel) {
            await chatManager.sendMessage('There is no current level!');

            return;
        }

        let entryInfo: Mm2LevelInfo | Mm2User | undefined;

        if (currentLevel.isMakerCode) {
            entryInfo = await mm2ApiManager.getUserInfo(currentLevel.levelCode);
        } else {
            entryInfo = await mm2ApiManager.getLevelInfo(currentLevel.levelCode);
        }
        
        
        const botState = await queueManager.getBotState();

        const now = new Date();

        if (!entryInfo) {
            await chatManager.sendMessage(`The current level is ${currentLevel.levelCode}, submitted by ${currentLevel.username}. (Active for ${getDateDifference(botState.startedAt ?? now, now)})`);
        } else {
            if (currentLevel.isMakerCode) {
                // Maker code resposne
                const makerInfo = entryInfo as Mm2User;

                await chatManager.sendMessage(`The current level is ${makerInfo.name}'s maker code (${currentLevel.levelCode}) submitted by ${currentLevel.username} (Active for ${getDateDifference(botState.startedAt ?? now, now)})`);
            } else {
                // Level code response
                const levelInfo = entryInfo as Mm2LevelInfo;
                
                await chatManager.sendMessage(`The current level is "${levelInfo.name}" (${currentLevel.levelCode}) submitted by ${currentLevel.username} and uploaded by ${levelInfo.uploader.name} (Active for ${getDateDifference(botState.startedAt ?? now, now)})`);
            }
            
        }
    };
}