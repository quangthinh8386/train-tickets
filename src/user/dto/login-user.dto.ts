import { IsNotEmpty, MinLength } from "class-validator";

export class LoginUserDto {
        @IsNotEmpty({message: "username not empty"})
        accountname: string;
    
        @IsNotEmpty({message: "password not empty"})
        password: string;
}