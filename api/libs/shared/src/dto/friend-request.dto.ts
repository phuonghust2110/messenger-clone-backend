import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AddFriendRequestDTO {
    @IsNotEmpty()
    @ApiProperty()
    friendId : string
}