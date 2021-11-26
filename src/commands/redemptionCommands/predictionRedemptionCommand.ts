import { CommandBase } from '../base/botCommand';
import { PREDICTION_REDEMPTION_REWARD_ID } from '../../constants/redemptions';
import { RedemptionMessage } from '../../services/pubSub';
import { TwitchBot } from '../../twitchBot';

export class PredictionRedemptionCommand extends CommandBase<RedemptionMessage> {

    constructor(twitchBot: TwitchBot) {
        super(twitchBot);
    }

    isCompatible = (redemptionMessage: RedemptionMessage): boolean => {
        return redemptionMessage.rewardId === PREDICTION_REDEMPTION_REWARD_ID;
    };

    execute = async (redemptionMessage: RedemptionMessage): Promise<void> => {
        const { apiManager, chatManager } = this.twitchBot;

        const activePrediction = await apiManager.getActivePrediction();

        if (!!activePrediction) {
            await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, there is already a prediction in progress. Your points have been refunded.`);
            await apiManager.refundRedemption(PREDICTION_REDEMPTION_REWARD_ID, redemptionMessage.id);

            return;
        } else {
            await apiManager.createPrediction(redemptionMessage.message, 120, async() => {
                await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, your prediction is officially live!`);

                await apiManager.fulfillRedemption(PREDICTION_REDEMPTION_REWARD_ID, redemptionMessage.id);
            });
        }
    };
}