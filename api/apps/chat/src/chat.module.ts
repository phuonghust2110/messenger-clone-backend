import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigModule } from '@nestjs/config';
import { ConversationEntity, FriendRequestEntity, MessageEntity, PostgresDbModule, RedisModule, SharedModule } from '@app/shared';
import { ChatGateWay } from './chat.gateway';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }), SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),
  SharedModule.registerRmq('PRESENCE_SERVICE', process.env.RABBITMQ_PRESENCE_QUEUE),
    PostgresDbModule,
    RedisModule,
    TypeOrmModule.forFeature([MessageEntity, FriendRequestEntity, ConversationEntity])

  ],
  controllers: [ChatController, ],
  providers: [ChatService,ChatGateWay],
})
export class ChatModule { }
