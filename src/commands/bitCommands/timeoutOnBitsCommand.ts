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
            await chatManager.runCommercial(30);
            await chatManager.sendMessage(`An anonymous gifter thought they were clever, but now everyone gets a 30 second ad :)`);
        } else if (!!bitMessage.userName) {
            await chatManager.timeoutUser(bitMessage.userName, bitMessage.bits, 'Cheering');
            await chatManager.sendMessage(`${bitMessage.userName} has been timed out for ${bitMessage.bits} seconds for cheering ${bitMessage.bits} bits. Get rekt.`);
        }  
    };
}