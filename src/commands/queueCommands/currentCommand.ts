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

        const levelInfo = await mm2ApiManager.getLevelInfo(currentLevel.levelCode);
        const botState = await queueManager.getBotState();

        const now = new Date();

        if (!levelInfo) {
            await chatManager.sendMessage(`The current level is ${currentLevel.levelCode}, submitted by ${currentLevel.username}. (Active for ${getDateDifference(botState.startedAt ?? now, now)})`);
        } else {
            await chatManager.sendMessage(`The current level is "${levelInfo.name}" (${currentLevel.levelCode}) uploaded by ${levelInfo.uploader.name} (Active for ${getDateDifference(botState.startedAt ?? now, now)})`);
        }
    };
}