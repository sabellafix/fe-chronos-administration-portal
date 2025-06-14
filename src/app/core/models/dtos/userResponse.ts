import { User } from "../bussiness/user";

export class UserResponse{
    token : string;
    user : User;
    expiresAt : Date;

    constructor(){
        this.token = "";
        this.user = new User();
        this.expiresAt = new Date();
    }
}