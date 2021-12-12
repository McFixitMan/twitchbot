import * as chalk from 'chalk';

import { Mm2LevelInfo } from './types';
import axios from 'axios';

interface Mm2ApiManagerProps {

}

export class Mm2ApiManager {
    constructor() { 
        
    }

    getLevelInfo = async (levelCode: string): Promise<Mm2LevelInfo | undefined> => {
        const sanitizedCode = levelCode.replace('-', '');

        const { data } = await axios.get<Mm2LevelInfo>(`https://tgrcode.com/mm2/level_info/${sanitizedCode}`);

        return data;
    };
}

export const createMm2ApiManager = async (): Promise<Mm2ApiManager> => {
    const mm2ApiManager = new Mm2ApiManager();

    console.info(chalk.blue(`🎁 mm2ApiManager initialized!`));

    return mm2ApiManager;
};