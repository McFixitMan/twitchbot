import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Queue } from './queue';

@Entity({ name: 'QueueState' })
export class QueueState extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;
    
    @Column({ name: 'Value' })
        value!: string;

    @Column({ name: 'Label' })
        label!: string;

    @OneToMany(type => Queue, queue => queue.queueState)
        queues?: Array<Queue>;
}