import { Queue } from '../entities/queue';

export interface QueueRecord {
    queue: Queue;
    wins: number;
    losses: number;
}