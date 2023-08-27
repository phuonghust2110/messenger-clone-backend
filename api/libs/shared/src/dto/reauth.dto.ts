import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ReAuthDTO{
    @IsNotEmpty()
    @ApiProperty()
    _refreshToken:string

}