import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ClientProxy } from "@nestjs/microservices";
import { JwtService } from "apps/auth/src/jwt.service";
import { Observable, catchError, of, switchMap } from "rxjs";

@Injectable()
export class AuthGuard implements CanActivate{
    constructor(
        @Inject('AUTH_SERVICE') private authService : ClientProxy){

    }


     canActivate(context: ExecutionContext):  boolean | Promise<boolean> | Observable<boolean>  {
        const request = context.switchToHttp().getRequest()
        const headers = request.headers
        const token = request.headers['authorization'] || null ;
        if(!token) throw new UnauthorizedException();
        const checkDeviceId = request.fingerprint.hash
        if(checkDeviceId !== JwtService.decode(request.headers)['deviceId']){
            throw new UnauthorizedException('Token is invalid for this device')
        }
        try{
            return this.authService.send({cmd: 'verify-token'}, headers).pipe(
                switchMap(({exp}) =>{
                    if(!exp) return of(false)

                const TOKEN_EXP_SECOND = exp ;
                const isJwtValid = TOKEN_EXP_SECOND > Math.floor(Date.now()/1000)
                return of(isJwtValid)

                }),
                catchError(() => {
                    throw new ForbiddenException("You don't have permission")
                })

            )
           
        }catch(e){
            throw e 
            
        }

      
    }
}

