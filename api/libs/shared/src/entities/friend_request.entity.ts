import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";


 export enum StatusAddFriend {
    pending = "pending",
    reject = "reject",
    accept = "accept"

}

@Entity('friend_request')
export class FriendRequestEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string

    @Column({name : 'creator_id',nullable : false})
    creator_id:string
    @Column({name : "receiver_id",nullable : false})
    receiver_id : string

    @Column({
        name : "status",
        type : 'enum',
        enum : StatusAddFriend,
        default : StatusAddFriend.pending
    })
    status : StatusAddFriend
    @ManyToOne(() => UserEntity, (user) => user.friendRequestCreators)
    @JoinColumn({name:'creator_id'})
    creator : UserEntity

    @ManyToOne(() => UserEntity, (user) => user.friendRequestReceivers)
    @JoinColumn({name : 'receiver_id'})
    receiver : UserEntity

    @Column({type:"timestamp with time zone", default : () => 'CURRENT_TIMESTAMP'})
    createdAt: Date
    
    @UpdateDateColumn({name : "update_at"})
    updateAt : Date

}

