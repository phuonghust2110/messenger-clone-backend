import { Metadata, ReAuthDTO, SignInDTO, SignUpDTO, UserEntity } from '@app/shared';
import { ConflictException, HttpException, HttpStatus, Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt'
import { DeviceSessionService } from './devicesession.service';
import { FriendRequestEntity, StatusAddFriend } from '@app/shared/entities/friend_request.entity';
@Injectable()
export class AuthService {
  constructor(@InjectRepository(UserEntity)private userRepo : Repository<UserEntity>,
  @InjectRepository(FriendRequestEntity)private friendRequestRepo : Repository<FriendRequestEntity>,
              @Inject( DeviceSessionService) private deviceSessionService : DeviceSessionService
  ){

  }
  async getAllUsers(){
    return await this.userRepo.find();
  }
  async signUp(signUpDto : SignUpDTO) {
    const {email, password, firstName, lastName} = signUpDto
    const user = await this.userRepo.findOne({where :{email}});
    if(user){
      return new ConflictException('This email has already exist');
    }else{
      try{
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt)
        const newUser = new UserEntity()
        newUser.email = email;
        newUser.password = hashPassword;
        newUser.firstName = firstName;
        newUser.lastName = lastName;
        await this.userRepo.save(newUser);
        return newUser
      }catch(e){
        throw e 
      }
    }
  }

  async signIn(signInDto : SignInDTO, loginMetadata : Metadata) {
    const {email, password} = signInDto
    const user = await this.userRepo.findOne({where : {email}});
    if(!user || !(await bcrypt.compare(password, user.password)) ){
      return  new UnauthorizedException("Email or password incorrect")
    }else{

      return await this.deviceSessionService.handleDeviceSession(user.id,loginMetadata )
    }
    
  }

  async reAuth(deviceId:string, _refreshToken:string) {
    return await this.deviceSessionService.reAuth(deviceId, _refreshToken);
  }

  async logOut(sessionId:string, userId:string){
    return  await this.deviceSessionService.logOut(sessionId, userId)
  }

  async getSecretKeyFromCache(headers){
    return await this.deviceSessionService.getSecretKeyFromCache(headers)
  }
  async getUserById(id:string) {
    return await this.userRepo.findOne({where :{id}})
  }

  async verifyToken(headers){
    return await this.deviceSessionService.verifyToken(headers)
  }

  async addFriend(userId : string, friendId :string) : Promise<FriendRequestEntity>{
    const creator : UserEntity = await this.getUserById(userId);
    const receiver : UserEntity = await this.getUserById(friendId);
    return await this.friendRequestRepo.save({
      creator,
      receiver,
    })

  }

  async getFriendRequest(userId :string ) : Promise<FriendRequestEntity[]> {
    console.log( "userId : ", userId)
    const friend =  await this.friendRequestRepo
      .createQueryBuilder('friend')
      .leftJoinAndSelect('friend.receiver', 'users')
      .where('friend.receiver_id= :userId', {userId})
      .getMany()
      return friend
  }

  async updateFriendRequest(userId : string , status : StatusAddFriend ){
    try{
      await this.friendRequestRepo.update(userId, {
        status
      })
      return {message : "success"}
    }catch(e){
      throw e
    }
  }

  async deleteFriendRequest(userId :string ){
    try{
      await this.friendRequestRepo.delete(userId)
    return {message : "success"}
    }catch(e){
      throw e 
    }
    
  }

}
