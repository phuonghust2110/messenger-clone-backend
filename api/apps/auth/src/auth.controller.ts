import { Controller, Get, Inject, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import {  SharedService, SignInDTO, SignUpDTO } from '@app/shared';
import { JwtService } from './jwt.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,
    @Inject(SharedService) private shareService: SharedService) { }

  

  @MessagePattern({ cmd: 'signup' })
  async SignUp(@Ctx() context: RmqContext, @Payload() signUpDto: SignUpDTO) {
    this.shareService.acknowledgeMessage(context);
    return await this.authService.signUp(signUpDto)
  }

  @MessagePattern({ cmd: 'signin' })
  async SignIn(@Ctx() context: RmqContext, @Payload() data) {
    this.shareService.acknowledgeMessage(context);
    const { signInDto, loginMetadata } = data
    return await this.authService.signIn(signInDto, loginMetadata)

  }
  @MessagePattern({cmd : 'reauth'})
  async reAuth(@Ctx() context : RmqContext, @Payload() data){
    this.shareService.acknowledgeMessage(context);
    const {reAuthDto, deviceId} = data
    const {_refreshToken} = reAuthDto
    return await this.authService.reAuth(deviceId, _refreshToken)
  }

  @MessagePattern({cmd:'logout'})
  logOut(@Ctx() context : RmqContext, @Payload() data){
    this.shareService.acknowledgeMessage(context);
    const { sessionId,userId} = data
    return  this.authService.logOut(sessionId, userId)
  }

  @MessagePattern({cmd:'getsecretkeyfromcache'})
  async getSecretKeyFromCache(@Ctx() context : RmqContext, @Payload() data){
    this.shareService.acknowledgeMessage(context)
    return await this.authService.getSecretKeyFromCache(data)
  }

  @MessagePattern({cmd :'verify-token'})
  async verifyToken(@Ctx() context : RmqContext, @Payload() headers){
    this.shareService.acknowledgeMessage(context)
    return await this.authService.verifyToken(headers)
  }
  
  @MessagePattern({cmd : 'getallusers'})
  async getAllUsers(@Ctx() context : RmqContext){
    this.shareService.acknowledgeMessage(context)
    return await this.authService.getAllUsers();
  }

  @MessagePattern({cmd : 'add-friend'})
  async addFriend(@Ctx() context : RmqContext, @Payload() data ){
    const {userId, friendId} = data
    this.shareService.acknowledgeMessage(context)
    return await this.authService.addFriend(userId, friendId)
  }

  @MessagePattern({cmd : 'get-friend-request'})
  async getFriendRequest(@Ctx() context : RmqContext, @Payload() data){
    const {userId} = data
    this.shareService.acknowledgeMessage(context)
    return await this.authService.getFriendRequest(userId)
  }
  
  @MessagePattern({cmd : 'decode-token'})
  async decodeToken (@Ctx() context : RmqContext, @Payload() data){
    const {token} = data
    this.shareService.acknowledgeMessage(context)
    return JwtService.decodeToken(token)
  }

  @MessagePattern({cmd : 'get-user'})
  async getUser (@Ctx() context : RmqContext, @Payload() data){
    const {id} = data
    this.shareService.acknowledgeMessage(context)
    return await this.authService.getUserById(id)
  }

  @MessagePattern({cmd : 'accept-friend-request'})
  async updateFriendRequest(@Ctx() context : RmqContext, @Payload() data){
    const {userId, status} = data
    this.shareService.acknowledgeMessage(context)
    return await this.authService.updateFriendRequest(userId, status)
  }

  // @MessagePattern({cmd : 'get-friend_list'})
  // async getFriendList(@Ctx() context : RmqContext, @Payload() data){
  //   const {userId} = data
  //   this.shareService.acknowledgeMessage(context)
  //   return await this.authService.getFriendList(userId)
  // }
}
