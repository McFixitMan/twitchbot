import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { QueueItem } from './queueItem';

@Entity({ name: 'LevelState' })
export class LevelState extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;
    
    @Column({ name: 'Code' })
        code!: string;

    @Column({ name: 'Label' })
        label!: string;

    @OneToMany(type => QueueItem, queueItem => queueItem.levelState)
        queueItems?: Array<QueueItem>;
}