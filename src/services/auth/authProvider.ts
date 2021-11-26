import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { BotTokens } from '../../database/entities/botTokens';
import { getBotConfig } from '../../config';

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
    const botConfig = getBotConfig();

    if (!botConfig.auth.clientId || !botConfig.auth.clientSecret) {
        throw new Error(`Unable to create auth provider, missing:${!botConfig.auth.clientId && ' clientId'}${!botConfig.auth.clientSecret && ' clientSecret'}`);
    }

    const tokenData = await getTokenData(owner);

    const authProvider = new RefreshingAuthProvider({
        clientId: botConfig.auth.clientId,
        clientSecret: botConfig.auth.clientSecret,

        onRefresh: async (newTokenData) => {
            await updateTokenData(owner, newTokenData);
        },
    }, tokenData);

    return authProvider;
};