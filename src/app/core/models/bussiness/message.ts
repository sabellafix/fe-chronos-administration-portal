export class Message {
    userId: string;
    message: string;
    createdAt: Date;

    constructor() {
        this.userId = '';
        this.message = '';
        this.createdAt = new Date();
    }
}
