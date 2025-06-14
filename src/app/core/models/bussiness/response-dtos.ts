import { User } from './user';

export class LoginResponseDto {
    token: string;
    user: User;
    expiresAt: string;

    constructor() {
        this.token = "";
        this.user = new User();
        this.expiresAt = "";
    }
} 