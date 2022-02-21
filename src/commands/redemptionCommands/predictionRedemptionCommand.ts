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
            const voteDuration = 120;

            try {
                await apiManager.createPrediction(redemptionMessage.message, voteDuration, async() => {
                    await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, your prediction is officially live!`);
    
                    await apiManager.fulfillRedemption(PREDICTION_REDEMPTION_REWARD_ID, redemptionMessage.id);
                }, redemptionMessage.id);

                await chatManager.sendMessage(`${this.broadcasterName}, you have ${voteDuration} seconds to go grab a drink... Everyone else get your votes in!`);
            } catch (err) {
                // TODO: This is gross, find a better way to access this
                const error = err as { body: string };

                const body = JSON.parse(error.body) as { message: string };

                await apiManager.refundRedemption(PREDICTION_REDEMPTION_REWARD_ID, redemptionMessage.id);

                if (!!body && !!body.message) {
                    await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, there was an error creating the prediction, your points will be refunded: ${body.message}`);
                } else {
                    await chatManager.sendMessage(`${redemptionMessage.userDisplayName}, there was an error creating the prediction, your points will be refunded.`);
                }
                
                
            }
            

            
        }
    };
}