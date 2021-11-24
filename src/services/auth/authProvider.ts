import * as path from 'path';

import { AccessToken, RefreshingAuthProvider } from '@twurple/auth';

import { botConfig } from '../../config';
import { promises as fs } from 'fs';

const _clientId = botConfig.auth.clientId;
const _clientSecret = botConfig.auth.clientSecret;

const broadcasterTokenPath = path.resolve(__dirname, './broadcasterTokens.json');
const botTokenPath = path.resolve(__dirname, './botTokens.json');

type TokenOwner = 'broadcaster' | 'bot';

const getTokenData = async (tokenOwner: TokenOwner): Promise<AccessToken> => {
    const path = tokenOwner === 'broadcaster' 
        ? broadcasterTokenPath 
        : botTokenPath;

    const tokenData = await fs.readFile(path, 'utf-8');

    return JSON.parse(tokenData);
};

const updateTokenData = async (tokenOwner: TokenOwner, newTokenData: AccessToken): Promise<void> => {
    const stringifiedData = JSON.stringify(newTokenData, null, 4);
    
    const path = tokenOwner === 'broadcaster' 
        ? broadcasterTokenPath 
        : botTokenPath;

    return await fs.writeFile(path, stringifiedData, 'utf-8');
};

export const createAuthProvider = async (owner: TokenOwner): Promise<RefreshingAuthProvider> => {
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