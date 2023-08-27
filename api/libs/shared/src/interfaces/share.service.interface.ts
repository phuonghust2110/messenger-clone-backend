import { RmqContext, RmqOptions } from "@nestjs/microservices";

export interface ShareServiceInterface{
    getRmqOptions(queue : string) : RmqOptions
    acknowledgeMessage(context:RmqContext):void
}