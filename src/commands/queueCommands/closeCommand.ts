import { ChatMessage } from '../../services/chat';
import { CommandBase } from '../base';
import { QUEUE_STATE } from '../../services/queue/enums';
import { TwitchBot } from '../../twitchBot';

export class CloseCommand extends CommandBase<ChatMessage> {
    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (chatMessage: ChatMessage): boolean => {
        const { userInfo } = chatMessage.msg;

        if (!userInfo.isBroadcaster) {
            return false;
        }

        return chatMessage.message.toLowerCase() === '!close';
    };

    execute = async (chatMessage: ChatMessage): Promise<void> => {
        const { chatManager, queueManager } = this.twitchBot;

        const queueState = await queueManager.changeCurrentQueueState(QUEUE_STATE.closed);

        await chatManager.sendAnnouncement(`The queue is now ${queueState.label.toUpperCase()}!`);
    };
}