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

@Entity('us_address', {schema: 'public'})
export class us_address {
    @PrimaryGeneratedColumn({
        type: 'integer',
        name: 'id',
    })
    id: number;

    @Column('text', {
        nullable: false,
        name: 'address1',
    })
    address1: string;

    @Column('text', {
        nullable: true,
        name: 'address2',
    })
    address2: string | null;

    @Column('text', {
        nullable: false,
        name: 'city',
    })
    city: string;

    @Column('text', {
        nullable: false,
        name: 'state',
    })
    state: string;

    @Column('text', {
        nullable: false,
        name: 'zip',
    })
    zip: string;

    @OneToMany(() => members, (members: members) => members.address)
    memberss: members[];
}
