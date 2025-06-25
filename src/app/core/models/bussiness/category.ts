export class Category{
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    createdAt: string;

    constructor() {
        this.id = 0;
        this.name = "";
        this.description = "";
        this.isActive = false;
        this.createdAt = "";
    }
}
