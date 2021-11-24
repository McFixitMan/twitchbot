import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { LEVEL_COMMAND } from '../../services/queue/enums';
import { TwitchBot } from '../../twitchBot';

export class NowCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        return chatMessage.message.toLowerCase() === '!now';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const lastCommand = await queueManager.getLastCommand();

        switch (lastCommand) {
            case undefined: {
                await chatManager.sendMessage(`We haven't even started yet!`);
                break;
            }
            case LEVEL_COMMAND.next: {
                await chatManager.sendMessage(`We're on a !next :)`);
                break;
            }
            case LEVEL_COMMAND.subnext: {
                await chatManager.sendMessage(`We're on a !subnext :)`);
                break;
            }
            case LEVEL_COMMAND.random: {
                await chatManager.sendMessage(`We're on a !random :)`);
                break;
            }
            case LEVEL_COMMAND.subrandom: {
                await chatManager.sendMessage(`We're on a !subrandom :)`);
                break;
            }

            default: {
                await chatManager.sendMessage(`I don't know what command we're... I guess even bots can make that mistake.`);
                break;
            }
        }
    };
}