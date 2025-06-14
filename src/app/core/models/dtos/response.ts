import { Validation } from "./validation";

export class Response{
    status : number;
    entityTypeName : string;
    message : string;
    code : string;
    validation : Validation[];

    constructor() {
        this.status = 0;
        this.entityTypeName = "";
        this.message = "";
        this.code = "";
        this.validation = [];
    }
}