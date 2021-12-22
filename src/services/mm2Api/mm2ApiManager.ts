import * as chalk from 'chalk';

import { Mm2LevelInfo, Mm2User } from './types';
import axios, { AxiosError } from 'axios';

interface Mm2ApiManagerProps {

}

// See https://tgrcode.com/mm2/docs
export class Mm2ApiManager {
    constructor() { 
        
    }

    getLevelInfo = async (levelCode: string): Promise<Mm2LevelInfo | undefined> => {
        const sanitizedCode = levelCode.replace('-', '');

        try {
            const { data } = await axios.get<Mm2LevelInfo>(`https://tgrcode.com/mm2/level_info/${sanitizedCode}`);

            return data;
        } catch (err) {
            // For now we'll just treat any error as unfound
            return undefined;
        }
        
    };

    getUserInfo = async (makerCode: string): Promise<Mm2User | undefined> => {
        const sanitizedCode = makerCode.replace('-', '');

        try {
            const { data } = await axios.get<Mm2User>(`https://tgrcode.com/mm2/user_info/${sanitizedCode}`);

            return data;
        } catch (err) {
            // For now we'll just treat any error as unfound
            return undefined;
        }
    };
}

export const createMm2ApiManager = async (): Promise<Mm2ApiManager> => {
    const mm2ApiManager = new Mm2ApiManager();

    console.info(chalk.blue(`🎁 mm2ApiManager initialized!`));

    return mm2ApiManager;
};