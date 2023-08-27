import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MessageEntity } from "./message.entity";
import { UserEntity } from "./user.entity";
import { Emoji } from "../interfaces/conversation.interface";

@Entity('conversation')
export class ConversationEntity  {
    @PrimaryGeneratedColumn('uuid')
    id :string
    
    @Column({name : "emoji"
    ,nullable: true,
    type :'enum',
    enum: Emoji
})
    emoji? : Emoji

    @Column({ name : 'created_at',type :'timestamp with time zone', default : () => 'CURRENT_TIMESTAMP'})
    createdAt : Date

    @UpdateDateColumn({name: 'updated_at', type : 'timestamp with time zone'})
    updatedAt : Date


    @OneToMany(() => MessageEntity, (message) => message.conversation, {nullable : true })
    messages? : MessageEntity[]

    @ManyToMany(() => UserEntity, (user) => user.conversations)
    @JoinTable({
        name : 'user_conversation',
        joinColumn: {name : 'conversation_id', referencedColumnName :'id'},
        inverseJoinColumn : {name : 'user_id'}
    })
    users : UserEntity[]

    

}