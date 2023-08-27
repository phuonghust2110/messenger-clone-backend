import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../entities/user.entity";
import { DeviceSessionEntity } from "../entities/devicesession.entity";
import { FriendRequestEntity } from "../entities/friend_request.entity";
import { MessageEntity } from "../entities/message.entity";
import { ConversationEntity } from "../entities/conversation.entity";

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('POSTGRES_HOST'),
                port: configService.get('POSTGRES_PORT'),
                username: configService.get('POSTGRES_USER'),
                password: configService.get('POSTGRES_PASSWORD'),
                database: configService.get('POSTGRES_DB'),
                entities:[UserEntity, DeviceSessionEntity, FriendRequestEntity, MessageEntity, ConversationEntity],
                autoLoadEntities : true,
                synchronize: true
            })
        })]
})

export class PostgresDbModule {}