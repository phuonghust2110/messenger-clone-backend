import { DeviceSessionEntity, Metadata, RedisService, UserEntity } from "@app/shared";
import addDay from "@app/shared/helper/addDay";
import { ForbiddenException, HttpException, HttpStatus, Inject, Injectable, UnauthorizedException, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { JwtService } from "./jwt.service";
import * as randomatic from 'randomatic'
import { randomUUID } from "crypto";
import { RpcException } from "@nestjs/microservices";

const EXP_REFRESHTOKEN = 7
const EXP_REFRESHTOKEN_MILIS = 7 * 24 * 3600 * 1000
@Injectable()
export class DeviceSessionService {
    constructor(@InjectRepository(DeviceSessionEntity) private deviceSessionRepo: Repository<DeviceSessionEntity>,
        private dataSource: DataSource,
        @Inject(RedisService) private redisService: RedisService
    ) {

    }

    async logOut(sessionId: string, userId: string) {
        const session: any = await this.deviceSessionRepo
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.user', 'users')
            .select(['session', 'users.id'])
            .where('session.id = :sessionId', { sessionId })
            .getOne()
        if (!session || session.user.id !== userId) {
            return new ForbiddenException()
        }

        

        const keyCacheRf = this.keyRf(userId, session.deviceId);
        const keyCacheSk = this.keySk(userId, session.deviceId);
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await this.redisService.set(keyCacheRf, null);
            await this.redisService.set(keyCacheSk, null );
            await this.deviceSessionRepo.delete(sessionId);

            await queryRunner.commitTransaction()

        } catch (e) {
            throw new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR)
        }

        

        return session
    }

    async reAuth(deviceId: string, _refreshToken: string) {
        const session: any = await this.deviceSessionRepo
            .createQueryBuilder('session')
            .leftJoinAndSelect('session.user', 'users')
            .select(['session', 'users.id'])
            .where('session.deviceId = :deviceId', { deviceId })
            .getOne()
        const keyCacheRf = this.keyRf(session.user.id, deviceId)
        const isRefreshToken = await this.redisService.get(keyCacheRf);
        if (!session || !isRefreshToken || isRefreshToken !== _refreshToken) {
            return new UnauthorizedException('RefreshToken invalid')
        }

        const payload = {
            userId: session.user.id,
            deviceId
        }
        const secretKey = this.generateSecretKey()
        const [token, refreshToken, expiredAt] = [JwtService.generate(payload, secretKey), randomatic('Aa0', 32), addDay(7)]
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            await queryRunner.manager.getRepository(DeviceSessionEntity).update(session.id, {
                secretKey,
                refreshToken,
                expiredAt
            })
            await this.redisService.set(keyCacheRf, refreshToken, EXP_REFRESHTOKEN_MILIS)
            await queryRunner.commitTransaction()
            return { token, refreshToken, expiredAt }
        } catch (e) {
            queryRunner.rollbackTransaction()
            throw e
        } finally {
            queryRunner.release()
        }

    }

    async handleDeviceSession(userId: string, loginMetadata: Metadata) {

        const { deviceId, ipAddress, ua } = loginMetadata
        const currentUser = await this.deviceSessionRepo.findOne({ where: { deviceId } })
        const expiredAt = addDay(EXP_REFRESHTOKEN)
        const payload = {
            userId,
            deviceId
        }

        const secretKey = this.generateSecretKey()
        const [token, refreshToken] = [JwtService.generate(payload, secretKey), randomatic("Aa0", 32)]
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            const newDeviceSession = new DeviceSessionEntity()
            newDeviceSession.deviceId = deviceId;
            newDeviceSession.secretKey = secretKey;
            newDeviceSession.refreshToken = refreshToken;
            newDeviceSession.expiredAt = expiredAt;
            newDeviceSession.ipAdress = ipAddress;
            newDeviceSession.ua = ua
            newDeviceSession.user = userId

            await queryRunner.manager.getRepository(DeviceSessionEntity).save({
                id: currentUser?.id || randomUUID(),
                ...newDeviceSession
            })
            const keyCacheRf = this.keyRf(userId, deviceId)
            await this.redisService.set(keyCacheRf, refreshToken, EXP_REFRESHTOKEN_MILIS)
            await queryRunner.commitTransaction()
            return { message : HttpStatus.OK, token, refreshToken, expiredAt }
        } catch (e) {
            await queryRunner.rollbackTransaction()
            console.log(e)
        } finally {
            await queryRunner.release()
        }
    }

    async getSecretKeyFromCache(headers) {
        // const headers = request.headers
        const payload: any = JwtService.decode(headers)
        const { userId, deviceId, exp } = payload
        const keySk = this.keySk(userId, deviceId)
        const skFromCache = await this.redisService.get(keySk);
        if (skFromCache) return skFromCache
        else {

            const { secretKey }: any = await this.deviceSessionRepo
                .createQueryBuilder('session')
                .where('session.deviceId = :deviceId', { deviceId })
                .andWhere('session.userId = :userId', { userId })
                .getOne()
            await this.redisService.set(keySk, secretKey, (exp - Math.floor(Date.now() / 1000)) * 1000)
            return secretKey
        }
    }

    async verifyToken(headers) {
        const secretKey = await this.getSecretKeyFromCache(headers)
        console.log(secretKey)
        const token = headers['authorization'].replace('Bearer ', '')
        try {
            const payload: any = JwtService.verify(token, secretKey)
            console.log('payload : ', payload)
            const { userId, exp } = payload
            return { userId, exp }
        } catch (e) {
            return new UnauthorizedException('signature invalid')
        }
    }

    generateSecretKey(length = 16) {
        return randomatic("Aa0", length)
    }

    keyRf(userId: string, deviceId: string): string {
        return `rf-${userId}-${deviceId}`
    }

    keySk(userId: string, deviceId: string): string {
        return `sk-${userId}-${deviceId}`
    }
}