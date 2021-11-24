import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class TimerCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        if (!chatMessage.msg.userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase().startsWith('!timer ');
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager } = this.twitchBot;

        const args = chatMessage.message.replace('!timer ', '');

        const timerRegex = new RegExp(/^(?<amount>\d*)(?<scale>[s|m])\s?(?<message>.+)?/gm);

        const messageMatch = timerRegex.exec(args);

        if (!messageMatch) {
            chatManager.sendMessage(`Invalid format for timer message`);
            return;
        }

        const amount = Number(messageMatch.groups?.['amount']);
        const scale = messageMatch.groups?.['scale'];
        const message = messageMatch.groups?.['message'];

        if (!amount || !scale || isNaN(amount)) {
            chatManager.sendMessage(`Invalid format for timer message`);
            return;
        }

        chatManager.sendMessage(`Setting a timer for ${amount} ${scale === 's' ? 'second(s)' : 'minute(s)'}`);

        setTimeout(() => {
            chatManager.sendMessage(!!message ? message : 'Timer expired!');  
        }, (amount * (scale === 's' ? 1000 : 60000)));
    };
}