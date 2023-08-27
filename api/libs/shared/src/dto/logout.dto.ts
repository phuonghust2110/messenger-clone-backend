import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class LogOutDTO{
    @IsString()
    @IsNotEmpty()
    @ApiProperty({required:true})
    sessionId:string
}