import { CommandBase } from '../base/botCommand';
import { RedemptionMessage } from '../../services/pubSub';
import { SKIP_QUEUE_REDEMPTION_REWARD_ID } from '../../constants/redemptions';
import { TwitchBot } from '../../twitchBot';

export class SkipQueueRedemptionCommand extends CommandBase<RedemptionMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (redemptionMessage: RedemptionMessage): boolean => {
        return redemptionMessage.rewardId === SKIP_QUEUE_REDEMPTION_REWARD_ID;
    };

    execute = async (redemptionMessage: RedemptionMessage): Promise<void> => {
        const { apiManager, chatManager, queueManager } = this.twitchBot;

        const queueItem = await queueManager.getUserQueueItem(redemptionMessage.userName);

        if (!queueItem) {
            await apiManager.refundRedemption(SKIP_QUEUE_REDEMPTION_REWARD_ID, redemptionMessage.id);
            await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, add a level to the queue first! Your channel points have been refunded`);

            return;
        } else if (queueItem.isSkip) {
            await apiManager.refundRedemption(SKIP_QUEUE_REDEMPTION_REWARD_ID, redemptionMessage.id);
            await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, your level has already skipped the queue! Your channel points have been refunded`);

            return;
        }

        const updatedQueueItem = await queueManager.setUserQueueItemAsSkip(redemptionMessage.userName);

        await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, you've skipped the queue with your level ${updatedQueueItem.levelCode}!`);
        await apiManager.fulfillRedemption(SKIP_QUEUE_REDEMPTION_REWARD_ID, redemptionMessage.id);
    };
}