import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/shared';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal:true,
    envFilePath:'.env'
  }),
  // ClientsModule.register([
  //   {
  //     name : 'AUTH_SERVICE',
  //     transport : Transport.RMQ,
  //     options: {
  //     urls : [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`],
  //     queue: process.env.RABBITMQ_AUTH_QUEUE,
  //     noAck: true,
  //     queueOptions:{
  //       durable : true
  //     }
    
      
  //     }

  //   }

  // ])
  AuthModule
],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule {}
