import { BitMessage } from '../../services/pubSub';
import { CommandList } from '../base';
import { TimeoutOnBitsCommand } from './timeoutOnBitsCommand';

const commandList: CommandList<BitMessage> = [
    TimeoutOnBitsCommand,
];

export { commandList };