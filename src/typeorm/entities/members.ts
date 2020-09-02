import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {us_address} from "./us_address";
import {rfid_log} from "./rfid_log";


@Entity("members" ,{schema:"public" } )
@Index("members_email_key",["email",],{unique:true})
@Index("member_name",["first_name","last_name",])
@Index("members_member_id_key",["member_id",],{unique:true})
@Index("members_rfid_key",["rfid",],{unique:true})
@Index("members_slack_id_key",["slack_id",],{unique:true})
@Index("members_wildapricot_id_key",["wildapricot_id",],{unique:true})
export class members {

    @PrimaryGeneratedColumn({
        type:"integer", 
        name:"id"
        })
    id:number;
        

    @Column("uuid",{ 
        nullable:true,
        unique: true,
        default: () => "uuid_generate_v4()",
        name:"member_id"
        })
    member_id:string | null;
        

    @Column("text",{ 
        nullable:true,
        unique: true,
        name:"wildapricot_id"
        })
    wildapricot_id:string | null;
        

    @Column("text",{ 
        nullable:true,
        unique: true,
        name:"rfid"
        })
    rfid:string | null;
        

    @Column("integer",{ 
        nullable:true,
        unique: true,
        name:"slack_id"
        })
    slack_id:number | null;
        

   
    @ManyToOne(()=>us_address, (us_address: us_address)=>us_address.memberss,{  })
    @JoinColumn({ name:'address_id'})
    address:us_address | null;


    @Column("text",{ 
        nullable:true,
        name:"first_name"
        })
    first_name:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"last_name"
        })
    last_name:string | null;
        

    @Column("text",{ 
        nullable:true,
        name:"phone"
        })
    phone:string | null;
        

    @Column("text",{ 
        nullable:false,
        unique: true,
        name:"email"
        })
    email:string;
        

    @Column("boolean",{ 
        nullable:true,
        default: () => "false",
        name:"status"
        })
    status:boolean | null;
        

    @Column("text",{ 
        nullable:true,
        name:"photo"
        })
    photo:string | null;
        

   
    @OneToMany(()=>rfid_log, (rfid_log: rfid_log)=>rfid_log.member)
    rfidLogs:rfid_log[];
    
}
