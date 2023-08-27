import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DeviceSessionEntity } from "./devicesession.entity";
import { MessageEntity } from "./message.entity";
import { ConversationEntity } from "./conversation.entity";
import { FriendRequestEntity } from "./friend_request.entity";

@Entity('users')
export class UserEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string 
    @Column({unique:true})
    email :string 
    @Column()
    password : string 
    @Column()
    firstName: string
    @Column()
    lastName : string
    @Column({type : 'timestamp with time zone',default: () => 'CURRENT_TIMESTAMP' })
    createAt : Date
    @UpdateDateColumn()
    updateAt : Date
    @OneToMany(() => DeviceSessionEntity, (deviceSessions) => deviceSessions.id)
    deviceSessions? : DeviceSessionEntity[]

    @OneToMany(() => MessageEntity, (message) => message.user)
    messages? : MessageEntity[]

    @OneToMany(() => FriendRequestEntity, (friendRequestCreator) => friendRequestCreator.creator)
    friendRequestCreators? : FriendRequestEntity[]

    @OneToMany(() => FriendRequestEntity, (friendRequestReceiver) => friendRequestReceiver.receiver)
    friendRequestReceivers? : FriendRequestEntity[]

    @ManyToMany(() => ConversationEntity, (conversation) => conversation.users)
    @JoinTable({
        name : 'user_conversation',
        joinColumn : {name : 'user_id', referencedColumnName : 'id'},
        inverseJoinColumn : {name : 'conversation_id'}
    })
    conversations : ConversationEntity[]

    @BeforeInsert()
    @BeforeUpdate()
    emailToLowerCase(){
        this.email = this.email.toLowerCase()
        this.lastName = this.lastName.toLowerCase()
        this.firstName = this.firstName.toLowerCase()
    }
}