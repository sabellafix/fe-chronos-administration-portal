export class Rol{
    id : number;
    code : string;
    name : string;
    description : string;
    active : boolean;
    reserved : boolean;
    defaultValue : boolean;
    createdAt : Date;
    updatedAt : Date;

    constructor() {
        this.id = 0;
        this.code = "";
        this.name = "";
        this.description = "";
        this.active = false;
        this.reserved = false;
        this.defaultValue = false;
        this.createdAt = new Date();
        this.updatedAt = new Date();        
    }
}