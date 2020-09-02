import {BaseEntity,Column,Entity,Index,JoinColumn,JoinTable,ManyToMany,ManyToOne,OneToMany,OneToOne,PrimaryColumn,PrimaryGeneratedColumn,RelationId} from "typeorm";
import {access_token} from "./access_token";


@Entity("users" ,{schema:"public" } )
@Index("users_email_key",["email",],{unique:true})
export class users {

    @PrimaryGeneratedColumn({
        type:"integer", 
        name:"id"
        })
    id:number;
        

    @Column("text",{ 
        nullable:false,
        unique: true,
        name:"email"
        })
    email:string;
        

    @Column("text",{ 
        nullable:false,
        name:"password"
        })
    password:string;
        

    @Column("text",{ 
        nullable:false,
        name:"password_salt"
        })
    password_salt:string;
        

    @Column("text",{ 
        nullable:false,
        name:"password_storage"
        })
    password_storage:string;
        

   
    @OneToMany(()=>access_token, (access_token: access_token)=>access_token.user)
    accessTokens:access_token[];
    
}
