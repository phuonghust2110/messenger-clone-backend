import { MessageEntity, NewMessageDTO } from "@app/shared";
import { Inject, UnauthorizedException} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { firstValueFrom } from "rxjs";
import { Server, Socket } from "socket.io";
import { ChatService } from "./chat.service";

@WebSocketGateway({cors : true, namespace : 'message'})

export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        @Inject('AUTH_SERVICE') private readonly authService : ClientProxy,
        @Inject(ChatService) private chatService : ChatService
    ){

    }

    @WebSocketServer()
    server : Server

    async handleDisconnect(client: Socket) {
        console.log("Disconnect")
    }

    async handleConnection(client: Socket) {
        console.log(`Connection with id : ${client.id}`)
        const token = client.handshake.headers['authorization'] ?? null 
        if(!token){
            console.log("there isn't token ")
            client.disconnect(true)
        }

        const ob$ = this.authService.send(
            {
                cmd : "decode-token"
            },{token}
        )
        const res : IResConnection = await firstValueFrom(ob$).catch(err => console.log(err))
        const {userId, deviceId, exp } = res
        if(exp < Math.floor(new Date().getTime() / 1000)){
            console.log('token invalid')
           client.disconnect(true)
        }
            client.data.userId = userId 
            
    }

    @SubscribeMessage('sendMessage')
    async sendMessage(client : Socket, newMessageDto : NewMessageDTO){
        if(!newMessageDto) return 
        const userId = client.data.userId
        if(!userId) return 
        
        const createMessage : MessageEntity = await this.chatService.createMessage(newMessageDto, userId)
        const friendId = createMessage.conversation.users.find((user) => user.id !== userId).id
        
    }

    private async createConversation (userId :string , client : Socket){
        const ob2$ = this.authService.send({
            cmd :'get-friend-list'
        }, {userId})
    }
}


export interface IResConnection {
    userId : string 
    deviceId : string 
    exp : number
    iat : number

}


