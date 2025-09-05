import { Permission } from "./permission";

export class RolePermission{
    id: number;
    roleId: number;
    permissionId: number;
    grantedAt: string;
    grantedBy: string;
    permission: Permission;
    isActive: boolean;

    constructor() {
        this.id = 0;
        this.roleId = 0;
        this.permissionId = 0;
        this.grantedAt = "";
        this.grantedBy = "";
        this.permission = new Permission();
        this.isActive = false;
    }
}