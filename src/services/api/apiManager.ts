import * as chalk from 'chalk';

import { ApiClient } from '@twurple/api';
import { AuthProvider } from '@twurple/auth/lib';
import { botConfig } from '../../config';

interface ApiManagerProps {

}

export class ApiManager {
    public apiClient: ApiClient;

    private _channelName: string = botConfig.broadcaster.username;
    private _broadcasterId: string = '';

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
            throw new Error('Error getting channel info');
        }

        const gameInfo = await channelInfo.getGame();
        if (!gameInfo) {
            throw new Error('Error getting game info');
        }

        const streams = await gameInfo.getStreams();

        return streams.data
            .filter((stream) => stream.userId !== this._broadcasterId)
            .sort((a, b) => b.viewers - a.viewers)
            .map((stream) => `${stream.userDisplayName} (${stream.viewers} viewers)`);
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
}

export const createApiManager = async (authProvider: AuthProvider, props?: ApiManagerProps): Promise<ApiManager> => {
    if (!authProvider) {
        throw new Error('Auth provider must be initialized before creating ApiManager');
    }

    const apiManager = new ApiManager(authProvider);

    console.log(chalk.blue(`🚀 ApiManager initialized!`));

    return apiManager;
};