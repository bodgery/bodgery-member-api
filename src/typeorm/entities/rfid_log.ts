import {
    BaseEntity,
    Column,
    Entity,
    Index,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryColumn,
    PrimaryGeneratedColumn,
    RelationId,
} from 'typeorm';
import {members} from './members';

@Entity('rfid_log', {schema: 'public'})
export class rfid_log {
    @PrimaryGeneratedColumn({
        type: 'integer',
        name: 'id',
    })
    id: number;

    @Column('text', {
        nullable: false,
        name: 'rfid',
    })
    rfid: string;

    @Column('boolean', {
        nullable: false,
        name: 'is_active',
    })
    is_active: boolean;

    @ManyToOne(() => members, (members: members) => members.rfidLogs, {})
    @JoinColumn({name: 'member_id'})
    member: members | null;

    @Column('timestamp without time zone', {
        nullable: false,
        default: () => 'now()',
        name: 'log_timestamp',
    })
    log_timestamp: Date;
}
