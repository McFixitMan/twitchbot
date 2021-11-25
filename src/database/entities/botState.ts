import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Queue } from './queue';
import { QueueItem } from './queueItem';

@Entity({ name: 'BotState' })
export class BotState extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;

    @ManyToOne(type => Queue, queue => queue.botStates, { nullable: true, eager: true })
        activeQueue!: Queue | null;

    @ManyToOne(type => QueueItem, queueItem => queueItem.botStates, { nullable: true, eager: true })
        activeQueueItem!: QueueItem | null;

    @Column({ name: 'LastCommand', nullable: true, type: 'varchar' })
        lastCommand!: string | null;

    @Column({ name: 'StartedAt', nullable: true, type: 'datetime' })
        startedAt!: Date | null;
}