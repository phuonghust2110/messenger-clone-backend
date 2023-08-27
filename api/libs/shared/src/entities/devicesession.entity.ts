import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity('device_session')
export class DeviceSessionEntity{
    @PrimaryGeneratedColumn('uuid')
    id:string
    @Column()
    deviceId:string
    @Column()
    secretKey : string
    @Column()
    ipAdress:string
    @Column()
    refreshToken : string
    @Column()
    ua:string
    @Column()
    expiredAt:Date
    @Column({type : 'timestamp with time zone',default: () => 'CURRENT_TIMESTAMP' })
    createAt : Date
    @UpdateDateColumn({type : 'timestamp with time zone'})
    updateAt:Date
    @ManyToOne(() =>UserEntity, (user) => user.id )
    
    user:string
}