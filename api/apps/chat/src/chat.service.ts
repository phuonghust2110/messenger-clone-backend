import { ConversationEntity, MessageEntity, NewMessageDTO, UserEntity } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs'

@Injectable()
export class ChatService {
  constructor(@InjectRepository(MessageEntity) private messageRepo: Repository<MessageEntity>,
    @InjectRepository(ConversationEntity) private conversationRepo: Repository<ConversationEntity>,
    @Inject('AUTH_SERVICE') private authService: ClientProxy
  ) {

  }
  getHello(): string {
    return 'Hello World!';
  }

  async createMessage(newMessageDto: NewMessageDTO, userId: string) : Promise<MessageEntity> {
    const { conversation_id, friend_id, message } = newMessageDto

    const user = await this.getUser(userId)
    if (!user) return
    // const conversation : ConversationEntity = await this.conversationRepo.findOne({where : {id : conversation_id}})
    const conversation = await this.conversationRepo
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.users', 'users')
      .where('conversation.id = :conversation_id', { conversation_id })
      .getOne()

      if(!conversation) return 
      return await this.messageRepo.save({
        message : message,
        user,
        conversation
      })
      
  }

  async getUser(id: string):Promise<UserEntity> {
    const ob$ = this.authService.send(
      {
        cmd: "get-user"
      }, { id }
    );
    const user = await firstValueFrom(ob$).catch(err => console.log(err));

    return user
  }

  async createConversation(userId :string , friendId : string){
    const user : UserEntity = await this.getUser(userId)
    const friend : UserEntity = await this.getUser(friendId)
    if(!user || !friend) return 

    const conversation = await this.conversationRepo
    .createQueryBuilder('conversation')
    .leftJoinAndSelect('conversation.users' ,'users')
    .where('conversation.users = :userId', {userId})
    .andWhere('conversation.users = :friendId', {friendId})
    .execute()
    
    if(!conversation){
      return await this.conversationRepo.save({
        users : [user, friend]
      })
    }

    return conversation
  }

  async getConversations(userId : string ){
    const allConversation : ConversationEntity[] = await this.conversationRepo
    .createQueryBuilder('conversation')
    .leftJoinAndSelect('conversation.users', 'users')
    .where('conversation.users =:userId', {userId} )
    .getMany()

    return allConversation
   
  }



}
