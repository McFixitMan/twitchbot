import * as chalk from 'chalk';

import { ApiClient, HelixPrediction, HelixUser } from '@twurple/api';

import { AuthProvider } from '@twurple/auth/lib';
import { PREDICTION_REDEMPTION_REWARD_ID } from '../../constants/redemptions';
import { getBotConfig } from '../../config';
import { getDateDifference } from '../../utility/dateHelper';

interface ApiManagerProps {

}

export class ApiManager {
    public apiClient: ApiClient;

    private _channelName: string = getBotConfig().broadcaster.username;
    private _broadcasterId: string = '';

    private _predictionInfo?: { id: string; redemptionMessageId?: string; } = undefined;

    constructor(authProvider: AuthProvider) {
        this.apiClient = new ApiClient({
            authProvider: authProvider,
        });
    }

    initialize = async (): Promise<void> => {
        const broadcaster = await this.apiClient.users.getUserByName(this._channelName);
        if (!broadcaster) {
            throw new Error('Unable to initialize ApiManager: Broadcaster user not found');
        }

        this._broadcasterId = broadcaster.id;
    };

    updateTitle = async (newTitle: string): Promise<void> => {
        await this.apiClient.channels.updateChannelInfo(this._broadcasterId, {
            title: newTitle,
        });
    };

    getDelaySeconds = async (): Promise<number> => {
        try {
            const channelInfo = await this.apiClient.channels.getChannelInfo(this._broadcasterId);
            return channelInfo?.delay ?? -1;
        } catch (err) {
            console.log(err);
        }
        
        return -1;
    };

    getGameInfo = async (): Promise<{ gameName: string; numberOfStreams: number; totalViewers: number } | undefined> => {
        const channelInfo = await this.apiClient.channels.getChannelInfo(this._broadcasterId);
        if (!channelInfo) {
            return;
        }

        const gameInfo = await channelInfo.getGame();
        if (!gameInfo) {
            return;
        }

        const streams = await gameInfo.getStreams();
        const totalViewers = streams.data.map((s) => s.viewers).reduce((a, b) => a + b);

        return {
            gameName: gameInfo.name,
            numberOfStreams: streams.data.length,
            totalViewers: totalViewers,
        };
    };

    getOtherStreamers = async (): Promise<Array<string>> => {
        const channelInfo = await this.apiClient.channels.getChannelInfo(this._broadcasterId);
        if (!channelInfo) {
            throw new Error('Couldn\'t get channel info');
        }

        const gameInfo = await channelInfo.getGame();
        if (!gameInfo) {
            throw new Error('Couldn\'t get game info');
        }

        const streams = await gameInfo.getStreams();

        return streams.data
            .filter((stream) => stream.userId !== this._broadcasterId)
            .sort((a, b) => b.viewers - a.viewers)
            .map((stream) => `${stream.userDisplayName} (${stream.viewers})`);
    };

    getUptimeInSeconds = async(): Promise<number> => {
        const stream = await this.apiClient.streams.getStreamByUserId(this._broadcasterId);
        if (!stream) {
            throw new Error('Not currently streaming');
        }

        const now = new Date();
        const totalMs = now.getTime() - stream.startDate.getTime();
        

        return totalMs * 1000;
    };

    getSubs = async(): Promise<Array<string>> => {
        const subs = await this.apiClient.subscriptions.getSubscriptions(this._broadcasterId);

        return subs.data
            .filter(sub => sub.userId !== this._broadcasterId)
            .map(sub => sub.userDisplayName);
    };

    getFollowAge = async(userId: string): Promise<string | undefined> => {
        const follow = await this.apiClient.users.getFollowFromUserToBroadcaster(userId, this._broadcasterId);

        if (!follow) {
            return undefined;
        }

        const age = getDateDifference(follow.followDate, new Date());
        
        return age;
    };

    getBannedUsers = async(): Promise<Array<string>> => {
        const bannedUsers = await this.apiClient.moderation.getBannedUsers(this._broadcasterId);
        
        if (!bannedUsers || bannedUsers.data.length === 0) {
            return [];
        }

        return bannedUsers.data.map(banned => banned.userDisplayName);
    };

    getModerators = async(): Promise<Array<string>> => {
        const mods = await this.apiClient.moderation.getModerators(this._broadcasterId);

        if(!mods || mods.data.length === 0) {
            return [];
        }

        return mods.data.map(mod => mod.userDisplayName);
    };

    getActivePrediction = async(): Promise<HelixPrediction | undefined> => {
        const predictions = await this.apiClient.predictions.getPredictions(this._broadcasterId);

        const activePrediction = predictions.data.find(prediction => prediction.status === 'ACTIVE' || prediction.status === 'LOCKED');

        return activePrediction ?? undefined;
    };

