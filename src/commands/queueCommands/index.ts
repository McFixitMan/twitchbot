import { AddCommand } from './addCommand';
import { ChatMessage } from '../../services/chat';
import { CloseCommand } from './closeCommand';
import { CodeCommand } from './codeCommand';
import { CommandList } from '../base';
import { CurrentCommand } from './currentCommand';
import { CurrentInfoCommand } from './currentInfoCommand';
import { LastQueueCommand } from './lastQueueCommand';
import { LeaveCommand } from './leaveCommand';
import { LevelInfoCommand } from './levelInfoCommand';
import { ListCommand } from './listCommand';
import { LossCommand } from './lossCommand';
import { MakerInfoCommand } from './makerInfoCommand';
import { NewQueueCommand } from './newQueueCommand';
import { NextCommand } from './nextCommand';
import { NowCommand } from './nowCommand';
import { OpenCommand } from './openCommand';
import { PositionCommand } from './positionCommand';
import { QueueCommand } from './queueCommand';
import { RandomCommand } from './randomCommand';
import { RecordCommand } from './recordCommand';
import { RemoveCommand } from './removeCommand';
import { ReplaceCommand } from './replaceCommand';
import { SelectCommand } from './selectCommand';
import { SubNextCommand } from './subNextCommand';
import { SubRandomCommand } from './subRandomCommand';
import { TimeCommand } from './timeCommand';
import { UpdateSubCommand } from './updateSubCommand';
import { WinCommand } from './winCommand';

const commandList: CommandList<ChatMessage> = [
    AddCommand,
    CloseCommand,
    CodeCommand,
    CurrentCommand,
    CurrentInfoCommand,
    LastQueueCommand,
    LeaveCommand,
    LevelInfoCommand,
    ListCommand,
    LossCommand,
    MakerInfoCommand,
    NewQueueCommand,
    NextCommand,
    NowCommand,
    OpenCommand,
    PositionCommand,
    QueueCommand,
    RandomCommand,
    RecordCommand,
    RemoveCommand,
    ReplaceCommand,
    SelectCommand,
    SubNextCommand,
    SubRandomCommand,
    TimeCommand,
    UpdateSubCommand,
    WinCommand,
];

export { commandList };