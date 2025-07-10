export class Category{
    id: number;
    name: string | null;
    description: string | null;
    isActive: boolean;
    createdAt: string; // format: date-time

    constructor() {
        this.id = 0;
        this.name = null;
        this.description = null;
        this.isActive = false;
        this.createdAt = "";
    }
}