    createPrediction = async(title: string, lockedAfterSeconds: number, lockedCallback?: () => void, redemptionMessageId?: string): Promise<void> => {
        const activePrediction = await this.getActivePrediction();
        if (!!activePrediction) {
            throw new Error('There is already an active prediction!');
        }
        
        const prediction = await this.apiClient.predictions.createPrediction(this._broadcasterId, {
            autoLockAfter: lockedAfterSeconds,
            outcomes: ['Yes', 'No'],
            title: title,
        });

        // this.activePrediction = prediction;

        const predictionId = prediction.id;

        this._predictionInfo = {
            id: predictionId,
            redemptionMessageId: redemptionMessageId, 
        };

        setTimeout(async() => {
            const currentActivePrediction = await this.getActivePrediction();
            if(currentActivePrediction?.id === predictionId) {
                lockedCallback?.();
            }
        }, lockedAfterSeconds * 1000);
    };

    resolvePrediction = async(result: 1 | 2): Promise<void> => {
        const activePrediction = await this.getActivePrediction();
        if (!activePrediction) {
            throw new Error('There is no active prediction!');
        }
        if (activePrediction.status !== 'LOCKED') {
            throw new Error(`The prediction hasn't locked yet, so it can't be resolved!`);
        }

        await this.apiClient.predictions.resolvePrediction(this._broadcasterId, activePrediction.id, activePrediction.outcomes[result - 1].id);

        if (activePrediction.id === this._predictionInfo?.id && !!this._predictionInfo.redemptionMessageId) {
            this.fulfillRedemption(PREDICTION_REDEMPTION_REWARD_ID, this._predictionInfo.redemptionMessageId);
        }

        this._predictionInfo = undefined;
    };

    cancelPrediction = async(): Promise<void> => {
        const activePrediction = await this.getActivePrediction();
        if (!activePrediction) {
            throw new Error('There is no active prediction!');
        }

        await this.apiClient.predictions.cancelPrediction(this._broadcasterId, activePrediction.id);

        if (activePrediction.id === this._predictionInfo?.id && !!this._predictionInfo.redemptionMessageId) {
            this.refundRedemption(PREDICTION_REDEMPTION_REWARD_ID, this._predictionInfo.redemptionMessageId);
        }

        this._predictionInfo = undefined;
    };

    refundRedemption = async(rewardId: string, redemptionId: string): Promise<void> => {
        const redemption = await this.apiClient.channelPoints.getRedemptionById(this._broadcasterId, rewardId, redemptionId);
        
        if (!redemption) {
            throw new Error('Redemption not found');
        }

        await redemption.updateStatus('CANCELED');
    };

    fulfillRedemption = async(rewardId: string, redemptionId: string): Promise<void> => {
        const redemption = await this.apiClient.channelPoints.getRedemptionById(this._broadcasterId, rewardId, redemptionId);

        if (!redemption) {
            throw new Error('Redemption not found');
        }

        await redemption.updateStatus('FULFILLED');
    };

    /**
     * Dont actually use this for any commands dummy, its just a way to create rewards that can be controlled by the bot account
     */
    createReward = async(): Promise<void> => {
        const customReward = await this.apiClient.channelPoints.createCustomReward(this._broadcasterId, {
            cost: 50,
            title: 'Skip the queue',
            autoFulfill: false,
            userInputRequired: false,
        });

        console.log(customReward);
    };

    /**
     * Dont actually use this for any commands dummy, its just a way to update rewards that were created by the bot account
     */
    updateReward = async(): Promise<void> => {
        const bleh = await this.apiClient.channelPoints.updateCustomReward(this._broadcasterId, '3da6a575-9af4-4305-92d2-422921849cbe', {
            cost: 15000,
        });

        console.log(bleh);
    };

    getUserByUsername = async(username: string): Promise<HelixUser | undefined> => {
        const user = await this.apiClient.users.getUserByName(username);

        return user ?? undefined;
    };

    getChannelGameNameByUsername = async(username: string): Promise<string | undefined> => {
        const user = await this.getUserByUsername(username);

        if (!user) {
            return undefined;
        }

        const channelInfo = await this.apiClient.channels.getChannelInfo(user.id);
        
        return channelInfo?.gameName;
    };

    getNumberOfViewers = async (): Promise<number> => {
        const stream = await this.apiClient.streams.getStreamByUserId(this._broadcasterId);
                
        return stream?.viewers ?? 0;
    };
}

export const createApiManager = async (authProvider: AuthProvider, props?: ApiManagerProps): Promise<ApiManager> => {
    if (!authProvider) {
        throw new Error('Auth provider must be initialized before creating ApiManager');
    }

    const apiManager = new ApiManager(authProvider);

    console.log(chalk.blue(`🚀 ApiManager initialized!`));

    return apiManager;
};