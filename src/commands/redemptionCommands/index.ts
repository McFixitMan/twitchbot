import { CommandList } from '../base';
import { PredictionRedemptionCommand } from './predictionRedemptionCommand';
import { RedemptionMessage } from '../../services/pubSub';

const commandList: CommandList<RedemptionMessage> = [
    PredictionRedemptionCommand,
];

export { commandList };