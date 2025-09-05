import { RolePermission } from "./rolePermission";

export class Rol{
    id : number;
    code : string;
    name : string;
    description : string;
    isSystemRole : boolean;
    isActive : boolean;
    rolePermissions : RolePermission[];
    createdAt : string;
    updatedAt : string;


    constructor() {
        this.id = 0;
        this.code = "";
        this.name = "";
        this.description = "";
        this.isSystemRole = false;
        this.isActive = false;
        this.rolePermissions = [];
        this.createdAt = "";
        this.updatedAt = "";        
    }
}