import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-yet";
import { RedisService } from "../services/redis.service";

@Module({
    imports: [CacheModule.registerAsync({
        isGlobal : true,
        inject : [ConfigService],
        useFactory : async (configService : ConfigService) =>({
            store : await redisStore({
                url : configService.get('REDIS_URI')
            })
        })
    })],
    providers : [RedisService],
    exports : [RedisService]
})
export class RedisModule{

}