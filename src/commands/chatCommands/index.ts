import { BannedCommand } from './bannedCommand';
import { CancelPredictionCommand } from './cancelPredictionCommand';
import { ChangeTitleCommand } from './changeTitleCommand';
import { ChatMessage } from '../../services/chat';
import { CommandList } from '../base';
import { CreatePredictionCommand } from './createPredictionCommand';
import { CreateRewardCommand } from './createRewardCommand';
import { DelayCommand } from './delayCommand';
import { FollowageCommand } from './followageCommand';
import { GameInfoCommand } from './gameInfoCommand';
import { ModsCommand } from './modsCommand';
import { PermitCommand } from './permitCommand';
import { ResolvePredictionCommand } from './resolvePredictionCommand';
import { RunAdCommand } from './runAdCommand';
import { ShoutoutCommand } from './shoutoutCommand';
import { StreamersCommand } from './streamersCommand';
import { SubsCommand } from './subsCommand';
import { TimerCommand } from './timerCommand';
import { UptimeCommand } from './uptimeCommand';

const commandList: CommandList<ChatMessage> = [
    BannedCommand,
    CancelPredictionCommand,
    ChangeTitleCommand,
    CreatePredictionCommand,
    CreateRewardCommand,
    DelayCommand,
    FollowageCommand,
    GameInfoCommand,
    ModsCommand,
    PermitCommand,
    ResolvePredictionCommand,
    RunAdCommand,
    ShoutoutCommand,
    StreamersCommand,
    SubsCommand,
    TimerCommand,
    UptimeCommand,
];

export { commandList };
