import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import { JwtService } from "apps/auth/src/jwt.service";

 export const DeviceId = createParamDecorator(
    (data:string, context : ExecutionContext) =>{
        const request = context.switchToHttp().getRequest()
        return JwtService.decode(request.headers)['deviceId']
    }
 )