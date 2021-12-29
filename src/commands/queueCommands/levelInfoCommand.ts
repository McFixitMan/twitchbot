import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { LEVEL_CODE_REGEX } from './constants';
import { TwitchBot } from '../../twitchBot';

export class LevelInfoCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase().startsWith('!levelinfo');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, mm2ApiManager } = this.twitchBot;
        const { userInfo } = chatMessage.msg;

        const levelCodeMatch = chatMessage.message.match(LEVEL_CODE_REGEX);

        if (!levelCodeMatch || !levelCodeMatch[0]) {
            await chatManager.sendMessage(`${chatMessage.msg.userInfo.displayName}, invalid level code!`);

            return;
        }

        const levelCode = levelCodeMatch[0].toUpperCase();

        const levelInfo = await mm2ApiManager.getLevelInfo(levelCode);

        if (!levelInfo) {
            await chatManager.sendMessage(`The level wasn't found!`, chatMessage.msg);

            return;
        }

        const stupidThingsToSay: Array<string> = [];

        if (levelInfo.clears === 0) {
            stupidThingsToSay.push('The level is uncleared.');
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

        await chatManager.sendMessage(`That level is "${levelInfo.name}" (${levelCode}) by ${levelInfo.uploader.name}, uploaded ${levelInfo.uploaded_pretty}. ${stupidThingsToSay.join(' ')}`, chatMessage.msg);
    };
}