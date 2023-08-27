import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard, SharedModule } from '@app/shared';

@Module({
  imports: [
  SharedModule.registerRmq('AUTH_SERVICE', process.env.RABBITMQ_AUTH_QUEUE),

  ],
  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}
