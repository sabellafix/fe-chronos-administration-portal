export class Permission{
    id: number;
    name: string;
    description: string;
    resource: string;
    action: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    constructor() {
        this.id = 0;
        this.name = "";
        this.description = "";
        this.resource = "";
        this.action = "";
        this.isActive = false;
        this.createdAt = "";
        this.updatedAt = "";
    }
} 