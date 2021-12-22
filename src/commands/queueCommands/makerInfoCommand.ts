import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { MAKER_CODE_REGEX } from './constants';
import { TwitchBot } from '../../twitchBot';

export class MakerInfoCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase().startsWith('!makerinfo');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, mm2ApiManager } = this.twitchBot;

        const { userInfo } = chatMessage.msg;

        const makerCodeMatch = chatMessage.message.match(MAKER_CODE_REGEX);

        if (!makerCodeMatch || !makerCodeMatch[0]) {
            await chatManager.sendMessage(`${chatMessage.msg.userInfo.displayName}, invalid maker code!`);

            return;
        }

        const makerCode = makerCodeMatch[0].toUpperCase();

        const makerInfo = await mm2ApiManager.getUserInfo(makerCode);

        if (!makerInfo) {
            await chatManager.sendMessage(`${chatMessage.msg.userInfo.displayName}, the maker wasn't found!`);

            return;
        }

        await chatManager.sendMessage(`${userInfo.displayName}: That's ${makerInfo.name}. They're from the ${makerInfo.region_name} region (${makerInfo.country}) and they've made ${makerInfo.uploaded_levels} levels, giving them a whopping ${makerInfo.likes} likes and ${makerInfo.maker_points} maker points!`);
    };
}