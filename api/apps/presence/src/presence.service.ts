import { IActiveUser, RedisService } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  constructor(@Inject(RedisService) private redisService : RedisService){

  }
  getHello(): string {
    return 'Hello World!';
  }

  async getActiveUser(id : string ){
    const user =  await this.redisService.get(`userActive-${id}`)
    return user as IActiveUser | undefined
  }
}
