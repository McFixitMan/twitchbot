import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BotState } from './botState';
import { QueueItem } from './queueItem';
import { QueueState } from './queueState';

@Entity({ name: 'LevelQueue' })
export class Queue extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;

    @Column({ name: 'Title' })
        title!: string;

    @Column({ name: 'QueueDescription' })
        description?: string;

    @Column({ name: 'CreatedAt' })
        createdAt!: Date;

    @OneToMany(type => QueueItem, queueItem => queueItem.queue)
        queueItems?: Array<QueueItem>;

    @ManyToOne(type => QueueState, queueState => queueState.queues, { eager: true })
        queueState?: QueueState;

    @OneToMany(type => BotState, botState => botState.activeQueue)
        botStates?: Array<BotState>;
}