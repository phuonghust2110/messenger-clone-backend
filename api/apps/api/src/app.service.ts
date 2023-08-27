import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    console.log(process.env.RABBITMQ_PASS)
  }
}
