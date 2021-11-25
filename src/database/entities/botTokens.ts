import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'BotTokens' })
export class BotTokens extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'Id' })
        id!: number;
    
    @Column({ name: 'TokenOwner', nullable: false, type: 'varchar' })
        tokenOwner!: string;

    @Column({ name: 'AccessToken', nullable: false, type: 'varchar' })
        accessToken!: string;

    @Column({ name: 'RefreshToken', nullable: false, type: 'varchar' })
        refreshToken!: string;
    
    @Column({ name: 'ExpiresIn', nullable: false, type: 'int' })
        expiresIn!: number;

    @Column({ name: 'ObtainmentTimestamp', nullable: false, type: 'bigint' })
        obtainmentTimestamp!: number;
}