import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { ConfigService } from '@nestjs/config';
import { SharedService } from '@app/shared';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);

  


  const configService = app.get(ConfigService);
  const sharedService = app.get(SharedService);

  const queue = configService.get('RABBITMQ_AUTH_QUEUE')
  // app.connectMicroservice<MicroserviceOptions>({
  //   transport : Transport.RMQ,
  //   options: {
  //     urls : [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASS}@${process.env.RABBITMQ_HOST}`],
  //     noAck : true,
  //     queue:process.env.RABBITMQ_AUTH_QUEUE,
  //     queueOptions:{
  //         durable : true
  //     }
  //   }
  // })
  app.useGlobalPipes(new ValidationPipe())
  app.connectMicroservice(sharedService.getRmqOptions(queue));
  app.startAllMicroservices()

}
bootstrap();
