import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class CurrentInfoCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!currentinfo';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, mm2ApiManager, queueManager } = this.twitchBot;

        const currentLevel = await queueManager.getCurrentLevel();
        
        if (!currentLevel) {
            await chatManager.sendMessage(`There is no current level!`);

            return;
        }

        const levelInfo = await mm2ApiManager.getLevelInfo(currentLevel.levelCode);

        if (!levelInfo) {
            await chatManager.sendMessage(`I couldn't find level info for this level :(`);

            return;
        }

        const stupidThingsToSay: Array<string> = [];

        if (levelInfo.clears === 0) {
            stupidThingsToSay.push('This level is uncleared.');
        } else {
            stupidThingsToSay.push(`The level has a clear rate of ${levelInfo.clear_rate} (${levelInfo.clears}/${levelInfo.attempts}).`);
            stupidThingsToSay.push(`It was first cleared by ${levelInfo.first_completer.name}.`);
            stupidThingsToSay.push(`The record holder is ${levelInfo.record_holder.name} with a time of ${levelInfo.world_record_pretty}.`);
        }
        
        stupidThingsToSay.push(`The clearcheck time was ${levelInfo.upload_time_pretty}.`);

        const likeRatio = levelInfo.boos > 0
            ?
            `${((levelInfo.likes / (levelInfo.likes + levelInfo.boos)) * 100).toFixed(0)}%`
            :
            levelInfo.likes > 0
                ?
                `100%`
                :
                `0%`;

        stupidThingsToSay.push(`The like/boo ratio is ${likeRatio} (${levelInfo.likes} ❤️ ${levelInfo.boos} 💙)`);

        await chatManager.sendMessage(`This level is "${levelInfo.name}" (${currentLevel.levelCode}) by ${levelInfo.uploader.name}, uploaded ${levelInfo.uploaded_pretty}. ${stupidThingsToSay.join(' ')}`);
    };
}