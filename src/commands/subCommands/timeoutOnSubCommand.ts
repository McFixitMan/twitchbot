import { CommandBase } from '../base';
import { SubMessage } from '../../services/pubSub';
import { TwitchBot } from '../../twitchBot';

export class TimeoutOnSubCommand extends CommandBase<SubMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (subMessage: SubMessage): boolean => {
        return true;
    };

    execute = async (subMessage: SubMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        if (subMessage.isGift) {
            await chatManager.timeoutUser(subMessage.userName, 60);
            await chatManager.sendMessage(`${subMessage.userName} has been timed out for 60 seconds for receiving a sub :)`);

            if (subMessage.isAnonymous) {
                await chatManager.enableEmoteOnlyMode();
                await chatManager.sendMessage(`An anonymous gifter thought they were clever, so now we're in emote-only mode for 2 minutes`);

                setTimeout(async () => {
                    await chatManager.disableEmoteOnlyMode();
                    await chatManager.sendMessage(`Emote-only mode has been disabled`);
                }, 1000 * 60 * 2);

            } else if (!!subMessage.gifterName) {
                await chatManager.timeoutUser(subMessage.gifterName, 300);
                await chatManager.sendMessage(`${subMessage.gifterDisplayName} has been timed out for 300 seconds for gifting a sub :)`);
            }
        }
        
        if (!subMessage.isGift) {
            await chatManager.timeoutUser(subMessage.userName, 500);
            await chatManager.sendMessage(`${subMessage.userDisplayName} has been timed out for 500 seconds for subbing :)`);
        }

        try {
            await queueManager.updateSub(subMessage.userName);
        } catch (err) {
            // ignore
        }
    };
}