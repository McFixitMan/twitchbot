import { CommandList } from '../base';
import { PredictionRedemptionCommand } from './predictionRedemptionCommand';
import { RedemptionMessage } from '../../services/pubSub';
import { SkipQueueRedemptionCommand } from './skipQueueRedemptionCommand';

const commandList: CommandList<RedemptionMessage> = [
    PredictionRedemptionCommand,
    SkipQueueRedemptionCommand,
];

export { commandList };