import { CommandList } from '../base';
import { SubMessage } from '../../services/pubSub';
import { TimeoutOnSubCommand } from './timeoutOnSubCommand';

const commandList: CommandList<SubMessage> = [
    TimeoutOnSubCommand,
];

export { commandList };