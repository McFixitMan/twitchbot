import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

// Start with (^) either !so or !shoutout (unnamed group since we dont need to capture this)
// Optional @ symbol
// Group to capture user name, end
const SHOUTOUT_REGEX = /^(?:!so|!shoutout) @?([a-zA-Z0-9_]+)$/;

export class ShoutoutCommand extends CommandBase<ChatMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster && !chatMessage.msg.userInfo.isMod) {
            return false;
        }

        const isMatch = SHOUTOUT_REGEX.test(chatMessage.message);
        return isMatch;
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const usernameMatch = chatMessage.message.match(SHOUTOUT_REGEX);
        if (!usernameMatch || !usernameMatch[1]) {
            return;
        }
        
        const username = usernameMatch[1];
        const game = await apiManager.getChannelGameNameByUsername(username);

        if (!game) {
            return;
        }

        await chatManager.sendMessage(`Go check out ${username} over at https://www.twitch.tv/${username} - They were last playing ${game}!`);
    };
}