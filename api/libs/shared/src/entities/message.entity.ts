import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm";
import { ConversationEntity } from "./conversation.entity";
import { UserEntity } from "./user.entity";


@Entity('message')
export class MessageEntity {
    @PrimaryGeneratedColumn('uuid')
    id : string

    @Column({name : 'user_id', nullable : true})
    user_id : string

    @Column({nullable : true })
    message : string 

    @Column({name : 'conversation_id'})
    conversation_id : string

    @Column({name: "created_at",type : 'timestamp with time zone', default: () =>  'CURRENT_TIMESTAMP'})
    createAt : Date

    @UpdateDateColumn({name : "updated_at"})
    updatedAt : Date

    @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
    @JoinColumn({name : 'conversation_id'})
    conversation? : ConversationEntity

    @ManyToOne(() => UserEntity, (user) => user.messages)
    @JoinColumn({name : "user_id"})
    user? :UserEntity
}