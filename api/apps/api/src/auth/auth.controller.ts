import { AddFriendRequestDTO, AuthGuard, LogOutDTO, Metadata, ReAuthDTO, SignInDTO, SignUpDTO, StatusAddFriend, UserId } from '@app/shared';
import { Body, Controller, Inject, Post, Req, Headers, Get, UseGuards, Param } from '@nestjs/common';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { catchError, throwError } from 'rxjs';
let CircularJSON = require('circular-json')
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(@Inject('AUTH_SERVICE') private readonly authService : ClientProxy){

    }

    @Post('signUp')
    async signUp(@Body() signUpDto : SignUpDTO){
        return  this.authService.send(
            {
                cmd : 'signup'
            },
            signUpDto
        )
    }

    @Post('signIn')
    async signIn(@Body() signInDto : SignInDTO, @Req() req, @Headers() headers){
        
        const fingerprint = req.fingerprint;
        const ipAddress = req.connection.remoteAddress
        const ua = headers['user-agent'];
        const deviceId = fingerprint.hash
        const loginMetadata : Metadata = {deviceId, ipAddress, ua}
        const data= {signInDto, loginMetadata}
        return this.authService.send(
        {
            cmd : 'signin'
        },data
        )
    }

    
    @Post('reAuth')
    async reAuth(@Body() reAuthDto : ReAuthDTO, @Req() req){
        const deviceId = req.fingerprint.hash;
        const data = {reAuthDto, deviceId};
        return this.authService.send(
            {
                cmd:"reauth",
            },data
        )
        .pipe(catchError(error => throwError(() => new RpcException(error.response))))
    }
    
    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @Post('logOut')
    async logOut(@Body() logOutDto : LogOutDTO, @UserId() userId ){
        const {sessionId} = logOutDto
        const data = { sessionId, userId}
        return this.authService.send(
            {
                cmd:"logout",
                
            },data
            )
    }
    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @Get('getSecretKey')
    async getSecretKeyFromCache(@Req() request){
        console.log(request.headers)
        return this.authService.send(
            {
                cmd:'getsecretkeyfromcache'
            },request.headers
        )
    }
    
    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @Get('getAllUsers')
    async getAllUsers(){
        return this.authService.send({
            cmd:"getallusers"
        },{})
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @Post('add-friend/:friendId')
    async addFriend(@Param() addFriendRequestDto : AddFriendRequestDTO, @UserId() userId : string ){
        const {friendId} = addFriendRequestDto
        const data = {userId, friendId}
        return this.authService.send({
            cmd : "add-friend"
        }, data)
    }

    @UseGuards(AuthGuard)
    @ApiBearerAuth('access-token')
    @Get('getFriendRequest')
    async getFriend(@UserId() userId : string){
        return this.authService.send({
            cmd : 'get-friend-request'
        },{
            userId,
        
        })
    }

    
}
