import { ForbiddenException } from "@nestjs/common";

export class blockException extends ForbiddenException{
    constructor(IsBlocked:string){
        super(`Forbidden, user is blocked`)
    }
}