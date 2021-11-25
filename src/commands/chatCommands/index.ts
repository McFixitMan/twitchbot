import { ChangeTitleCommand } from './changeTitleCommand';
import { ChatMessage } from '../../services/chat';
import { CommandList } from '../base';
import { DelayCommand } from './delayCommand';
import { GameInfoCommand } from './gameInfoCommand';
import { PermitCommand } from './permitCommand';
import { StreamersCommand } from './streamersCommand';
import { SubsCommand } from './subsCommand';
import { TimerCommand } from './timerCommand';
import { UptimeCommand } from './uptimeCommand';

const commandList: CommandList<ChatMessage> = [
    ChangeTitleCommand,
    DelayCommand,
    GameInfoCommand,
    PermitCommand,
    StreamersCommand,
    SubsCommand,
    TimerCommand,
    UptimeCommand,
];

export { commandList };
