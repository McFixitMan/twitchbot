import { Queue } from '../../../database/entities/queue';

export interface QueueRecord {
    queue: Queue;
    wins: number;
    losses: number;
}