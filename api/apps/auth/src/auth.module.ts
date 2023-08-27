import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DeviceSessionEntity, PostgresDbModule, RedisModule, SharedModule, UserEntity } from '@app/shared';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeviceSessionService } from './devicesession.service';
import { FriendRequestEntity } from '@app/shared/entities/friend_request.entity';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: '.env'
  }), SharedModule,
    PostgresDbModule,RedisModule,
  TypeOrmModule.forFeature([UserEntity, DeviceSessionEntity, FriendRequestEntity])
  ],
  controllers: [AuthController],
  providers: [AuthService, DeviceSessionService],
  exports : [AuthService]
})
export class AuthModule { }
