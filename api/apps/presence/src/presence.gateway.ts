import { IActiveUser, RedisService } from "@app/shared";
import { Inject } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { IResConnection } from "apps/chat/src/chat.gateway";
import { Server, Socket } from "socket.io";
import { firstValueFrom } from "rxjs";

@WebSocketGateway({cors : true, namespace : 'message'})
export class PresenceGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService : ClientProxy,
        @Inject(RedisService) private readonly redisService : RedisService
    ){

    }

    @WebSocketServer()
    server : Server

    handleDisconnect(client: Socket) {
        this.setActiveStatus(client, false)
        client.disconnect()
    }

   async  handleConnection(client: Socket) {
        const token = client.handshake.headers.authorization ?? null 
        if(!token ){
            return this.handleDisconnect(client)
        }

        const ob$ = this.authService.send({
            cmd : 'decode-token'
            }, {token})

        const res : IResConnection = await firstValueFrom(ob$).catch(err => console.log(err))
        const {userId, exp} = res
        if(exp < Math.floor(new Date().getTime() / 1000)){
            this.handleDisconnect(client)
        }

        client.data.userId = userId
        await this.setActiveStatus(client, true)
    }

    async setActiveStatus(client : Socket, isActive : boolean){
        const userId = client.data?.userId
        if(!userId  ) return 
        const activeUser : IActiveUser = {
            id : userId,
            socketId : client.id,
            isActive : isActive
        }
        
        await this.redisService.set(`userActive-${userId}`, activeUser)
        
    }

    @SubscribeMessage('updateActiveStatus')
    async updateActiveStatus(client : Socket, isActive : boolean ) {
        if(!client.data?.userId){
            return 
        }
        await this.setActiveStatus(client, isActive)
    }
}