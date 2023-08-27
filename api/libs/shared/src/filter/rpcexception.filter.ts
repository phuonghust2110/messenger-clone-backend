import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { Response, Request } from 'express';
import { RpcException } from "@nestjs/microservices";

@Catch(RpcException)
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const error: any = exception.getError();
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    response
      .status(error.statusCode)
      .json(error);
  }
}
