import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { BotState } from './botState';
import { LevelState } from './levelState';
import { Queue } from './queue';

@Entity({ name: 'LevelQueueItem' })
export class QueueItem extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;

    @Column({ name: 'LevelCode' })
        levelCode!: string;

    @Column({ name: 'Username' })
        username!: string;

    @Column({ name: 'IsMod' })
        isMod!: boolean;

    @Column({ name: 'IsVip' }) 
        isVip!: boolean;

    @Column({ name: 'IsSub' })
        isSub!: boolean;

    @Column({ name: 'IsSkip' })
        isSkip!: boolean;
    @Column({ name: 'IsMakerCode' })
        isMakerCode!: boolean;

    @Column({ name: 'CreatedAt' })
        createdAt!: Date;

    @ManyToOne(type => Queue, queue => queue.queueItems)
    @JoinColumn({ name: 'levelQueueId' })
        queue?: Queue;

    @ManyToOne(type => LevelState, levelState => levelState.queueItems, { eager: true })
        levelState?: LevelState;

    @OneToMany(type => BotState, botState => botState.activeQueueItem)
        botStates?: Array<BotState>;
}