import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { LEVEL_COMMAND } from '../../services/queue/enums';
import { TwitchBot } from '../../twitchBot';

export class RemoveCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!remove';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const removedLevel = await queueManager.removeCurrentLevel();

        await chatManager.sendMessage(`${removedLevel.username}, your level ${removedLevel.levelCode} has been removed from the queue... ᴵ ˢᵘˢᵖᵉᶜᵗ ᵃᵇˢᵉⁿᵗᵉᵉᶦˢᵐ`);

        const lastCommand = await queueManager.getLastCommand();

        switch (lastCommand) {
            case LEVEL_COMMAND.next: {
                const nextItem = await queueManager.setNextLevel();

                await chatManager.sendMessage(`Alright, let's do another next. $${nextItem.username}, your level ${nextItem.levelCode} is now up!`);

                break;
            }
            case LEVEL_COMMAND.random: {
                const nextItem = await queueManager.setRandomLevel();

                await chatManager.sendMessage(`I guess we're still on random... ${nextItem.username}, your level ${nextItem.levelCode} is now up!`);

                break;
            }
            case LEVEL_COMMAND.subnext: {
                const nextItem = await queueManager.setSubNextLevel();

                await chatManager.sendMessage(`We're on subnext? Well who's the next subnext... ${nextItem.username}, your level ${nextItem.levelCode} is now up!`);

                break;
            }
            case LEVEL_COMMAND.subrandom: {
                const nextItem = await queueManager.setSubRandomLevel();

                await chatManager.sendMessage(`Another subrandom it is! ${nextItem.username}, your level ${nextItem.levelCode} is now up!`);

                break;
            }
            default: {
                return;
            }
        }
    };
}