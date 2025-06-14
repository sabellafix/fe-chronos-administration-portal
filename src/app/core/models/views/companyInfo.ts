import { User } from "../bussiness/user";

export class CompanyInfo{
    user : User;
    accessToken : string;
    
    constructor() {        
        this.user = new User();
        this.accessToken =  "";
    }
}