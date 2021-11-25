import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { BotTokens } from '../../database/entities/botTokens';
import { botConfig } from '../../config';

const _clientId = botConfig.auth.clientId;
const _clientSecret = botConfig.auth.clientSecret;

type TokenOwnerType = 'broadcaster' | 'bot';

const getTokenData = async (tokenOwner: TokenOwnerType): Promise<BotTokens> => {
    const tokens = await BotTokens.findOne({
        where: {
            tokenOwner: tokenOwner,
        },
    });

    if (!tokens) {
        throw new Error(`Unable to find tokens for ${tokenOwner}`);
    }

    return tokens;
};

const updateTokenData = async (tokenOwner: TokenOwnerType, newTokenData: AccessToken): Promise<void> => {
    const tokens = await BotTokens.findOne({
        where: {
            tokenOwner: tokenOwner,
        },
    });

    if(!tokens) {
        throw new Error(`Unable to find tokens for ${tokenOwner}`);
    }

    tokens.accessToken = newTokenData.accessToken;
    tokens.refreshToken = newTokenData.refreshToken ?? '';
    tokens.expiresIn = newTokenData.expiresIn ?? 0;
    tokens.obtainmentTimestamp = newTokenData.obtainmentTimestamp;

    await tokens.save();
};

export const createAuthProvider = async (owner: TokenOwnerType): Promise<RefreshingAuthProvider> => {
    if (!_clientId || !_clientSecret) {
        throw new Error(`Unable to create auth provider, missing:${!_clientId && ' clientId'}${!_clientSecret && ' clientSecret'}`);
    }

    const tokenData = await getTokenData(owner);

    const authProvider = new RefreshingAuthProvider({
        clientId: _clientId,
        clientSecret: _clientSecret,

        onRefresh: async (newTokenData) => {
            await updateTokenData(owner, newTokenData);
        },
    }, tokenData);

    return authProvider;
};