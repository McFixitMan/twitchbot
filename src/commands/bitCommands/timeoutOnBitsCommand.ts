import { BitMessage } from '../../services/pubSub';
import { CommandBase } from '../base/botCommand';
import { TwitchBot } from '../../twitchBot';

export class TimeoutOnBitsCommand extends CommandBase<BitMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (bitMessage: BitMessage): boolean => {
        return true;
    };

    execute = async (bitMessage: BitMessage): Promise<void> => {
        const { chatManager } = this.twitchBot;

        if (bitMessage.isAnonymous) {
            await chatManager.enableEmoteOnlyMode();
            await chatManager.sendMessage(`An anonymous cheerer thought they were clever, so now we're in emote-only mode for 2 minutes`);

            setTimeout(async () => {
                await chatManager.disableEmoteOnlyMode();
                await chatManager.sendMessage(`Emote-only mode has been disabled`);
            }, 1000 * 60 * 2);
            
        } else if (!!bitMessage.userName) {
            await chatManager.timeoutUser(bitMessage.userName, bitMessage.bits, 'Cheering');
            await chatManager.sendMessage(`${bitMessage.userName} has been timed out for ${bitMessage.bits} seconds for cheering ${bitMessage.bits} bits. Get rekt.`);
        }  
    };
}