import { MessageEntity } from "../entities/message.entity"
import { UserEntity } from "../entities/user.entity"

export interface IConversation {
    id :string
    emoji? : Emoji
    users : UserEntity[]
    messages? : MessageEntity[]

}


export enum Emoji{
    heart = 'heart',
    like = 'like',
    haha = 'haha'
}