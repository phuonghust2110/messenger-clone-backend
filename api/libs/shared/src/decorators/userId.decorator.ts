import { ExecutionContext, createParamDecorator } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
export const UserId = createParamDecorator(
    (data:string, context : ExecutionContext) =>{
        const request = context.switchToHttp().getRequest()
        return jwt.decode(request.headers['authorization'].split(" ")[1])['userId']

    }
)