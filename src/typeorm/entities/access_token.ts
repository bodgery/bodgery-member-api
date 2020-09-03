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
import {users} from './users';

@Entity('access_token', {schema: 'public'})
@Index('access_token_token_key', ['token'], {unique: true})
export class access_token {
    @PrimaryGeneratedColumn({
        type: 'integer',
        name: 'id',
    })
    id: number;

    @ManyToOne(() => users, (users: users) => users.accessTokens, {
        nullable: false,
    })
    @JoinColumn({name: 'user_id'})
    user: users | null;

    @Column('text', {
        nullable: false,
        unique: true,
        name: 'token',
    })
    token: string;

    @Column('text', {
        nullable: false,
        name: 'name',
    })
    name: string;

    @Column('text', {
        nullable: false,
        default: () => "''",
        name: 'notes',
    })
    notes: string;
}
